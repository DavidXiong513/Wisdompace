import type { Metadata } from 'next';
import Link from 'next/link';
import WillPrepWizard from '@/components/tools/WillPrepWizard';

export const metadata: Metadata = {
  title: '我的遗嘱准备 | 《一生的整理》',
  description:
    '写遗嘱之前该想清楚的事：资产盘点、析产判断、意愿梳理、形式对照与八条红线自检，最后生成一份可打印、可带去公证处或律师的准备备忘。不生成任何可直接签署的文书。',
};

export default function WillPreparationPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20 print:bg-white print:pb-0">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/60 bg-white/85 px-4 py-3 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/chapter/chapter-3"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">我的遗嘱准备</h1>
          <Link
            href="/tools/will-templates"
            className="text-xs font-medium text-[#A8927A] transition-colors hover:text-[#C87941]"
          >
            范本库
          </Link>
        </div>
      </nav>

      <WillPrepWizard />
    </div>
  );
}
