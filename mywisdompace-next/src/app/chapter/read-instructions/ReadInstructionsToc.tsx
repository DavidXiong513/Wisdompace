"use client";

import { useEffect, useState } from "react";

type TocItem = {
  id: string;
  label: string;
};

type ReadInstructionsTocProps = {
  items: TocItem[];
};

export default function ReadInstructionsToc({
  items,
}: ReadInstructionsTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (!items.length) return;

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: 0.1,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [items]);

  return (
    <div className="relative z-30 mx-auto mb-6 w-full max-w-[800px] rounded-xl border border-[#E8E4DD] bg-white px-4 py-5 shadow-[2px_0_8px_rgba(0,0,0,0.05)] xl:fixed xl:left-[24px] xl:top-[72px] xl:mx-0 xl:mb-0 xl:h-[calc(100vh-72px)] xl:w-[240px] xl:overflow-y-auto xl:rounded-none xl:border-0 xl:border-r xl:px-4 xl:py-6">
      <div className="flex items-center justify-center gap-2 text-[18px] font-semibold text-[#7A6A52]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EFE6DA] text-[#7A5A3A]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M5 8h11a4 4 0 1 1 0 8H8a3 3 0 0 1 0-6h8" />
          </svg>
        </span>
        页面导航
      </div>
      <ul className="mt-6 space-y-3 text-left text-[16px] leading-6">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`flex items-center justify-start border-l-[3px] px-4 py-2 transition duration-200 ${
                  isActive
                    ? "border-[#4A3728] bg-[#F5EDE0] text-[#4A3728] font-semibold rounded-r-[6px]"
                    : "border-transparent text-[#6B5B4F] font-normal hover:bg-[#FAF6F0] hover:text-[#4A3728] rounded-r-[6px]"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
