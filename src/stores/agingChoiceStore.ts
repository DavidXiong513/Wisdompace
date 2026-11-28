import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch, IdentityType, SignalId } from '@/data/aging-choice/agingData';
import type { BudgetTier, CareLevel, MedicalNeed } from '@/data/aging-choice/careLevels';

export const AGING_CHOICE_STORAGE_KEY = 'wp-aging-choice';

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
  ...initialStage3,
};

export const useAgingChoiceStore = create<AgingChoiceState>()(
  persist(
    (set) => ({
      ...initial,
      setBranch: (branch) => set({ branch }),
      setIdentity: (v) => set({ identity: v }),
      toggleSignal: (id, value) =>
        set((state) => ({ signals: { ...state.signals, [id]: value } })),
      setAnswer: (questionId, score) =>
        set((state) => ({ answers: { ...state.answers, [questionId]: score } })),
      setStep: (step) => set({ step }),
      complete: () => set({ completedAt: new Date().toISOString(), step: 3 }),
      reset: () => set({ ...initial }),

      setCareLevel: (level) => set({ careLevel: level }),
      // 「没有特殊医疗需求」与其他选项互斥
      toggleMedicalNeed: (need) =>
        set((state) => {
          if (need === 'none') return { medicalNeeds: ['none'] };
          const withoutNone = state.medicalNeeds.filter((m) => m !== 'none');
          const next = withoutNone.includes(need)
            ? withoutNone.filter((m) => m !== need)
            : [...withoutNone, need];
          return { medicalNeeds: next };
        }),
      setBudgetTier: (tier) => set({ budgetTier: tier }),
      setStage3Step: (stage3Step) => set({ stage3Step }),
      setFacilityView: (facilityView) => set({ facilityView }),
      toggleQuestion: (id) =>
        set((state) => ({
          checkedQuestions: { ...state.checkedQuestions, [id]: !state.checkedQuestions[id] },
        })),
      resetStage3: () => set({ ...initialStage3 }),
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
    }
  )
);
