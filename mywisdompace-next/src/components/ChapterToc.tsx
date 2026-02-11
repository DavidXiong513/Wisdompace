"use client";

import { useEffect, useMemo, useState } from "react";

import type { ChapterSection } from "@/data/chapters";
import { getReadingProgress, saveReadingProgress } from "@/lib/reading-progress";

type TocVariant = "bar" | "sidebar";

export function ChapterToc({
  chapterSlug,
  sections,
  variant = "bar",
}: {
  chapterSlug: string;
  sections: ChapterSection[];
  variant?: TocVariant;
}) {
  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const last = getReadingProgress(chapterSlug);
    if (!last?.sectionId) return;
    const el = document.getElementById(last.sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [chapterSlug]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        const first = visible[0];
        const id = first?.target?.id;
        if (!id) return;
        setActiveId(id);
        saveReadingProgress(chapterSlug, id);
      },
      { threshold: [0.35, 0.5, 0.75] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapterSlug, ids]);

  if (variant === "sidebar") {
    return (
      <aside className="sticky top-24 rounded-2xl border border-black/10 bg-white/70 p-4 text-center shadow-sm backdrop-blur">
        <div className="text-base font-bold uppercase tracking-[0.2em] text-[#7A6A52]">
          目录导航
        </div>
        <ul className="mt-4 space-y-3 font-semibold">
          {sections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById(s.id)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }
                  className={
                    "w-full rounded-lg px-2 py-3 text-base transition " +
                    (active
                      ? "bg-[#F6E9D2] text-[#3D3A32]"
                      : "text-[#6A6256] hover:bg-[#F6E9D2]/70")
                  }
                >
                  {s.title}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

    );
  }


  return (
    <div className="sticky top-[64px] z-20 -mx-5 border-y border-border bg-background/70 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex items-center gap-2 overflow-auto">
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() =>
                document.getElementById(s.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className={
                "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition " +
                (active
                  ? "border-cyberBlue/60 bg-surface text-foreground shadow-[var(--shadow-card)]"
                  : "border-border bg-surface/70 text-muted hover:text-foreground")
              }
            >
              {s.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
