'use client';

import React from 'react';
import Link from 'next/link';
import { useThreeQuestionsStore } from '@/stores/threeQuestionsStore';
import { ScenarioSelector } from '@/components/tools/three-questions/ScenarioSelector';
import { QuestionFlow } from '@/components/tools/three-questions/QuestionFlow';
import { DecisionReport } from '@/components/tools/three-questions/DecisionReport';
import { getScenarioById } from '@/data/three-questions/bank';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';

export default function ThreeQuestionsPage() {
  const { 
    activeSessionId, 
    sessions, 
    createSession, 
    updateAnswer, 
    completeSession, 
    setActiveSession,
    deleteSession,
    getResults
  } = useThreeQuestionsStore();
  
  const hydrated = usePersistHydrated(useThreeQuestionsStore);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="text-sm font-medium text-[#8A7E6A] animate-pulse">正在进入三思空间...</div>
      </div>
    );
  }

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const scenario = activeSession ? getScenarioById(activeSession.scenarioId) : null;
  const result = activeSessionId ? getResults(activeSessionId) : null;

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* 顶部简易导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/chapter/chapter-3" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">三思清单</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-10">
        {!activeSessionId ? (
          <div className="space-y-10">
            <header className="text-center">
              <div className="mb-4 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
                Critical Decision Tool
              </div>
              <h2 className="text-3xl font-bold text-[#4A3728]">凡事三思而行</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8A7E6A]">
                面对重大人生抉择时，不拍脑袋、不凭冲动。<br />
                通过三个核心维度的深度追问，听见你内心最真实的共鸣。
              </p>
            </header>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#B8A888]">选择决策场景</h3>
              <ScenarioSelector 
                onSelect={(scenarioId) => createSession(scenarioId, '未命名决策')} 
              />
            </div>

            {sessions.length > 0 && (
              <div className="mt-12 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#B8A888]">以往的决策历程</h3>
                <div className="space-y-2">
                  {sessions.map(s => {
                    const sc = getScenarioById(s.scenarioId);
                    return (
                      <div key={s.id} className="flex items-center gap-3 rounded-xl border border-[#E8D9C2] bg-white p-4">
                        <span className="text-xl">{sc?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-[#4A3728] truncate">{sc?.name}</div>
                          <div className="text-[10px] text-[#8A7E6A]">{new Date(s.updatedAt).toLocaleDateString()}</div>
                        </div>
                        <button 
                          onClick={() => setActiveSession(s.id)}
                          className="text-xs font-bold text-[#C87941] hover:underline"
                        >
                          查看
                        </button>
                        <button 
                          onClick={() => deleteSession(s.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {activeSession && !activeSession.isCompleted && scenario ? (
              <QuestionFlow 
                scenario={scenario}
                initialAnswers={activeSession.answers}
                onUpdate={(qId, score) => updateAnswer(activeSessionId, qId, score)}
                onComplete={() => completeSession(activeSessionId)}
                onCancel={() => setActiveSession(null)}
              />
            ) : result ? (
              <DecisionReport 
                result={result} 
                onReset={() => deleteSession(activeSessionId)} 
              />
            ) : (
              <div className="text-center py-20 text-[#8A7E6A]">加载中...</div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-16 text-center">
        <p className="text-[10px] tracking-widest text-[#B8A888] uppercase">
          Think Twice · 做不留遗憾的人生交代
        </p>
      </footer>
    </div>
  );
}
