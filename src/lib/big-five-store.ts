import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BigFiveTestResult } from '@/types/big-five';
import { syncToolState, fetchToolState } from '@/lib/sync-tool-state';

interface BigFiveState {
  phase: 'welcome' | 'testing' | 'result';
  currentPage: number;
  answers: Record<number, number>;
  result: BigFiveTestResult | null;
  lastUpdated: number;

  // Actions
  setPhase: (phase: 'welcome' | 'testing' | 'result') => void;
  setCurrentPage: (page: number) => void;
  setAnswer: (questionId: number, value: number) => void;
  setResult: (result: BigFiveTestResult) => void;
  reset: () => void;
}

const DEFAULT_STATE = {
  phase: 'welcome' as const,
  currentPage: 1,
  answers: {},
  result: null,
  lastUpdated: Date.now(),
};

export const useBigFiveStore = create<BigFiveState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_STATE,

      setPhase: (phase) => set({ phase, lastUpdated: Date.now() }),

      setCurrentPage: (currentPage) => {
        set({ currentPage, lastUpdated: Date.now() });
        const state = get();
        syncToolState('tool-state', 'big-five', {
          answers: state.answers,
          currentPage: state.currentPage,
          lastUpdated: state.lastUpdated,
        });
      },

      setAnswer: (questionId, value) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
          lastUpdated: Date.now(),
        }));
        const state = get();
        syncToolState('tool-state', 'big-five', {
          answers: state.answers,
          currentPage: state.currentPage,
          lastUpdated: state.lastUpdated,
        });
      },

      setResult: (result) => set({ result, lastUpdated: Date.now() }),

      reset: () => set({ ...DEFAULT_STATE, lastUpdated: Date.now() }),
    }),
    {
      name: 'big-five-storage',
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        fetchToolState('tool-state', 'big-five').then((cloudState) => {
          if (!cloudState) return;
          const cloud = cloudState as { answers?: Record<number, number>; currentPage?: number; lastUpdated?: number };
          const localTime = state.lastUpdated ?? 0;
          const cloudTime = cloud.lastUpdated ?? 0;

          if (cloudTime > localTime) {
            if (cloud.answers) {
              Object.entries(cloud.answers).forEach(([qId, val]) => {
                state.setAnswer(Number(qId), val);
              });
            }
            if (typeof cloud.currentPage === 'number') {
              state.setCurrentPage(cloud.currentPage);
            }
          }
        }).catch(() => {
          // ignore
        });
      },
    }
  )
);
