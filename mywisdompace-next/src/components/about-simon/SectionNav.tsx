"use client";

import { useState, useEffect, useRef } from "react";

interface Section {
  id: string;
  label: string;
}

interface SectionNavProps {
  sections: Section[];
}

/**
 * 左侧固定章节导航 — 桌面端可见，移动端隐藏
 * 使用 fixed 定位，overlay 在内容左侧，不破坏 section 全宽背景
 * IntersectionObserver 追踪当前可见章节，点击平滑滚动
 */
export default function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // 等待 DOM 就绪后再绑定 observer
    const timer = setTimeout(() => {
      const sectionEls = sections
        .map((s) => document.getElementById(s.id))
        .filter(Boolean) as HTMLElement[];

      if (sectionEls.length === 0) return;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible.length > 0) {
            setActiveId(visible[0].target.id);
          }
        },
        {
          rootMargin: "-10% 0px -60% 0px",
          threshold: 0,
        }
      );

      sectionEls.forEach((el) => observerRef.current!.observe(el));

      if (!activeId && sectionEls[0]) {
        setActiveId(sectionEls[0].id);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navHeight = 72; // top-14 = 3.5rem ≈ 56px，留 16px 额外间距
      const top = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  if (sections.length === 0) return null;

  return (
    <nav
      className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-14 lg:w-[176px] lg:h-[calc(100vh-3.5rem)] lg:bg-[var(--as-bg-primary)] lg:border-r lg:border-[var(--as-gray-100)] lg:pt-6 lg:pb-8 lg:px-4 lg:overflow-y-auto lg:z-40"
      aria-label="章节导航"
    >
      <p className="mb-3 px-3 text-xs font-semibold tracking-wider text-[var(--as-gray-400)] uppercase">
        本章导航
      </p>
      {sections.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            onClick={() => handleClick(s.id)}
            className={`
              group relative flex items-center rounded-md px-3 py-1.5 text-left text-sm transition-colors
              ${
                isActive
                  ? "font-semibold text-[var(--as-primary-700)] bg-[var(--as-primary-50)]"
                  : "text-[var(--as-gray-500)] hover:text-[var(--as-primary-600)] hover:bg-[var(--as-primary-50)]/50"
              }
            `}
          >
            {/* 左侧色条指示器 */}
            <span
              className={`
                absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full transition-all
                ${
                  isActive
                    ? "h-4 bg-[var(--as-primary-600)]"
                    : "h-0 bg-transparent group-hover:h-2 group-hover:bg-[var(--as-primary-300)]"
                }
              `}
            />
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
