import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BackToHome from "@/components/BackToHome";
import { ChapterToc } from "@/components/ChapterToc";
import ChapterTopNav from "@/components/ChapterTopNav";
import { ToolPlaceholder } from "@/components/ToolPlaceholder";
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

  const chapterIndex = chapters.findIndex((c) => c.slug === chapter.slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F6E9D2] via-[#F2E3C2] to-[#FAF7F1]">
      <ChapterTopNav />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:pt-12">
        <header className="mt-6 rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-[0_20px_40px_rgba(42,32,23,0.15)] sm:p-12">

          <p className="text-xs font-medium tracking-[0.22em] text-[#7A6A52]">
            {chapterIndex >= 0 ? `CHAPTER ${chapterIndex + 1}` : "CHAPTER"}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#2F2A24] sm:text-5xl">
            {chapter.title}
          </h1>
          <p className="mt-3 text-pretty text-base text-[#6A6256] sm:text-lg">
            {chapter.subtitle}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-7 text-[#6A6256]">
            {chapter.description}
          </p>
        </header>

        <div className="mt-10 grid gap-8 lg:grid-cols-[200px_1fr]">
          <ChapterToc chapterSlug={chapter.slug} sections={chapter.sections} variant="sidebar" />


          <div className="space-y-10">
            {chapter.sections.map((s, idx) => {
              const isSummary = s.id === "summary";
              const reverse = idx % 2 === 1;

              if (isSummary) {
                return (
                  <section
                    key={s.id}
                    id={s.id}
                    className="scroll-mt-28 rounded-3xl border border-black/10 bg-white/80 p-8 text-center shadow-sm sm:p-12"
                  >
                    <h2 className="text-2xl font-semibold text-[#2F2A24] sm:text-3xl">
                      {s.title}
                    </h2>

                    <div className="mx-auto mt-5 max-w-3xl space-y-4 text-sm leading-7 text-[#6A6256] sm:text-base">
                      {s.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>

                    {s.questions?.length ? (
                      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-black/10 bg-[#F8F2E6] p-6 text-left">
                        <div className="text-sm font-semibold text-[#2F2A24]">
                          思考题：
                        </div>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[#6A6256]">
                          {s.questions.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </section>
                );
              }

              return (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-28 rounded-3xl border border-black/10 bg-white/80 p-7 shadow-sm sm:p-10"
                >
                  <div
                    className={
                      "grid gap-6 lg:grid-cols-2 lg:items-center " +
                      (reverse ? "lg:[&>*:first-child]:order-2" : "")
                    }
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-[#F8F2E6] to-white">
                      <div className="flex h-full w-full items-center justify-center text-sm text-[#8A7E6A]">
                        配图更新中...
                      </div>
                    </div>

                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-xl font-semibold text-[#2F2A24] sm:text-2xl">
                          {s.title}
                        </h2>
                        <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C7A96A]" />
                      </div>

                      <div className="mt-4 space-y-4 text-sm leading-7 text-[#6A6256] sm:text-base">
                        {s.paragraphs.map((p, pIdx) => (
                          <p key={pIdx}>{p}</p>
                        ))}
                      </div>

                      {s.toolId ? <ToolPlaceholder toolId={s.toolId} /> : null}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm text-[#6A6256] shadow-sm transition hover:-translate-y-0.5 hover:text-[#2F2A24]"
          >
            回到顶部
          </button>
        </div>
        <div className="mx-auto mt-10 max-w-3xl pb-6 text-center text-xs text-[#7A6A52]">
          网站制作：思考熊 | 内容来源：《一生的整理》（全网同名：借假修真的思考熊）
        </div>

      </main>
    </div>
  );
}

