import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch, IdentityType, SignalId } from '@/data/aging-choice/agingData';
import type { BudgetTier, CareLevel, MedicalNeed } from '@/data/aging-choice/careLevels';
import { syncToolState, fetchToolState } from '@/lib/sync-tool-state';

export const AGING_CHOICE_STORAGE_KEY = 'wp-aging-choice';

/** 云端同步用的 key（progress 表 category='tool-state'） */
const CLOUD_KEY = 'aging-choice';

/** 报告 A 流程：0 身份 / 1 硬信号 / 2 五维 / 3 报告 */
export type WizardStep = 0 | 1 | 2 | 3;

/** 报告 B 流程：0 护理等级 / 1 医疗需求 / 2 预算档 / 3 报告 B */
export type Stage3Step = 0 | 1 | 2 | 3;

interface AgingChoiceState {
  /** null = 还在入口分流页，没选路 */
  branch: Branch | null;
  identity: IdentityType | null;
  signals: Partial<Record<SignalId, boolean>>;
  /** questionId → 分值 */
  answers: Partial<Record<string, number>>;
  step: WizardStep;
  completedAt: string | null;

  /* ── 机构侧（报告 B） ── */
  /** 机构侧当前屏：overview = 五类速览，check = 自查流程 */
  facilityView: 'overview' | 'check';
  careLevel: CareLevel | null;
  medicalNeeds: MedicalNeed[];
  budgetTier: BudgetTier;
  stage3Step: Stage3Step;
  /** 参访清单里勾过的问句 */
  checkedQuestions: Record<string, boolean>;
  /** 本地最后修改时间（云端合并用，不参与界面） */
  lastUpdated: number;

  setBranch: (b: Branch) => void;
  setIdentity: (v: IdentityType) => void;
  toggleSignal: (id: SignalId, value: boolean) => void;
  setAnswer: (questionId: string, score: number) => void;
  setStep: (step: WizardStep) => void;
  complete: () => void;
  reset: () => void;

  setCareLevel: (level: CareLevel) => void;
  toggleMedicalNeed: (need: MedicalNeed) => void;
  setBudgetTier: (tier: BudgetTier) => void;
  setStage3Step: (step: Stage3Step) => void;
  setFacilityView: (view: 'overview' | 'check') => void;
  toggleQuestion: (id: string) => void;
  resetStage3: () => void;
}

const initialStage3 = {
  facilityView: 'overview' as 'overview' | 'check',
  careLevel: null as CareLevel | null,
  medicalNeeds: [] as MedicalNeed[],
  budgetTier: 'unknown' as BudgetTier,
  stage3Step: 0 as Stage3Step,
  checkedQuestions: {} as Record<string, boolean>,
};

const initial = {
  branch: null as Branch | null,
  identity: null as IdentityType | null,
  signals: {} as Partial<Record<SignalId, boolean>>,
  answers: {} as Partial<Record<string, number>>,
  step: 0 as WizardStep,
  completedAt: null as string | null,
  lastUpdated: 0,
  ...initialStage3,
};

