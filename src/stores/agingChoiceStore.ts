import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch, IdentityType, SignalId } from '@/data/aging-choice/agingData';

export const AGING_CHOICE_STORAGE_KEY = 'wp-aging-choice';

/** 0 身份 / 1 硬信号 / 2 五维 / 3 报告 */
export type WizardStep = 0 | 1 | 2 | 3;

interface AgingChoiceState {
  /** null = 还在入口分流页，没选路 */
  branch: Branch | null;
  identity: IdentityType | null;
  signals: Partial<Record<SignalId, boolean>>;
  /** questionId → 分值 */
  answers: Partial<Record<string, number>>;
  step: WizardStep;
  completedAt: string | null;
  setBranch: (b: Branch) => void;
  setIdentity: (v: IdentityType) => void;
  toggleSignal: (id: SignalId, value: boolean) => void;
  setAnswer: (questionId: string, score: number) => void;
  setStep: (step: WizardStep) => void;
  complete: () => void;
  reset: () => void;
}

const initial = {
  branch: null as Branch | null,
  identity: null as IdentityType | null,
  signals: {} as Partial<Record<SignalId, boolean>>,
  answers: {} as Partial<Record<string, number>>,
  step: 0 as WizardStep,
  completedAt: null as string | null,
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
          // 旧数据没有 branch：已经填过内容的视为走过居家自测，未填过的回入口页
          branch: saved?.branch ?? (saved?.identity || saved?.answers ? 'home' : null),
          step: typeof saved?.step === 'number' ? (saved.step as WizardStep) : current.step,
        };
      },
    }
  )
);
