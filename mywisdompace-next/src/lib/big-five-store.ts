import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BigFiveTestResult } from '@/types/big-five';

interface BigFiveState {
  phase: 'welcome' | 'testing' | 'result';
  currentPage: number;
  answers: Record<number, number>;
  result: BigFiveTestResult | null;

  // Actions
  setPhase: (phase: 'welcome' | 'testing' | 'result') => void;
  setCurrentPage: (page: number) => void;
  setAnswer: (questionId: number, value: number) => void;
  setResult: (result: BigFiveTestResult) => void;
  reset: () => void;
}

export const useBigFiveStore = create<BigFiveState>()(
  persist(
    (set) => ({
      phase: 'welcome',
      currentPage: 1,
      answers: {},
      result: null,

      setPhase: (phase) => set({ phase }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      setResult: (result) => set({ result }),
      reset: () =>
        set({
          phase: 'welcome',
          currentPage: 1,
          answers: {},
          result: null,
        }),
    }),
    {
      name: 'big-five-storage',
    }
  )
);
