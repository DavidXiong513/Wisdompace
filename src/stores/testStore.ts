import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestState } from '@/types/mbti';
import { syncToolState, fetchToolState } from '@/lib/sync-tool-state';

// ── Types ──────────────────────────────────────────────────────────────────

interface TestStoreState extends TestState {
  // Actions
  setAnswer: (questionId: number, answer: 'A' | 'B') => void;
  setCurrentPage: (page: number) => void;
  resetTest: () => void;
  
  // Computed getters
  answeredCount: () => number;
  isPageComplete: (page: number, questionsPerPage: number) => boolean;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_TEST_STATE: TestState = {
  testType: 'mbti',
  currentPage: 0,
  answers: {},
  startTime: Date.now(),
  lastUpdated: Date.now(),
};

// ── Store ──────────────────────────────────────────────────────────────────

export const useTestStore = create<TestStoreState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_TEST_STATE,

      setAnswer: (questionId, answer) => {
        set((state) => ({
          answers: { ...state.answers, [questionId]: answer },
          lastUpdated: Date.now(),
        }));
        // 防抖同步到云端
        const currentState = get();
        syncToolState('tool-state', 'mbti-test', {
          answers: currentState.answers,
          currentPage: currentState.currentPage,
          lastUpdated: currentState.lastUpdated,
        });
      },

      setCurrentPage: (page) => {
        set({
          currentPage: page,
          lastUpdated: Date.now(),
        });
        // 防抖同步到云端
        const currentState = get();
        syncToolState('tool-state', 'mbti-test', {
          answers: currentState.answers,
          currentPage: currentState.currentPage,
          lastUpdated: currentState.lastUpdated,
        });
      },

      resetTest: () => {
        set({
          ...DEFAULT_TEST_STATE,
          startTime: Date.now(),
          lastUpdated: Date.now(),
        });
      },

      answeredCount: () => {
        const state = get();
        return Object.keys(state.answers).length;
      },

      isPageComplete: (page, questionsPerPage) => {
        const state = get();
        const startQuestion = page * questionsPerPage + 1;
        const endQuestion = Math.min(startQuestion + questionsPerPage - 1, 93);
        
        for (let i = startQuestion; i <= endQuestion; i++) {
          if (!state.answers[i]) {
            return false;
          }
        }
        
        return true;
      },
    }),
    {
      name: 'mbti-test-state',
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        // 水合完成后，尝试从云端拉取并合并
        fetchToolState('tool-state', 'mbti-test').then((cloudState) => {
          if (!cloudState) return;
          const cloud = cloudState as { answers?: Record<number, 'A' | 'B'>; currentPage?: number; lastUpdated?: number };
          const localTime = state.lastUpdated ?? 0;
          const cloudTime = cloud.lastUpdated ?? 0;

          if (cloudTime > localTime) {
            // 云端较新，覆盖本地
            if (cloud.answers) {
              Object.entries(cloud.answers).forEach(([qId, ans]) => {
                state.setAnswer(Number(qId), ans);
              });
            }
            if (typeof cloud.currentPage === 'number') {
              state.setCurrentPage(cloud.currentPage);
            }
          }
        }).catch(() => {
          // 忽略拉取错误
        });
      },
    }
  )
);
