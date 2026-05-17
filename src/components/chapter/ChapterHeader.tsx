'use client';

import { useTranslation } from 'react-i18next';

/** 章节 slug → 翻译 key 映射（仅用于 client 端标题切换） */
const titleKeyMap: Record<string, string> = {
  'chapter-1': 'chapter.chapter1',
  'chapter-2': 'chapter.chapter2',
  'chapter-3': 'chapter.chapter3',
  'chapter-4': 'chapter.chapter4',
};

const subKeyMap: Record<string, string> = {
  'chapter-1': 'chapter.chapter1Sub',
  'chapter-2': 'chapter.chapter2Sub',
  'chapter-3': 'chapter.chapter3Sub',
  'chapter-4': 'chapter.chapter4Sub',
};

const descKeyMap: Record<string, string> = {
  'chapter-1': 'chapter.chapter1Desc',
  'chapter-2': 'chapter.chapter2Desc',
  'chapter-3': 'chapter.chapter3Desc',
  'chapter-4': 'chapter.chapter4Desc',
};

type ChapterHeaderProps = {
  slug: string;
  chapterIndex: number;
  title: string;
  subtitle: string;
  description: string;
};

export default function ChapterHeader({
  slug,
  chapterIndex,
  title,
  subtitle,
  description,
}: ChapterHeaderProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'zh-CN';
  const isChinese = currentLang.startsWith('zh');

  const displayTitle = isChinese ? title : t(titleKeyMap[slug] ?? '');
  const displaySub = isChinese ? subtitle : t(subKeyMap[slug] ?? '');
  const displayDesc = isChinese ? description : t(descKeyMap[slug] ?? '');

  return (
    <header className="rounded-xl border border-[#E8E4DD] bg-white p-8 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-12">
      <p className="text-xs font-medium tracking-[0.22em] text-[#7A6A52] uppercase">
        {isChinese ? `Chapter ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1}`}
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#4A3728] sm:text-4xl lg:text-5xl">
        {displayTitle || title}
      </h1>
      <p className="mt-3 text-lg font-medium text-[#6A6256]">{displaySub || subtitle}</p>
      <div className="mx-auto mt-6 h-[2px] w-16 bg-[#C9A15A]" />
      <p
        className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#8A7E6A]"
        dangerouslySetInnerHTML={{ __html: displayDesc || description }}
      />
    </header>
  );
}