export const useAgingChoiceStore = create<AgingChoiceState>()(
  persist(
    (set) => ({
      ...initial,
      setBranch: (branch) => set({ branch, lastUpdated: Date.now() }),
      setIdentity: (v) => set({ identity: v, lastUpdated: Date.now() }),
      toggleSignal: (id, value) =>
        set((state) => ({
          signals: { ...state.signals, [id]: value },
          lastUpdated: Date.now(),
        })),
      setAnswer: (questionId, score) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: score },
          lastUpdated: Date.now(),
        })),
      setStep: (step) => set({ step, lastUpdated: Date.now() }),
      complete: () =>
        set({ completedAt: new Date().toISOString(), step: 3, lastUpdated: Date.now() }),
      reset: () => set({ ...initial, lastUpdated: Date.now() }),

      setCareLevel: (level) => set({ careLevel: level, lastUpdated: Date.now() }),
      // 「没有特殊医疗需求」与其他选项互斥
      toggleMedicalNeed: (need) =>
        set((state) => {
          if (need === 'none') return { medicalNeeds: ['none'], lastUpdated: Date.now() };
          const withoutNone = state.medicalNeeds.filter((m) => m !== 'none');
          const next = withoutNone.includes(need)
            ? withoutNone.filter((m) => m !== need)
            : [...withoutNone, need];
          return { medicalNeeds: next, lastUpdated: Date.now() };
        }),
      setBudgetTier: (tier) => set({ budgetTier: tier, lastUpdated: Date.now() }),
      setStage3Step: (stage3Step) => set({ stage3Step, lastUpdated: Date.now() }),
      setFacilityView: (facilityView) => set({ facilityView, lastUpdated: Date.now() }),
      toggleQuestion: (id) =>
        set((state) => ({
          checkedQuestions: { ...state.checkedQuestions, [id]: !state.checkedQuestions[id] },
          lastUpdated: Date.now(),
        })),
      resetStage3: () => set({ ...initialStage3, lastUpdated: Date.now() }),
    }),
    {
      name: AGING_CHOICE_STORAGE_KEY,
      version: 1,
      merge: (persisted, current) => {
        const saved = persisted as Partial<AgingChoiceState> | undefined;
        return {
          ...current,
          ...saved,
          signals: { ...(saved?.signals ?? {}) },
          answers: { ...(saved?.answers ?? {}) },
          medicalNeeds: [...(saved?.medicalNeeds ?? [])],
          checkedQuestions: { ...(saved?.checkedQuestions ?? {}) },
          budgetTier: saved?.budgetTier ?? 'unknown',
          facilityView: saved?.facilityView ?? 'overview',
          stage3Step: typeof saved?.stage3Step === 'number' ? saved.stage3Step : 0,
          // 旧数据没有 branch：已经填过内容的视为走过居家自测，未填过的回入口页
          branch: saved?.branch ?? (saved?.identity || saved?.answers ? 'home' : null),
          step: typeof saved?.step === 'number' ? (saved.step as WizardStep) : current.step,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        // 水合完成后拉云端：云端较新才覆盖，否则保留本机进度
        fetchToolState('tool-state', CLOUD_KEY)
          .then((cloud) => {
            if (!cloud) return;
            const c = cloud as Partial<AgingChoiceState>;
            const cloudTime = typeof c.lastUpdated === 'number' ? c.lastUpdated : 0;
            if (cloudTime <= (state.lastUpdated ?? 0)) return;

            adoptingCloud = true;
            useAgingChoiceStore.setState({
              ...c,
              signals: { ...(c.signals ?? state.signals) },
              answers: { ...(c.answers ?? state.answers) },
              medicalNeeds: Array.isArray(c.medicalNeeds)
                ? [...c.medicalNeeds]
                : state.medicalNeeds,
              checkedQuestions: { ...(c.checkedQuestions ?? state.checkedQuestions) },
              lastUpdated: cloudTime,
            });
            adoptingCloud = false;
          })
          .catch(() => {
            // 拉取失败保持本地进度
          });
      },
    }
  )
);

/** 参与云端同步的字段（不含方法，避免把函数序列化进 JSONB） */
function snapshot(s: AgingChoiceState) {
  return {
    branch: s.branch,
    identity: s.identity,
    signals: s.signals,
    answers: s.answers,
    step: s.step,
    completedAt: s.completedAt,
    facilityView: s.facilityView,
    careLevel: s.careLevel,
    medicalNeeds: s.medicalNeeds,
    budgetTier: s.budgetTier,
    stage3Step: s.stage3Step,
    checkedQuestions: s.checkedQuestions,
    lastUpdated: s.lastUpdated,
  };
}

/** 从云端取回数据时的写入标记：避免把「读回来的」又当成「用户改的」同步回去 */
let adoptingCloud = false;

// 单一订阅点做云端同步（syncToolState 内部已 1.5s 防抖，且只在登录时发请求）
useAgingChoiceStore.subscribe((state) => {
  if (adoptingCloud) return;
  // 什么都没填就别落库，避免把「点进来看一眼」也存成云端进度
  if (state.branch === null && state.identity === null && state.careLevel === null) return;
  syncToolState('tool-state', CLOUD_KEY, snapshot(state));
});
