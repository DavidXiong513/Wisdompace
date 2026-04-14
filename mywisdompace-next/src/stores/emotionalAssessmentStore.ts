import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AssessmentAnswers, AssessmentResult } from '@/types/emotional-assessment';
import { calculateAssessment } from '@/lib/emotional-assessment/engine';
import { LIFE_EVENTS } from '@/data/emotional-assessment/bank';

export type AssessmentStep = 'welcome' | 'emotion' | 'tension' | 'life_events' | 'result';

interface EmotionalAssessmentState {
  step: AssessmentStep;
  answers: AssessmentAnswers;
  result: AssessmentResult | null;
  
  // Actions
  setStep: (step: AssessmentStep) => void;
  setEmotionAnswer: (questionId: number, score: number) => void;
  setTensionAnswer: (questionId: number, score: number) => void;
  toggleLifeEvent: (eventId: number) => void;
  calculateAndSetResult: () => void;
  reset: () => void;
}

const initialAnswers: AssessmentAnswers = {
  emotion: {},
  tension: {},
  lifeEvents: [],
};

export const useEmotionalAssessmentStore = create<EmotionalAssessmentState>()(
  persist(
    (set, get) => ({
      step: 'welcome',
      answers: initialAnswers,
      result: null,

      setStep: (step) => set({ step }),

      setEmotionAnswer: (questionId, score) =>
        set((state) => ({
          answers: {
            ...state.answers,
            emotion: { ...state.answers.emotion, [questionId]: score },
          },
        })),

      setTensionAnswer: (questionId, score) =>
        set((state) => ({
          answers: {
            ...state.answers,
            tension: { ...state.answers.tension, [questionId]: score },
          },
        })),

      toggleLifeEvent: (eventId) =>
        set((state) => {
          const events = state.answers.lifeEvents;
          const newEvents = events.includes(eventId)
            ? events.filter((id) => id !== eventId)
            : [...events, eventId];
          return {
            answers: { ...state.answers, lifeEvents: newEvents },
          };
        }),

      calculateAndSetResult: () => {
        const { answers } = get();
        
        // 计算生活压力事件总分
        let lesTotalLcu = 0;
        let lesHighCount = 0;
        
        answers.lifeEvents.forEach((id) => {
          const event = LIFE_EVENTS.find((e) => e.id === id);
          if (event) {
            lesTotalLcu += event.lcu;
            if (event.lcu >= 60) {
              lesHighCount++;
            }
          }
        });

        const result = calculateAssessment(answers, lesTotalLcu, lesHighCount);
        set({ result, step: 'result' });
      },

      reset: () => set({ step: 'welcome', answers: initialAnswers, result: null }),
    }),
    {
      name: 'wp-emotional-assessment-storage',
      // 自定义 storage：OOM 防护（role-pie-chart 教训）
      storage: {
        getItem: (): string | null => {
          try {
            const raw = localStorage.getItem('wp-emotional-assessment-storage');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // 容量检查
            if (raw.length > 500000) return null; // > 500KB 视为异常
            // 结构校验
            if (!parsed?.state || typeof parsed.state !== 'object') return null;
            return raw;
          } catch {
            return null; // 坏数据直接丢弃，回退初始状态
          }
        },
        setItem: (_name: string, value: string): void => {
          localStorage.setItem('wp-emotional-assessment-storage', value);
        },
        removeItem: () => {
          localStorage.removeItem('wp-emotional-assessment-storage');
        },
      },
    }
  )
);