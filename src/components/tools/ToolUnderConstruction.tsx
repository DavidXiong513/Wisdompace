import Link from 'next/link';

export type UnderConstructionItem = {
  title: string;
  desc: string;
};

type Props = {
  /** 工具名，同时用于导航栏标题 */
  title: string;
  /** 所属章节说明，如「清楚交代 · 第三章」 */
  eyebrow: string;
  /** 一句话说明这个工具在做什么 */
  intro: string;
  /** 将要包含的能力清单 */
  items: UnderConstructionItem[];
  /** 底部边界提示 */
  note: string;
  /** 互链：另一个相关工具 */
  relatedHref: string;
  relatedLabel: string;
};

/**
 * ToolUnderConstruction
 * 工具尚未上线时的统一占位页：说明这个工具要解决什么问题、
 * 会包含哪些能力，以及必须提前讲清的边界。
 */
export default function ToolUnderConstruction({
  title,
  eyebrow,
  intro,
  items,
  note,
  relatedHref,
  relatedLabel,
}: Props) {
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
          <h1 className="text-sm font-bold text-[#4A3728]">{title}</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FDF5EE] px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-[#C87941]">
              准备中
            </span>
            <span className="text-[11px] tracking-[0.12em] text-[#A8927A]">{eyebrow}</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-[#4A3728] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-[#5A5A5A]">{intro}</p>
        </header>

        <section className="mt-8 rounded-2xl border border-[#E8D9C2] bg-white p-6 sm:p-7">
          <h3 className="text-base font-bold text-[#4A3728]">这个工具会包含什么</h3>
          <ol className="mt-5 space-y-5">
            {items.map((item, i) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C87941] text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-[#4A3728]">{item.title}</div>
                  <p className="mt-1 text-sm leading-[1.8] text-[#6A6256]">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-5 rounded-2xl border border-dashed border-[#D9C6AC] bg-[#FAF8F3] p-5">
          <p className="text-sm leading-[1.85] text-[#8A7E6A]">{note}</p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={relatedHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C87941] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D]"
          >
            {relatedLabel}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/chapter/chapter-3"
            className="inline-flex items-center justify-center rounded-full border border-[#E8D9C2] bg-white px-6 py-3 text-sm font-medium text-[#6A6256] transition-all hover:border-[#C87941] hover:text-[#C87941]"
          >
            先回章节继续读
          </Link>
        </div>
      </main>
    </div>
  );
}
