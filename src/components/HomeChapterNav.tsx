'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import DonateButton from '@/components/DonateButton';

const navItems = [
  { cnKey: 'chapterNav.prepare', enKey: 'chapterNav.prepare', href: '/chapter/read-instructions' },
  { cnKey: 'chapterNav.see', enKey: 'chapterNav.see', href: '/chapter/chapter-1' },
  { cnKey: 'chapterNav.live', enKey: 'chapterNav.live', href: '/chapter/chapter-2' },
  { cnKey: 'chapterNav.state', enKey: 'chapterNav.state', href: '/chapter/chapter-3' },
  { cnKey: 'chapterNav.farewell', enKey: 'chapterNav.farewell', href: '/chapter/chapter-4' },
];

const HomeChapterNav = () => {
  const { t, i18n } = useTranslation();
  const isChinese = (i18n.language || 'zh-CN').startsWith('zh');

  return (
    <footer className="absolute right-0 bottom-0 left-0 z-20 pb-4 sm:pb-3">
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-12 lg:px-20">
        <div className="rounded-xl bg-black/55 py-4 backdrop-blur-sm">
          <ul className="flex flex-col items-center justify-center gap-1 text-center text-white sm:flex-row sm:justify-around">
            {navItems.map(item => (
              <li key={item.href} className="py-2 sm:py-0">
                <Link
                  href={item.href}
                  scroll={true}
                  className="group block rounded-md px-4 py-3 transition duration-300 hover:bg-white/10"
                >
                  <span className="block text-base font-semibold tracking-widest text-white transition-colors duration-300 group-hover:text-yellow-200 sm:text-lg">
                    {isChinese ? t(item.cnKey) : t(item.enKey)}
                  </span>
                  {isChinese && (
                    <span className="mt-1 block text-sm font-medium tracking-wider text-white/90 uppercase transition-colors duration-300 group-hover:text-yellow-200/80 sm:text-base">
                      {t(item.enKey, { lng: 'en' })}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2 flex flex-col items-center gap-2 text-center text-[10px] leading-relaxed sm:mt-3 sm:text-[11px]">
          <span className="text-white/75">
            {t('home.footerText')}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/about-simon"
              className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-0.5 text-[10px] text-white/80 backdrop-blur-sm transition hover:border-white/50 hover:bg-white/15 hover:text-yellow-200 sm:text-[11px]"
            >
              {t('homeNav.aboutBear')}
            </Link>
            <DonateButton />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomeChapterNav;
