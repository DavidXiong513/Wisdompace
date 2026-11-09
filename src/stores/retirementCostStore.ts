import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  DEFAULT_INPUT,
  DEFAULT_SPENDING_SCALES,
  RETIREMENT_COST_STORAGE_KEY,
} from '@/data/retirement-cost-calculator/defaults';
import type {
  AdjustableExpenseKey,
  RetirementCostInput,
  SpendingScales,
} from '@/types/retirement-cost-calculator';

interface RetirementCostState {
  input: RetirementCostInput;
  step: number;
  scales: SpendingScales;
  updateInput: (patch: Partial<RetirementCostInput>) => void;
  setStep: (step: number) => void;
  setScale: (key: AdjustableExpenseKey, value: number) => void;
  resetScales: () => void;
  reset: () => void;
}

export const useRetirementCostStore = create<RetirementCostState>()(
  persist(
    (set) => ({
      input: DEFAULT_INPUT,
      step: 0,
      scales: DEFAULT_SPENDING_SCALES,
      updateInput: (patch) =>
        set((state) => ({
          input: { ...state.input, ...patch },
        })),
      setStep: (step) => set({ step: Math.max(0, Math.min(4, step)) }),
      setScale: (key, value) =>
        set((state) => ({
          scales: {
            ...state.scales,
            [key]: Math.max(0.3, Math.min(1.8, value)),
          },
        })),
      resetScales: () => set({ scales: DEFAULT_SPENDING_SCALES }),
      reset: () =>
        set({
          input: DEFAULT_INPUT,
          step: 0,
          scales: DEFAULT_SPENDING_SCALES,
        }),
    }),
    {
      name: RETIREMENT_COST_STORAGE_KEY,
      version: 1,
      migrate: (persisted) => persisted as Partial<RetirementCostState>,
      merge: (persisted, current) => {
        const saved = persisted as Partial<RetirementCostState> | undefined;
        return {
          ...current,
          ...saved,
          input: { ...DEFAULT_INPUT, ...(saved?.input ?? {}) },
          scales: { ...DEFAULT_SPENDING_SCALES, ...(saved?.scales ?? {}) },
          step: typeof saved?.step === 'number' ? saved.step : current.step,
        };
      },
    }
  )
);
