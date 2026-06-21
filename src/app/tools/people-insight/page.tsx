'use client';

import Link from 'next/link';

export default function PeopleInsightPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-10 border-b border-[#E8D9C2] bg-[#F5F0E8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link
            href="/chapter/chapter-3"
            className="text-sm text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-medium text-[#4A3728]">慧眼识人·长期观察记录</h1>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-12">
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-8 text-center">
          <div className="mb-4 text-5xl">👁️</div>
          <h2 className="text-xl font-bold text-[#4A3728]">工具正在开发中</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#8A7E6A]">
            「慧眼识人」工具本体正在打磨，完成后会自动接入这里。
            <br />
            你可以先阅读上方的介绍，理解这个工具要解决什么问题。
          </p>
          <Link
            href="/chapter/chapter-3"
            className="mt-6 inline-block rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#B36931]"
          >
            返回章节
          </Link>
        </div>
      </main>
    </div>
  );
}
