'use client';

import { useTranslation } from 'react-i18next';

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

  // Generate keys consistently with useTranslatedChapter
  const chapterKey = `chapter.${slug.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase())}`;
  const titleKey = chapterKey;
  const subKey = `${chapterKey}Sub`;
  const descKey = `${chapterKey}Desc`;

  const displayTitle = isChinese ? title : (t(titleKey) !== titleKey ? t(titleKey) : title);
  const displaySub = isChinese ? subtitle : (t(subKey) !== subKey ? t(subKey) : subtitle);
  const displayDesc = isChinese ? description : (t(descKey) !== descKey ? t(descKey) : description);

  // Label for Prologue vs Chapter X
  const label = slug === 'read-instructions' 
    ? (isChinese ? '序言' : 'Prologue')
    : (isChinese ? `Chapter ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1}`);

  return (
    <header className="rounded-xl border border-[#E8E4DD] bg-white p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)] sm:p-12">
      <p className="text-[10px] font-medium tracking-[0.22em] text-[#7A6A52] uppercase sm:text-xs">
        {label}
      </p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#4A3728] sm:text-4xl lg:text-5xl">
        {displayTitle}
      </h1>
      <p className="mt-3 text-base font-medium text-[#6A6256] sm:text-lg">{displaySub}</p>
      <div className="mx-auto mt-6 h-[2px] w-16 bg-[#C9A15A]" />
      <p
        className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#8A7E6A]"
        dangerouslySetInnerHTML={{ __html: displayDesc }}
      />
    </header>
  );
}
