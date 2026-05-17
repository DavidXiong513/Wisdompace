import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ChapterTopNav from '@/components/ChapterTopNav';
import { ChapterToc } from '@/components/ChapterToc';
import { ChapterReader } from '@/components/chapter/ChapterReader';
import { ScrollToTopButton } from '@/components/chapter/ScrollToTopButton';
import ChapterHeader from '@/components/chapter/ChapterHeader';
import DonateButton from '@/components/DonateButton';
import { getChapterBySlug, chapters } from '@/data/chapters';

export function generateStaticParams() {
  return chapters.map(c => ({ slug: c.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: '章节未找到',
    };
  }

  return {
    title: `${chapter.title} | 《一生的整理》`,
    description: chapter.description,
  };
}

export default async function ChapterPage({ params }: Props) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);
  if (!chapter) notFound();

  const realChapters = chapters.filter(c => !['read-instructions'].includes(c.slug));
  const chapterIndex = realChapters.findIndex(c => c.slug === chapter.slug);

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

        <main className="mx-auto max-w-7xl px-6 pt-8 pb-20 sm:pt-10">
          <div className="flex flex-col lg:flex-row lg:gap-12">
            {/* 目录导航 - 改为 sticky 随容器定位 */}
            <aside className="lg:sticky lg:top-32 lg:h-[calc(100vh-8rem)] lg:w-64 lg:shrink-0">
              <ChapterToc
                chapterSlug={chapter.slug}
                sections={chapter.sections}
                variant="sidebar"
              />
            </aside>

            <div className="min-w-0 flex-1">
              <div className="mx-auto w-full max-w-4xl">
                <div className="flex flex-col gap-8">
                  {/* 章节头部卡片 */}
                  <ChapterHeader
                    slug={slug}
                    chapterIndex={chapterIndex}
                    title={chapter.title}
                    subtitle={chapter.subtitle}
                    description={chapter.description}
                  />

                  {/* 章节核心内容渲染器 (带进度追踪) */}
                  <div className="chapter-content-sections">
                    <ChapterReader chapter={chapter} />
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
          </div>
        </main>
      </div>
    </div>
  );
}
