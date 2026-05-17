'use no memo';
'use client';

import { notFound } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ChapterTopNav from '@/components/ChapterTopNav';
import { ChapterToc } from '@/components/ChapterToc';
import { ChapterReader } from '@/components/chapter/ChapterReader';
import { ScrollToTopButton } from '@/components/chapter/ScrollToTopButton';
import DonateButton from '@/components/DonateButton';
import { getChapterBySlug } from '@/data/chapters';
import { useTranslatedChapter } from '@/lib/hooks/useTranslatedChapter';

const CHAPTER_SLUG = 'read-instructions';

export default function ReadInstructionsPage() {
  const { i18n } = useTranslation();
  const chapter = getChapterBySlug(CHAPTER_SLUG);
  if (!chapter) notFound();

  const translated = useTranslatedChapter(chapter);
  const isChinese = (i18n.language || 'zh-CN').startsWith('zh');
  const display = isChinese ? chapter : translated;

  return (
    <div className="relative min-h-screen bg-[#F5F0E8]">
      {/* 背景纹理装饰 */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-subbackground.webp')" }}
        aria-hidden
      />

      <div className="relative z-10">
        <ChapterTopNav />

        <main className="mx-auto max-w-[min(1800px,96vw)] px-6 pt-8 pb-20 sm:pt-10">
          {/* 左侧固定目录导航 */}
          <div className="lg:fixed lg:top-32 lg:left-6 lg:w-64">
            <ChapterToc chapterSlug={display.slug} sections={display.sections} variant="sidebar" />
          </div>

          <div className="lg:ml-[280px]">
            <div className="mx-auto w-full max-w-[min(1316px,92vw)]">
              <div className="flex flex-col gap-8">
                {/* 头部卡片 */}
                <header className="rounded-xl border border-[#E8E4DD] bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-12">
                  <p className="text-xs font-medium tracking-[0.22em] text-[#7A6A52] uppercase">
                    {isChinese ? 'Prologue' : '序言'}
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#4A3728] sm:text-4xl lg:text-5xl">
                    {display.title}
                  </h1>
                  <p className="mt-3 text-lg font-medium text-[#6A6256]">{display.subtitle}</p>
                  <div className="mx-auto mt-6 h-[2px] w-16 bg-[#C9A15A]" />
                  <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#8A7E6A]">
                    {display.description}
                  </p>
                </header>

                {/* 章节核心内容渲染器 (带进度追踪) */}
                <div className="chapter-content-sections">
                  <ChapterReader chapter={display} />
                </div>

                {/* 底部版权信息 */}
                <div className="mt-10 border-t border-[#E8E4DD] pt-10 text-center">
                  <p className="text-xs tracking-wider text-[#6A6256]">
                    内容来源：《一生的整理》V1.0版 · 全网同名：借假修真的思考熊
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <DonateButton />
                    <ScrollToTopButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
