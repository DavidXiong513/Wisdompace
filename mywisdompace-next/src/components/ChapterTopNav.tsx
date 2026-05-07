"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { chapters } from "@/data/chapters";

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
  const { user, isLoggedIn, logout } = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prev / next chapter navigation
  const currentSlug = pathname.split('/').pop() ?? '';
  const chapterIndex = chapters.findIndex((c) => c.slug === currentSlug);
  
  // 特殊处理：如果当前是 chapter-1，上一章应该是 read-instructions
  let prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  if (currentSlug === 'chapter-1') {
    prevChapter = { slug: 'read-instructions', title: '预备此生' } as unknown as typeof chapters[number];
  }
  
  const nextChapter  = chapterIndex >= 0 && chapterIndex < chapters.length - 1
    ? chapters[chapterIndex + 1]
    : null;

  return (
    <header className="sticky top-0 z-50 bg-[#4A3728]">
      <div className="relative w-full">
        <div
          className={`mx-auto flex h-[72px] w-full max-w-6xl items-center px-4 sm:px-6 ${containerClassName}`}
        >
          <div className="flex shrink-0 items-center justify-start text-left">
            <Link
              href="/"
              className="whitespace-nowrap font-cn-serif text-[22px] font-bold text-[#FFF3DF] transition duration-300 hover:text-[#FFFFFF] sm:text-[25px]"
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
                    scroll={true}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full flex-col items-center rounded-md px-2 py-2.5 transition duration-300 lg:px-3 ${
                      isActive
                        ? "bg-[#1A1A2E] border-2 border-[#F5EDE0] shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`text-[13px] font-semibold lg:text-[14px] ${
                        isActive ? "text-[#FFFFFF]" : "text-[#F5EDE0]"
                      }`}
                    >
                      {item.chinese}
                    </span>
                    <span
                      className={`mt-0.5 text-[10px] font-normal uppercase tracking-[0.5px] ${
                        isActive ? "text-[#F5EDE0]/90" : "text-[#F5EDE0]/80"
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
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C7A96A]/20 text-xs font-medium text-[#F8EBD5]">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden text-xs font-medium text-[#F8EBD5] sm:inline">
                {user.name || user.email?.split("@")[0] || "访客"}
              </span>
              <button
                onClick={logout}
                className="rounded-md border border-[#E8D9C2]/70 px-2.5 py-1 text-[11px] font-medium text-[#F5EDE0] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F]"
              >
                退出
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-[#E8D9C2] px-4 py-2 text-sm font-semibold text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F]"
            >
              登录 / 注册
            </Link>
          )}
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
                      scroll={true}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center justify-between rounded-md px-3 py-2 transition duration-300 ${
                        isActive ? "bg-[#1A1A2E] border-2 border-[#F5EDE0] text-[#FFFFFF]" : "hover:bg-white/10 text-[#F5EDE0]"
                      }`}
                    >
                      <span className="text-[14px] font-semibold">
                        {item.chinese}
                      </span>
                      <span className={`text-[11px] uppercase tracking-[0.4px] ${
                        isActive ? "text-[#F5EDE0]/90" : "text-[#F5EDE0]/80"
                      }`}>
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

      {/* ── Prev / Next chapter bar ── */}
      {(prevChapter || nextChapter) && (
        <div
          className="flex items-center justify-between px-6 py-2 text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: '#3d2e22' }}
        >
          {prevChapter ? (
            <Link
              href={`/chapter/${prevChapter.slug}`}
              scroll={false}
              className="flex items-center gap-1 text-[#F5EDE0]/80 transition hover:text-[#F5EDE0]"
            >
              ← {prevChapter.title}
            </Link>
          ) : <span />}
          {nextChapter ? (
            <Link
              href={`/chapter/${nextChapter.slug}`}
              scroll={false}
              className="flex items-center gap-1 text-[#F5EDE0]/80 transition hover:text-[#F5EDE0]"
            >
              {nextChapter.title} →
            </Link>
          ) : <span />}
        </div>
      )}
    </header>
  );
}
