'use client';

import React from 'react';
import Link from 'next/link';
import { useLifeClockStore } from '@/stores/lifeClockStore';
import { LifeClockForm } from '@/components/tools/life-clock/LifeClockForm';
import { LifeCountdown } from '@/components/tools/life-clock/LifeCountdown';
import { LifeMonthGrid } from '@/components/tools/life-clock/LifeMonthGrid';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { LifeClockResult } from '@/types/life-clock';

// ==================== 结果展示子页面 ==================== //
function ResultView({ result, reset }: { result: LifeClockResult, reset: () => void }) {
  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="space-y-8">
        <LifeCountdown result={result} />
        <LifeMonthGrid result={result} />
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={reset}
            className="w-full rounded-xl border border-[#E8D9C2] bg-white py-4 text-sm font-semibold text-[#8A7E6A] shadow-sm transition-all hover:bg-[#F5F0E8]"
          >
            重新评估我的生命余光
          </button>
          <Link 
            href="/chapter/chapter-2#life-countdown"
            className="w-full rounded-xl bg-[#4A3728] py-4 text-center text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
          >
            返回篇章：积极生活 →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面 ==================== //
export default function LifeClockPage() {
  const { result, isCompleted, reset } = useLifeClockStore();
  const hydrated = usePersistHydrated(useLifeClockStore);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="text-sm font-medium text-[#8A7E6A] animate-pulse">正在点亮生命之钟...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* 顶部简易导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/chapter/chapter-2" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回积极生活
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">生命余光</h1>
          <div className="w-20" /> {/* 占位平衡 */}
        </div>
      </nav>

      <main className="mx-auto max-w-xl px-4 pt-8">
        {!isCompleted || !result ? (
          <div className="space-y-8">
            <header className="text-center">
              <div className="mb-4 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
                Life Awareness Tool
              </div>
              <h2 className="text-3xl font-bold text-[#4A3728]">遇见未来的自己</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8A7E6A]">
                如果生命的刻度变得清晰可见，<br />
                你是否还会选择现在的活法？
              </p>
            </header>
            <LifeClockForm />
          </div>
        ) : (
          <ResultView result={result} reset={reset} />
        )}
      </main>

      <footer className="mt-16 text-center">
        <p className="text-[10px] tracking-widest text-[#B8A888] uppercase">
          Memento Mori · 认真生活，从看见开始
        </p>
      </footer>
    </div>
  );
}