import Link from "next/link";
import ChapterTopNav from "@/components/ChapterTopNav";
import ReadInstructionsToc from "@/app/chapter/read-instructions/ReadInstructionsToc";
import ScrollTopButton from "@/app/chapter/read-instructions/ScrollTopButton";
import { getChapterBySlug } from "@/data/chapters";

export default function ChapterTwoPage() {
  const chapter = getChapterBySlug("chapter-2");
  if (!chapter) return null;

  const tocItems = chapter.sections.map((s) => ({
    id: s.id,
    label: s.title,
  }));

  return (
    <div className="relative min-h-screen bg-[#F5F0E8]">
      <div
        className="pointer-events-none absolute inset-0 bg-center bg-cover bg-no-repeat opacity-30"
        style={{ backgroundImage: "url('/images/hero-subbackground.webp')" }}
        aria-hidden
      />
      <div className="relative z-10">
        <ChapterTopNav
          containerClassName="max-w-[min(1800px,96vw)] px-6"
          navClassName="md:ml-0 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[min(1316px,92vw)] md:flex md:items-center"
          navListClassName="w-[940px] max-w-none lg:ml-[80px] xl:ml-[185px] 2xl:ml-[220px]"
        />
        <main className="mx-auto max-w-[min(1800px,96vw)] px-6 pb-20 pt-8 sm:pt-10">
          <ReadInstructionsToc items={tocItems} />
          <div className="lg:ml-[280px]">
            <div className="mx-auto w-full max-w-[min(1316px,92vw)]">
              <div className="flex flex-col gap-8">
                {chapter.sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 rounded-xl border border-[#E8E4DD] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] sm:p-7 lg:p-10"
                  >
                    <h2 className="text-[24px] font-bold text-[#4A3728]">
                      {section.title}
                    </h2>
                    <div className="mt-3 h-[3px] w-10 bg-[#4A3728]" />
                    <div className="mt-4 space-y-4 text-[17px] leading-[1.85] tracking-[-0.01em] text-[#3D3D3D]">
                      {section.paragraphs.map((p, i) => (
                        <p key={i} className="indent-[2em]">
                          {p}
                        </p>
                      ))}
                    </div>

                    {section.toolId && (
                      <div className="mt-6 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6 text-center text-[#7A6A52]">
                        工具开发中 ({section.toolId})...
                      </div>
                    )}

                    {section.questions && (
                      <div className="mt-6 rounded-lg border border-[#E8E4DD] bg-[#FAF8F3] p-6">
                        <div className="text-sm font-semibold text-[#4A3728] mb-3">
                          思考题：
                        </div>
                        <ul className="list-disc space-y-2 pl-5 text-sm text-[#6A6256]">
                          {section.questions.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                ))}

                {/* 底部导航 */}
                <div className="flex items-center justify-between mt-4">
                  <Link
                    href="/chapter/chapter-1"
                    className="rounded-xl border border-[#E8E4DD] bg-white px-6 py-3 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
                  >
                    ← 上一篇：看见自己
                  </Link>
                  <Link
                    href="/chapter/chapter-3"
                    className="rounded-xl bg-[#8B6AA0] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#7A5A8F] hover:shadow-md"
                  >
                    下一篇：清楚交代 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
        <ScrollTopButton />
      </div>
    </div>
  );
}
