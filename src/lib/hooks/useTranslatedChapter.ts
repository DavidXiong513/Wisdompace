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

    // Translate top-level chapter info
    const chapterKey = `chapter.${chapter.slug.replace(/-([a-z0-9])/g, (_, g) => g.toUpperCase())}`;
    const chapterTitle = t(chapterKey) !== chapterKey ? t(chapterKey) : chapter.title;
    const chapterSub = t(`${chapterKey}Sub`) !== `${chapterKey}Sub` ? t(`${chapterKey}Sub`) : chapter.subtitle;
    const chapterDesc = t(`${chapterKey}Desc`) !== `${chapterKey}Desc` ? t(`${chapterKey}Desc`) : chapter.description;

    const translatedSections: ChapterSection[] = chapter.sections.map(section => {
      const baseKey = `chapterContent.${chapter.slug}.${section.id}`;

      // Try new structured format: {key}.title + {key}.paragraphs + {key}.questions
      const titleKey = `${baseKey}.title`;
      const foundTitle = t(titleKey) !== titleKey ? t(titleKey) : null;

      if (foundTitle) {
        // New format exists — also check paragraphs and questions
        const paragraphsKey = `${baseKey}.paragraphs`;
        const rawParagraphs = t(paragraphsKey, { returnObjects: true });
        const paragraphs =
          Array.isArray(rawParagraphs) && rawParagraphs.length > 0
            ? (rawParagraphs as string[])
            : section.paragraphs;

        const questionsKey = `${baseKey}.questions`;
        const rawQuestions = t(questionsKey, { returnObjects: true });
        const questions =
          Array.isArray(rawQuestions) && rawQuestions.length > 0
            ? (rawQuestions as string[])
            : section.questions;

        return { ...section, title: foundTitle, paragraphs, questions };
      }

      // Fall back to old flat format: {key} is the title string directly
      const flatTitle = t(baseKey);
      return {
        ...section,
        title: flatTitle !== baseKey ? flatTitle : section.title,
      };
    });

    return {
      ...chapter,
      title: chapterTitle,
      subtitle: chapterSub,
      description: chapterDesc,
      sections: translatedSections,
    };
  }, [chapter, lng, t]);
}
