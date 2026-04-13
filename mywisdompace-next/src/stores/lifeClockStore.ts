import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LifeClockInput, LifeClockResult } from '@/types/life-clock';
import { calculateLifeExpectancy } from '@/lib/life-clock/engine';

interface LifeClockState {
  input: LifeClockInput;
  result: LifeClockResult | null;
  isCompleted: boolean;
  
  // Actions
  updateInput: (field: Partial<LifeClockInput>) => void;
  updateBadHabits: (habit: keyof LifeClockInput['badHabits'], value: boolean) => void;
  calculate: () => void;
  reset: () => void;
}

const DEFAULT_INPUT: LifeClockInput = {
  birthDate: '1990-01-01',
  gender: 'male',
  height: 170,
  weight: 65,
  lifespanExpectancy: 3,
  hereditaryDisease: 2,
  workRestLevel: 3,
  dietLevel: 3,
  emotionLevel: 3,
  exerciseIndex: 1,
  badHabits: {
    stayUpLate: false,
    smoking: false,
    drinking: false,
    none: true,
  },
  psychologicalState: 1,
};

export const useLifeClockStore = create<LifeClockState>()(
  persist(
    (set, get) => ({
      input: DEFAULT_INPUT,
      result: null,
      isCompleted: false,

      updateInput: (field) => {
        set((state) => ({
          input: { ...state.input, ...field }
        }));
      },

      updateBadHabits: (habit, value) => {
        set((state) => {
          const newHabits = { ...state.input.badHabits, [habit]: value };
          
          // 如果选了"以上皆无"，清空其他
          if (habit === 'none' && value) {
            return {
              input: {
                ...state.input,
                badHabits: { stayUpLate: false, smoking: false, drinking: false, none: true }
              }
            };
          }
          
          // 如果选了其他任何一个，"以上皆无"设为 false
          if (habit !== 'none' && value) {
            newHabits.none = false;
          }
          
          // 如果全部取消了，默认勾选"以上皆无"
          const anyHabit = newHabits.stayUpLate || newHabits.smoking || newHabits.drinking;
          if (!anyHabit) newHabits.none = true;

          return { input: { ...state.input, badHabits: newHabits } };
        });
      },

      calculate: () => {
        const result = calculateLifeExpectancy(get().input);
        set({ result, isCompleted: true });
      },

      reset: () => {
        set({ input: DEFAULT_INPUT, result: null, isCompleted: false });
      },
    }),
    {
      name: 'wp-life-clock-storage',
    }
  )
);
