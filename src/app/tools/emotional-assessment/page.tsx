'use client';

import React from 'react';
import Link from 'next/link';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useEmotionalAssessmentStore } from '@/stores/emotionalAssessmentStore';

import { WelcomeView } from '@/components/tools/emotional-assessment/WelcomeView';
import { QuestionFlow } from '@/components/tools/emotional-assessment/QuestionFlow';
import { LifeEventsGrid } from '@/components/tools/emotional-assessment/LifeEventsGrid';
import { ResultReport } from '@/components/tools/emotional-assessment/ResultReport';

export default function EmotionalAssessmentPage() {
  const { step } = useEmotionalAssessmentStore();
  const hydrated = usePersistHydrated(useEmotionalAssessmentStore);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="text-sm font-medium text-[#8A7E6A] animate-pulse">正在加载测评档案...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* 顶部简易导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/chapter/chapter-2" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回篇章
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">情绪压力自测</h1>
          <div className="w-20" /> {/* 占位平衡 */}
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {step === 'welcome' && <WelcomeView />}
        {step === 'emotion' && <QuestionFlow type="emotion" />}
        {step === 'tension' && <QuestionFlow type="tension" />}
        {step === 'life_events' && <LifeEventsGrid />}
        {step === 'result' && <ResultReport />}
      </main>

      {/* 底部寄语 */}
      <footer className="mt-16 text-center">
        <p className="text-[10px] tracking-widest text-[#B8A888] uppercase">
          SELF DISCOVERY · 遇见真实的自己
        </p>
      </footer>
    </div>
  );
}