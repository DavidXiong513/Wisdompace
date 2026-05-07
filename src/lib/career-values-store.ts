// ==================== 生涯价值观测评状态管理 ==================== //
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CVPhase } from '@/types/career-values';

interface CareerValuesState {
  // 阶段
  phase: CVPhase;

  // 第二阶段：选出的8个价值观id
  selected8: string[];

  // 第三阶段：排出的3个价值观id [第一, 第二, 第三]
  ranked3: [string, string, string];

  // 第四阶段：造句内容
  sentence: string;

  // 第四阶段：自我评估分 1-5
  realityScore: number;

  // 操作方法
  setPhase: (phase: CVPhase) => void;
  setSelected8: (ids: string[]) => void;
  toggleSelected8: (id: string) => void;  // 切换选中/取消
  setRanked3: (ranked: [string, string, string]) => void;
  setRankedSlot: (slotIndex: 0 | 1 | 2, id: string) => void;
  clearRankedSlot: (slotIndex: 0 | 1 | 2) => void;
  setSentence: (text: string) => void;
  setRealityScore: (score: number) => void;
  reset: () => void;
}

const initialState = {
  phase: 'welcome' as CVPhase,
  selected8: [] as string[],
  ranked3: ['', '', ''] as [string, string, string],
  sentence: '',
  realityScore: 0,
};

export const useCareerValuesStore = create<CareerValuesState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setPhase: (phase) => set({ phase }),

      setSelected8: (ids) => set({ selected8: ids }),

      toggleSelected8: (id) => {
        const current = get().selected8;
        if (current.includes(id)) {
          set({ selected8: current.filter(i => i !== id) });
        } else if (current.length < 8) {
          set({ selected8: [...current, id] });
        }
      },

      setRanked3: (ranked) => set({ ranked3: ranked }),

      setRankedSlot: (slotIndex, id) => {
        const current = [...get().ranked3] as [string, string, string];
        // 如果这个id已经在其他slot中，先移除
        const existingIdx = current.indexOf(id);
        if (existingIdx !== -1 && existingIdx !== slotIndex) {
          current[existingIdx] = current[slotIndex]; // 交换
        }
        current[slotIndex] = id;
        set({ ranked3: current });
      },

      clearRankedSlot: (slotIndex) => {
        const current = [...get().ranked3] as [string, string, string];
        current[slotIndex] = '';
        set({ ranked3: current });
      },

      setSentence: (text) => set({ sentence: text }),

      setRealityScore: (score) => set({ realityScore: score }),

      reset: () => set(initialState),
    }),
    {
      name: 'career-values-storage',
      partialize: (state) => ({
        phase: state.phase,
        selected8: state.selected8,
        ranked3: state.ranked3,
        sentence: state.sentence,
        realityScore: state.realityScore,
      }),
    },
  ),
);
