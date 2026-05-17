'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { chapters } from '@/data/chapters';

const navItems = [
  { cnKey: 'chapterNav.prepare', enKey: 'chapterNav.prepare', href: '/chapter/read-instructions' },
  { cnKey: 'chapterNav.see', enKey: 'chapterNav.see', href: '/chapter/chapter-1' },
  { cnKey: 'chapterNav.live', enKey: 'chapterNav.live', href: '/chapter/chapter-2' },
  { cnKey: 'chapterNav.state', enKey: 'chapterNav.state', href: '/chapter/chapter-3' },
  { cnKey: 'chapterNav.farewell', enKey: 'chapterNav.farewell', href: '/chapter/chapter-4' },
];

type ChapterTopNavProps = {
  containerClassName?: string;
  navClassName?: string;
  navListClassName?: string;
};

export default function ChapterTopNav({
  containerClassName = '',
  navClassName = '',
  navListClassName = '',
}: ChapterTopNavProps) {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  // 章节 slug → 翻译 key 映射
  const chapterTitleKeyMap: Record<string, string> = {
    'read-instructions': 'chapter.readInstructions',
    'chapter-1': 'chapter.chapter1',
    'chapter-2': 'chapter.chapter2',
    'chapter-3': 'chapter.chapter3',
    'chapter-4': 'chapter.chapter4',
  };

  const getChapterTitle = (slug: string) => {
    const key = chapterTitleKeyMap[slug];
    return key ? t(key) : slug;
  };

  // Prev / next chapter navigation
  const currentSlug = pathname.split('/').pop() ?? '';
  const chapterIndex = chapters.findIndex(c => c.slug === currentSlug);

  // 特殊处理：如果当前是 chapter-1，上一章应该是 read-instructions
  let prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  if (currentSlug === 'chapter-1') {
    prevChapter = {
      slug: 'read-instructions',
      title: getChapterTitle('read-instructions'),
    } as unknown as (typeof chapters)[number];
  }

  const nextChapter =
    chapterIndex >= 0 && chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  return (
    <header className="sticky top-0 z-50 bg-[#4A3728]">
      <div className="relative w-full">
        <div
          className={`mx-auto flex h-[72px] w-full max-w-6xl items-center overflow-hidden px-4 sm:px-6 ${containerClassName}`}
        >
          <div className="flex shrink-0 items-center justify-start text-left">
            <Link
              href="/"
              className="font-cn-serif text-[22px] font-bold whitespace-nowrap text-[#FFF3DF] transition duration-300 hover:text-[#FFFFFF] sm:text-[25px]"
            >
              {t('nav.siteTitle')}
            </Link>
          </div>

          <nav className={`hidden flex-1 px-2 md:ml-4 md:block lg:ml-6 ${navClassName}`}>
            <ul
              className={`mx-auto grid w-full max-w-[min(1316px,92vw)] grid-cols-5 gap-2 text-center text-[#F5EDE0] ${navListClassName}`}
            >
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href} className="min-w-0">
                    <Link
                      href={item.href}
                      scroll={true}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex w-full flex-col items-center rounded-md px-2 py-2.5 transition duration-300 lg:px-3 ${
                        isActive
                          ? 'border-2 border-[#F5EDE0] bg-[#1A1A2E] shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <span
                        className={`text-[13px] font-semibold lg:text-[14px] ${
                          isActive ? 'text-[#FFFFFF]' : 'text-[#F5EDE0]'
                        }`}
                      >
                        {currentLanguage.startsWith('zh') ? t(item.cnKey) : t(item.enKey)}
                      </span>
                      {currentLanguage.startsWith('zh') && (
                        <span
                          className={`mt-0.5 text-[10px] font-normal tracking-[0.5px] uppercase ${
                            isActive ? 'text-[#F5EDE0]/90' : 'text-[#F5EDE0]/80'
                          }`}
                        >
                          {t(item.enKey, { lng: 'en' })}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-3 sm:right-6">
          {/* 极简型语言切换 A方案: 中 | EN */}
          <div className="hidden items-center text-[11px] font-medium text-[#F8EBD5]/60 sm:flex">
            <button
              onClick={() => changeLanguage('zh-CN')}
              className={`transition-colors hover:text-[#F8EBD5] ${
                currentLanguage.startsWith('zh') ? 'font-bold text-[#F8EBD5]' : ''
              }`}
            >
              中
            </button>
            <span className="mx-1.5 opacity-30">|</span>
            <button
              onClick={() => changeLanguage('en')}
              className={`transition-colors hover:text-[#F8EBD5] ${
                currentLanguage.startsWith('en') ? 'font-bold text-[#F8EBD5]' : ''
              }`}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            aria-label={t('nav.openMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="rounded-md border border-[#E8D9C2]/70 px-3 py-2 text-xs font-semibold text-[#F5EDE0] transition duration-300 hover:bg-[#F5EDE0] hover:text-[#4A3728] md:hidden"
          >
            {currentLanguage.startsWith('zh') ? '菜单' : 'Menu'}
          </button>
          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C7A96A]/20 text-xs font-medium text-[#F8EBD5]">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="hidden text-xs font-medium text-[#F8EBD5] sm:inline">
                {user.name || user.email?.split('@')[0] || t('nav.visitor')}
              </span>
              <button
                onClick={logout}
                className="rounded-md border border-[#E8D9C2]/70 px-2.5 py-1 text-[11px] font-medium text-[#F5EDE0] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F]"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border border-[#E8D9C2] px-4 py-2 text-sm font-semibold text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F]"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>

        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="border-t border-[#5E4A3A] bg-[#4A3728] px-6 py-4 md:hidden"
          >
            {/* 移动端语言切换 */}
            <div className="mb-4 flex items-center justify-end text-xs font-medium text-[#F8EBD5]/60">
              <button
                onClick={() => changeLanguage('zh-CN')}
                className={`transition-colors hover:text-[#F8EBD5] ${
                  currentLanguage.startsWith('zh') ? 'font-bold text-[#F8EBD5]' : ''
                }`}
              >
                简体中文
              </button>
              <span className="mx-3 opacity-30">|</span>
              <button
                onClick={() => changeLanguage('en')}
                className={`transition-colors hover:text-[#F8EBD5] ${
                  currentLanguage.startsWith('en') ? 'font-bold text-[#F8EBD5]' : ''
                }`}
              >
                English
              </button>
            </div>

            <ul className="flex flex-col gap-2 text-[#F5EDE0]">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      scroll={true}
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex items-center justify-between rounded-md px-3 py-2 transition duration-300 ${
                        isActive
                          ? 'border-2 border-[#F5EDE0] bg-[#1A1A2E] text-[#FFFFFF]'
                          : 'text-[#F5EDE0] hover:bg-white/10'
                      }`}
                    >
                      <span className="text-[14px] font-semibold">
                        {currentLanguage.startsWith('zh') ? t(item.cnKey) : t(item.enKey)}
                      </span>
                      {currentLanguage.startsWith('zh') && (
                        <span
                          className={`text-[11px] tracking-[0.4px] uppercase ${
                            isActive ? 'text-[#F5EDE0]/90' : 'text-[#F5EDE0]/80'
                          }`}
                        >
                          {t(item.enKey, { lng: 'en' })}
                        </span>
                      )}
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
          className="flex items-center justify-between overflow-hidden px-6 py-2 text-sm"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: '#3d2e22' }}
        >
          {prevChapter ? (
            <Link
              href={`/chapter/${prevChapter.slug}`}
              scroll={false}
              className="flex items-center gap-1 text-[#F5EDE0]/80 transition hover:text-[#F5EDE0]"
            >
              ← {getChapterTitle(prevChapter.slug)}
            </Link>
          ) : (
            <span />
          )}
          {nextChapter ? (
            <Link
              href={`/chapter/${nextChapter.slug}`}
              scroll={false}
              className="flex items-center gap-1 text-[#F5EDE0]/80 transition hover:text-[#F5EDE0]"
            >
              {getChapterTitle(nextChapter.slug)} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </header>
  );
}
