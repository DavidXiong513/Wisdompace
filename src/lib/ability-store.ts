// ==================== 能力兴趣测评状态管理 ==================== //
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AbilityAnswer, AbilityPhase } from '@/types/ability';
import { syncToolState, fetchToolState } from '@/lib/sync-tool-state';

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

  // 上次完成的批次号 (1-6)，用于批次汇总页
  lastCompletedBatch: number | null;

  // 最后更新时间（用于云端合并）
  lastUpdated: number;

  // 操作方法
  setPhase: (phase: AbilityPhase) => void;
  setUserInfo: (name: string, years: string, industry: string) => void;
  setAnchor: (good: string, bad: string) => void;
  setCurrentIndex: (idx: number) => void;
  setAnswer: (abilityId: number, p: number, i: number) => void;
  setLastCompletedBatch: (batch: number | null) => void;
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
  lastUpdated: 0,
};

export const useAbilityStore = create<AbilityState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhase: (phase) => {
        set({ phase, lastUpdated: Date.now() });
        const state = get();
        syncToolState('tool-state', 'ability', {
          phase: state.phase,
          currentIndex: state.currentIndex,
          answers: state.answers,
          lastCompletedBatch: state.lastCompletedBatch,
          lastUpdated: state.lastUpdated,
        });
      },

      setUserInfo: (name, years, industry) => {
        set({ name, years, industry, lastUpdated: Date.now() });
      },

      setAnchor: (good, bad) => {
        set({ anchorGood: good, anchorBad: bad, lastUpdated: Date.now() });
      },

      setCurrentIndex: (idx) => {
        set({ currentIndex: idx, lastUpdated: Date.now() });
        const state = get();
        syncToolState('tool-state', 'ability', {
          phase: state.phase,
          currentIndex: state.currentIndex,
          answers: state.answers,
          lastCompletedBatch: state.lastCompletedBatch,
          lastUpdated: state.lastUpdated,
        });
      },

      setAnswer: (abilityId, p, i) => {
        set((state) => ({
          answers: { ...state.answers, [abilityId]: { p, i } },
          lastUpdated: Date.now(),
        }));
        const state = get();
        syncToolState('tool-state', 'ability', {
          phase: state.phase,
          currentIndex: state.currentIndex,
          answers: state.answers,
          lastCompletedBatch: state.lastCompletedBatch,
          lastUpdated: state.lastUpdated,
        });
      },

      setLastCompletedBatch: (batch: number | null) => {
        set({ lastCompletedBatch: batch, lastUpdated: Date.now() });
        const state = get();
        syncToolState('tool-state', 'ability', {
          phase: state.phase,
          currentIndex: state.currentIndex,
          answers: state.answers,
          lastCompletedBatch: state.lastCompletedBatch,
          lastUpdated: state.lastUpdated,
        });
      },

      reset: () => set({ ...initialState, lastUpdated: Date.now() }),
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
        lastUpdated: state.lastUpdated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        fetchToolState('tool-state', 'ability').then((cloudState) => {
          if (!cloudState) return;
          const cloud = cloudState as {
            phase?: AbilityPhase;
            currentIndex?: number;
            answers?: Record<number, AbilityAnswer>;
            lastCompletedBatch?: number | null;
            lastUpdated?: number;
          };
          const localTime = state.lastUpdated ?? 0;
          const cloudTime = cloud.lastUpdated ?? 0;

          if (cloudTime > localTime) {
            if (cloud.phase) state.setPhase(cloud.phase);
            if (typeof cloud.currentIndex === 'number') state.setCurrentIndex(cloud.currentIndex);
            if (cloud.answers) {
              Object.entries(cloud.answers).forEach(([id, ans]) => {
                state.setAnswer(Number(id), ans.p, ans.i);
              });
            }
            if (cloud.lastCompletedBatch !== undefined) {
              state.setLastCompletedBatch(cloud.lastCompletedBatch);
            }
          }
        }).catch(() => {
          // ignore
        });
      },
    }
  )
);
