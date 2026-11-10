import type { Metadata } from 'next';
import Link from 'next/link';
import FarewellLetterBox from '@/components/tools/FarewellLetterBox';

export const metadata: Metadata = {
  title: '留给家人的话 | 《一生的整理》',
  description:
    '遗嘱管财，这封信管人。先分清遗嘱、遗书与这封信的区别，再用八个起笔提示写下想说的话。内容只存在本机。',
};

/**
 * 独立可访问版本。章节内已内嵌同一组件（「无憾的交代」末尾），
 * 这个页面只是给需要单独收藏、分享时用的入口。
 */
export default function FarewellLetterPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/chapter/chapter-3"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">留给家人的话</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:pt-10">
        <FarewellLetterBox />
      </main>
    </div>
  );
}
