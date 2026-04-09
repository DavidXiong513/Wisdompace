// ==================== 能力兴趣测评状态管理 ==================== //
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AbilityAnswer, AbilityPhase } from '@/types/ability';

interface AbilityState {
  // 阶段
  phase: AbilityPhase;

  // 用户信息
  name: string;
  years: string;
  industry: string;

  // 锚定基准
  anchorGood: string;   // 被认可的能力
  anchorBad: string;    // 感到吃力的方面

  // 当前答题索引 (0-41)
  currentIndex: number;

  // 评分数据: { [abilityId]: { p: 1-4, i: 1-4 } }
  answers: Record<number, AbilityAnswer>;

  // 上次完成的批次号 (1-7)，用于批次汇总页
  lastCompletedBatch: number | null;

  // 操作方法
  setPhase: (phase: AbilityPhase) => void;
  setUserInfo: (name: string, years: string, industry: string) => void;
  setAnchor: (good: string, bad: string) => void;
  setCurrentIndex: (idx: number) => void;
  setAnswer: (abilityId: number, p: number, i: number) => void;
  setLastCompletedBatch: (batch: number) => void;
  reset: () => void;
}

const initialState = {
  phase: 'welcome' as AbilityPhase,
  name: '',
  years: '',
  industry: '',
  anchorGood: '',
  anchorBad: '',
  currentIndex: 0,
  answers: {} as Record<number, AbilityAnswer>,
  lastCompletedBatch: null as number | null,
};

export const useAbilityStore = create<AbilityState>()(
  persist(
    (set) => ({
      ...initialState,

      setPhase: (phase) => set({ phase }),
      setUserInfo: (name, years, industry) => set({ name, years, industry }),
      setAnchor: (good, bad) => set({ anchorGood: good, anchorBad: bad }),
      setCurrentIndex: (idx) => set({ currentIndex: idx }),
      setAnswer: (abilityId, p, i) =>
        set((state) => ({
          answers: { ...state.answers, [abilityId]: { p, i } },
        })),
      setLastCompletedBatch: (batch) => set({ lastCompletedBatch: batch }),
      reset: () => set(initialState),
    }),
    {
      name: 'ability-test-storage',
      partialize: (state) => ({
        phase: state.phase,
        name: state.name,
        years: state.years,
        industry: state.industry,
        anchorGood: state.anchorGood,
        anchorBad: state.anchorBad,
        currentIndex: state.currentIndex,
        answers: state.answers,
        lastCompletedBatch: state.lastCompletedBatch,
      }),
    }
  )
);
