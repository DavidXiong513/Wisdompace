'use no memo';

'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Chapter, ChapterSection } from '@/data/chapters';

export function useTranslatedChapter(chapter: Chapter): Chapter {
  const { t, i18n } = useTranslation();
  const lng = i18n.language || 'zh-CN';

  return useMemo(() => {
    if (lng.startsWith('zh')) return chapter;

    const translatedSections: ChapterSection[] = chapter.sections.map(section => {
      const baseKey = `chapterContent.${chapter.slug}.${section.id}`;

      // Try new structured format: {key}.title + {key}.paragraphs
      const titleKey = `${baseKey}.title`;
      const foundTitle = t(titleKey) !== titleKey ? t(titleKey) : null;

      if (foundTitle) {
        // New format exists — also check paragraphs
        const paragraphsKey = `${baseKey}.paragraphs`;
        const rawParagraphs = t(paragraphsKey, { returnObjects: true });
        const paragraphs =
          Array.isArray(rawParagraphs) && rawParagraphs.length > 0
            ? (rawParagraphs as string[])
            : section.paragraphs;
        return { ...section, title: foundTitle, paragraphs };
      }

      // Fall back to old flat format: {key} is the title string directly
      const flatTitle = t(baseKey);
      return {
        ...section,
        title: flatTitle !== baseKey ? flatTitle : section.title,
      };
    });

    return { ...chapter, sections: translatedSections };
  }, [chapter, lng, t]);
}
