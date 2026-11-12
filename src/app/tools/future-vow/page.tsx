import type { Metadata } from 'next';
import Link from 'next/link';
import FutureVowTool from '@/components/tools/FutureVowTool';

export const metadata: Metadata = {
  title: '来生志愿 | 《一生的整理》',
  description:
    '写一句关于「之后」的话：回到自然、再活一次、去一个地方（净土、天堂、仙界、先人所在之处）、与更大的合一、就此结束，或只求被记住。七条路没有高下，也可以先留白。不提供宗教服务，不涉及仪式与修行方法。',
};

export default function FutureVowPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20 print:bg-white print:pb-0">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/60 bg-white/85 px-4 py-3 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/chapter/chapter-4"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回好好告别
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">来生志愿</h1>
          <div className="w-20" />
        </div>
      </nav>

      <FutureVowTool />
    </div>
  );
}
