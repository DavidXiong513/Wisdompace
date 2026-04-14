import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DecisionSession, DecisionResult } from '@/types/three-questions';
import { calculateDecisionResult } from '@/lib/three-questions/engine';
import { getScenarioById } from '@/data/three-questions/bank';

interface ThreeQuestionsState {
  sessions: DecisionSession[];
  activeSessionId: string | null;
  
  // Actions
  createSession: (scenarioId: string, title: string) => string;
  updateAnswer: (sessionId: string, questionId: string, score: number) => void;
  completeSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (id: string | null) => void;
  
  // Getters
  getSession: (id: string) => DecisionSession | undefined;
  getResults: (sessionId: string) => DecisionResult | null;
}

export const useThreeQuestionsStore = create<ThreeQuestionsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,

      createSession: (scenarioId, title) => {
        const id = crypto.randomUUID();
        const newSession: DecisionSession = {
          id,
          scenarioId,
          title,
          answers: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isCompleted: false
        };
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          activeSessionId: id
        }));
        return id;
      },

      updateAnswer: (sessionId, questionId, score) => {
        set((state) => {
          const newSessions = state.sessions.map(s => {
            if (s.id !== sessionId) return s;
            const otherAnswers = s.answers.filter(a => a.questionId !== questionId);
            return {
              ...s,
              answers: [...otherAnswers, { questionId, score }],
              updatedAt: new Date().toISOString()
            };
          });
          return { sessions: newSessions };
        });
      },

      completeSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map(s => 
            s.id === sessionId ? { ...s, isCompleted: true, updatedAt: new Date().toISOString() } : s
          )
        }));
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          activeSessionId: state.activeSessionId === sessionId ? null : state.activeSessionId
        }));
      },

      setActiveSession: (id) => set({ activeSessionId: id }),

      getSession: (id) => get().sessions.find(s => s.id === id),

      getResults: (sessionId) => {
        const session = get().sessions.find(s => s.id === sessionId);
        if (!session) return null;
        const scenario = getScenarioById(session.scenarioId);
        if (!scenario) return null;
        return calculateDecisionResult(scenario, session.answers, sessionId);
      }
    }),
    {
      name: 'wp-three-questions-storage',
    }
  )
);
