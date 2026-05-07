import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ChapterTopNav from "@/components/ChapterTopNav";
import { ChapterToc } from "@/components/ChapterToc";
import { ChapterReader } from "@/components/chapter/ChapterReader";
import { ScrollToTopButton } from "@/components/chapter/ScrollToTopButton";
import DonateButton from "@/components/DonateButton";
import { getChapterBySlug, chapters } from "@/data/chapters";

export function generateStaticParams() {
  return chapters.map((c) => ({ slug: c.slug }));
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: "章节未找到",
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

  const realChapters = chapters.filter((c) => !['read-instructions'].includes(c.slug));
  const chapterIndex = realChapters.findIndex((c) => c.slug === chapter.slug);

  return (
    <div className="relative min-h-screen bg-[#F5F0E8]">
      {/* 背景纹理装饰 */}
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-cover bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-subbackground.webp')" }}
        aria-hidden
      />
      
      <div className="relative z-10">
        <ChapterTopNav />
        
        <main className="mx-auto max-w-[min(1800px,96vw)] px-6 pb-20 pt-8 sm:pt-10">
          {/* 目录导航 - 兼容旧版 UI 结构 */}
          <div className="lg:fixed lg:left-6 lg:top-32 lg:w-64">
             <ChapterToc chapterSlug={chapter.slug} sections={chapter.sections} variant="sidebar" />
          </div>

          <div className="lg:ml-[280px]">
            <div className="mx-auto w-full max-w-[min(1316px,92vw)]">
              <div className="flex flex-col gap-8">
                {/* 章节头部卡片 */}
                <header className="rounded-xl border border-[#E8E4DD] bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-12">
                  <p className="text-xs font-medium tracking-[0.22em] text-[#7A6A52] uppercase">
                    {chapterIndex >= 0 ? `Chapter ${chapterIndex + 1}` : "Chapter"}
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#4A3728] sm:text-4xl lg:text-5xl">
                    {chapter.title}
                  </h1>
                  <p className="mt-3 text-lg font-medium text-[#6A6256]">
                    {chapter.subtitle}
                  </p>
                  <div className="mx-auto mt-6 h-[2px] w-16 bg-[#C9A15A]" />
                  <p
                    className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#8A7E6A]"
                    dangerouslySetInnerHTML={{ __html: chapter.description }}
                  />
                </header>

                {/* 章节核心内容渲染器 (带进度追踪) */}
                <div className="chapter-content-sections">
                   <ChapterReader chapter={chapter} />
                </div>

                {/* 底部版权信息 */}
                <div className="mt-10 border-t border-[#E8E4DD] pt-10 text-center">
                  <p className="text-xs text-[#6A6256] tracking-wider">
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

