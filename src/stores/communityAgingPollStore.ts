'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type VoteStep = 'welcome' | 'voting' | 'report';

export interface CommunityAgingPollState {
  step: VoteStep;
  currentQIndex: number;
  answers: Record<number, string | string[]>;
  /** 已完成全部投票 */
  completed: boolean;
  /** 是否已同步到 Supabase */
  synced: boolean;
  setStep: (s: VoteStep) => void;
  setCurrentQIndex: (i: number) => void;
  setAnswer: (qIndex: number, answer: string | string[]) => void;
  setAnswers: (answers: Record<number, string | string[]>) => void;
  setSynced: (v: boolean) => void;
  reset: () => void;
}

export const useCommunityAgingPollStore = create<CommunityAgingPollState>()(
  persist(
    set => ({
      step: 'welcome',
      currentQIndex: 0,
      answers: {},
      completed: false,
      synced: false,
      setStep: step => set({ step }),
      setCurrentQIndex: i => set({ currentQIndex: i }),
      setAnswer: (qIndex, answer) =>
        set(s => ({
          answers: { ...s.answers, [qIndex]: answer },
        })),
      setAnswers: answers => set({ answers }),
      setSynced: v => set({ synced: v }),
      reset: () =>
        set({
          step: 'welcome',
          currentQIndex: 0,
          answers: {},
          completed: false,
          synced: false,
        }),
    }),
    {
      name: 'community-aging-poll',
      skipHydration: false,
    }
  )
);
