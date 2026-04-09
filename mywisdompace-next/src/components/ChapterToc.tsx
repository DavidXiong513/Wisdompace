"use client";

import { useEffect, useMemo, useState } from "react";

import type { ChapterSection } from "@/data/chapters";
import { useReadingProgressStore } from "@/stores/readingProgressStore";

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
  const { getProgress, saveProgress } = useReadingProgressStore();

  useEffect(() => {
    const last = getProgress(chapterSlug);
    if (!last?.sectionId) return;
    const el = document.getElementById(last.sectionId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [chapterSlug, getProgress]);

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
        saveProgress(chapterSlug, id);
      },
      { threshold: [0.35, 0.5, 0.75] }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapterSlug, ids, saveProgress]);

  if (variant === "sidebar") {
    return (
      <aside
        className="sticky top-[180px] rounded-2xl p-4 text-center"
        style={{
          border:     '1px solid var(--wp-border)',
          background: 'var(--wp-card-bg)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-base font-bold uppercase tracking-[0.2em]"
          style={{ color: 'var(--wp-ink-light)' }}
        >
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
                  className="w-full rounded-lg px-2 py-3 text-base transition"
                  style={{
                    background: active ? 'var(--wp-bg-alt)' : 'transparent',
                    color:      active ? 'var(--wp-accent)' : 'var(--wp-ink-muted)',
                    fontWeight: active ? 600 : 400,
                  }}
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
