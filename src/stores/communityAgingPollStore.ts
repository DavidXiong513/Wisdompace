'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoteStep = 'welcome' | 'voting' | 'report';

export interface CommunityAgingPollState {
  step: VoteStep;
  currentQIndex: number;
  answers: Record<number, string | string[]>;
  /** 本地标记是否已完成全部投票 */
  completed: boolean;
  /** 操作 */
  setStep: (s: VoteStep) => void;
  setCurrentQIndex: (i: number) => void;
  setAnswer: (qIndex: number, answer: string | string[]) => void;
  reset: () => void;
}

export const useCommunityAgingPollStore = create<CommunityAgingPollState>()(
  persist(
    set => ({
      step: 'welcome',
      currentQIndex: 0,
      answers: {},
      completed: false,
      setStep: step => set({ step }),
      setCurrentQIndex: i => set({ currentQIndex: i }),
      setAnswer: (qIndex, answer) =>
        set(s => ({
          answers: { ...s.answers, [qIndex]: answer },
        })),
      reset: () =>
        set({
          step: 'welcome',
          currentQIndex: 0,
          answers: {},
          completed: false,
        }),
    }),
    {
      name: 'community-aging-poll',
      skipHydration: false,
    }
  )
);
