'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import NavBar from '@/components/NavBar';
import HomeChapterNav from '@/components/HomeChapterNav';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useTranslation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      <NavBar />
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-background.webp"
          alt="Hero Background"
          fill
          priority
          className="object-cover object-center brightness-75"
          sizes="100vw"
        />
      </div>

      {/* Overlay to darken the image slightly for better text contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full w-full">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4 pt-20 sm:justify-end sm:px-12 sm:pt-24 lg:px-20">
          <div className="flex w-full flex-col items-center text-center sm:w-auto sm:items-end sm:text-right">
            <h1 className="font-cn-serif block w-full text-[2.6rem] leading-tight font-bold tracking-[0.16em] whitespace-nowrap text-white text-shadow-lg sm:text-[3.6rem] md:text-[4.4rem] lg:text-[5.2rem] xl:text-[5.8rem]">
              {t('home.heroTitle')}
            </h1>
            <p className="text-shadow mt-5 block w-full text-[1.05rem] font-semibold tracking-[0.14em] whitespace-nowrap text-white/95 sm:mt-6 sm:text-[1.35rem] md:text-[1.55rem] lg:text-[1.7rem] xl:text-[1.75rem]">
              {t('home.heroSubtitle')}
            </p>

            <div className="mt-11 w-full max-w-[680px] sm:max-w-[610px] lg:max-w-[670px] xl:max-w-[700px]">
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-3 rounded-full bg-white/68 px-5 py-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.22)] ring-1 ring-white/60 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-slate-500">
                  <svg
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3.5-3.5" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('home.searchPlaceholder')}
                  className="flex-1 bg-transparent text-base text-slate-700 placeholder:text-slate-500 focus:outline-none sm:text-base"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#C9A15A]/85 px-5 py-2.5 text-base font-semibold text-white shadow-[0_10px_25px_rgba(201,161,90,0.28)] transition hover:bg-[#B58A3A]/85"
                >
                  {t('home.searchBtn')}
                </button>
              </form>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-[0.82rem] tracking-[0.06em] text-white/90 sm:justify-end sm:text-[0.88rem]">
                <span className="mr-2 inline-flex h-9 items-center leading-none">
                  {t('home.hotLabel')}
                </span>
                {(t('home.hotTags', { returnObjects: true }) as string[]).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className="rounded-full border border-white/40 bg-white/10 px-3.5 py-1.5 text-[0.78rem] font-medium text-white/90 backdrop-blur-sm transition hover:border-white/70 hover:bg-white/20 sm:text-[0.82rem]"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <HomeChapterNav />
    </div>
  );
}
