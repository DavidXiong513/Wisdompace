import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TestState } from '@/types/mbti';

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
      },

      setCurrentPage: (page) => {
        set({
          currentPage: page,
          lastUpdated: Date.now(),
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
    { name: 'mbti-test-state' }
  )
);
