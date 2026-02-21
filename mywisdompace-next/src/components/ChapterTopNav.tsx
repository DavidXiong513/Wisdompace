"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-[#4A3728]">
      <div className="relative w-full">
        <div
          className={`mx-auto flex h-[72px] w-full max-w-6xl items-center px-4 ${containerClassName}`}
        >
          <div className="flex w-[220px] -translate-x-[57px] items-center justify-start text-left">
            <Link
              href="/"
              className="whitespace-nowrap font-cn-serif text-[25px] font-bold text-[#F5EDE0] transition duration-300 hover:text-[#FFF3DF]"
            >
              一生的整理
            </Link>
          </div>

          <nav
            className={`hidden md:block md:ml-20 ${navClassName}`}
          >
            <ul
              className={`flex w-[760px] items-center justify-between text-center text-[#F5EDE0] ${navListClassName}`}
            >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex flex-col items-center rounded-md px-4 py-3 transition duration-300 ${
                      isActive
                        ? "bg-[#F9F2E7] shadow-[inset_0_0_0_1px_rgba(74,55,40,0.15)]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`text-[14px] font-semibold ${
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

        <div className="absolute right-6 top-1/2 flex -translate-y-1/2 items-center gap-3">
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


