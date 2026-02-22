"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthEntry from "@/components/AuthEntry";

const navItems = [


  {
    chinese: "预备此生",
    english: "Prepare Wisely",
    href: "/chapter/read-instructions",
  },
  { chinese: "看见自己", english: "See Yourself", href: "/chapter/chapter-1" },
  { chinese: "积极生活", english: "Live Positively", href: "/chapter/chapter-2" },
  { chinese: "清楚交代", english: "State Clearly", href: "/chapter/chapter-3" },
  { chinese: "好好告别", english: "Farewell Gracefully", href: "/chapter/chapter-4" },
];

type ChapterTopNavProps = {
  containerClassName?: string;
  navClassName?: string;
  navListClassName?: string;
};

export default function ChapterTopNav({
  containerClassName = "",
  navClassName = "",
  navListClassName = "",
}: ChapterTopNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#4A3728]">
      <div className="relative w-full">
        <div
          className={`mx-auto flex h-[72px] w-full max-w-6xl items-center px-4 sm:px-6 ${containerClassName}`}
        >
          <div className="flex shrink-0 items-center justify-start text-left">
            <Link
              href="/"
              className="whitespace-nowrap font-cn-serif text-[22px] font-bold text-[#F5EDE0] transition duration-300 hover:text-[#FFF3DF] sm:text-[25px]"
            >
              一生的整理
            </Link>
          </div>

          <nav
            className={`hidden flex-1 px-2 md:block md:ml-4 lg:ml-6 ${navClassName}`}
          >
            <ul
              className={`mx-auto grid w-full max-w-[min(1316px,92vw)] grid-cols-5 gap-2 text-center text-[#F5EDE0] ${navListClassName}`}
            >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href} className="min-w-0">
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full flex-col items-center rounded-md px-2 py-2.5 transition duration-300 lg:px-3 ${
                      isActive
                        ? "bg-[#F9F2E7] shadow-[inset_0_0_0_1px_rgba(74,55,40,0.15)]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`text-[13px] font-semibold lg:text-[14px] ${
                        isActive ? "text-[#4A3728]" : "text-[#F5EDE0]"
                      }`}
                    >
                      {item.chinese}
                    </span>
                    <span
                      className={`mt-0.5 text-[10px] font-normal uppercase tracking-[0.5px] ${
                        isActive ? "text-[#4A3728]/70" : "text-[#F5EDE0]/80"
                      }`}
                    >
                      {item.english}
                    </span>
                  </Link>
                </li>
              );
            })}
            </ul>
          </nav>
        </div>

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-3 sm:right-6">
          <button
            type="button"
            aria-label="打开菜单"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="rounded-md border border-[#E8D9C2]/70 px-3 py-2 text-xs font-semibold text-[#F5EDE0] transition duration-300 hover:bg-[#F5EDE0] hover:text-[#4A3728] md:hidden"
          >
            菜单
          </button>
          <AuthEntry />
        </div>

        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden border-t border-[#5E4A3A] bg-[#4A3728] px-6 py-4"
          >
            <ul className="flex flex-col gap-2 text-[#F5EDE0]">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between rounded-md px-3 py-2 transition duration-300 ${
                        isActive ? "bg-[#F9F2E7] text-[#4A3728]" : "hover:bg-white/10"
                      }`}
                    >
                      <span className="text-[14px] font-semibold">
                        {item.chinese}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.4px] text-[#F5EDE0]/80">
                        {item.english}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </header>

  );
}
