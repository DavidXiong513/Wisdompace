'use client';
'use no memo';

import React from 'react';
import Link from 'next/link';
import { useRetirementCostStore } from '@/stores/retirementCostStore';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { RetirementCostForm } from '@/components/tools/retirement-cost-calculator/RetirementCostForm';
import { RetirementCostReport } from '@/components/tools/retirement-cost-calculator/RetirementCostReport';

export default function RetirementCostCalculatorPage() {
  const step = useRetirementCostStore((state) => state.step);
  const hydrated = usePersistHydrated(useRetirementCostStore);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <p className="animate-pulse text-sm font-medium text-[#8A7E6A]">正在翻开你的晚年账本…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/60 bg-white/85 px-4 py-3 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/chapter/chapter-3#retirement-cost"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <span className="text-sm font-bold text-[#4A3728]">晚年花费测算</span>
          <span className="hidden rounded-full bg-[#FDF5EE] px-2.5 py-1 text-[10px] font-medium text-[#C87941] sm:block">
            仅保存在本机
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pt-6 sm:pt-8">
        {step < 4 && (
          <header className="mx-auto mb-7 max-w-3xl text-center">
            <div className="inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
              Later-Life Cost Planner
            </div>
            <h1 className="mt-3 text-2xl font-bold text-[#4A3728] sm:text-3xl">
              从退休到离世，我需要准备多少钱？
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#8A7E6A]">
              把日常、医疗、照护和热爱放进同一本账。不是为了吓自己，而是把模糊的担忧变成可以准备的数字。
            </p>
          </header>
        )}

        {step < 4 ? <RetirementCostForm /> : <RetirementCostReport />}
      </main>
    </div>
  );
}
