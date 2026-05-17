'use no memo';
'use client';

import type { Chapter } from '@/data/chapters';
import { useTranslatedChapter } from '@/lib/hooks/useTranslatedChapter';
import { useTranslation } from 'react-i18next';
import { ChapterReader } from '@/components/chapter/ChapterReader';

type Props = {
  chapter: Chapter;
};

export default function ClientChapterContent({ chapter }: Props) {
  const { i18n } = useTranslation();
  const translated = useTranslatedChapter(chapter);
  const isChinese = (i18n.language || 'zh-CN').startsWith('zh');
  const display = isChinese ? chapter : translated;

  return <ChapterReader chapter={display} />;
}
