import type { Metadata } from 'next';
import Link from 'next/link';
import AgingChoiceWizard from '@/components/tools/AgingChoiceWizard';
import AgingReferenceSection from '@/components/tools/AgingReferenceSection';
import { DISCLAIMER } from '@/data/aging-choice/agingData';

export const metadata: Metadata = {
  title: '居家养老还是去养老院 | 《一生的整理》',
  description:
    '先判断居家养老还撑不撑得住——身体、身边有没有人、房子住不住得下去；撑不住，再按护理等级、预算与所在城市，把机构类型收窄到一两类。不推荐具体机构，不做排名。',
};

export default function AgingChoicePage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/60 bg-white/85 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/chapter/chapter-3"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <h1 className="hidden text-sm font-bold text-[#4A3728] sm:block">居家养老还是去养老院</h1>
          <div className="hidden w-24 sm:block" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <header>
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#A8927A]">先分流 · 再匹配</p>
          <h2 className="mt-3 text-3xl leading-snug font-bold text-[#4A3728] sm:text-[34px]">
            先判断居家还撑不撑得住，
            <br className="hidden sm:block" />
            再谈去不去机构。
          </h2>
          <p className="mt-4 text-[15px] leading-[1.9] text-[#5A5A5A]">
            九成老人最后在自己家里老去。所以要先判断的不是「想不想去机构」，而是
            <span className="font-medium text-[#4A3728]">居家还撑不撑得住</span>。
          </p>
        </header>

        <AgingChoiceWizard />

        <AgingReferenceSection />

        <p className="mt-6 text-[12px] leading-[1.75] text-[#A8927A]">{DISCLAIMER}</p>
      </main>
    </div>
  );
}
