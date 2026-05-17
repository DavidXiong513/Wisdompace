'use no memo';

'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Chapter, ChapterSection } from '@/data/chapters';

/**
 * Translates chapter section titles based on current language.
 * Body paragraphs remain from the original data (too voluminous to translate).
 * Falls back to original Chinese title if no translation key exists.
 */
export function useTranslatedChapter(chapter: Chapter): Chapter {
  const { i18n } = useTranslation();
  const lng = i18n.language || 'zh-CN';

  return useMemo(() => {
    // 中文模式直接返回原始数据
    if (lng.startsWith('zh')) return chapter;

    const translatedSections: ChapterSection[] = chapter.sections.map(section => {
      const key = `chapterContent.${chapter.slug}.${section.id}`;
      // i18next 的 t() 在 key 不存在时返回 key 本身
      // 我们用 getResourceBundle 来判断是否存在该 key
      const bundle = i18n.getResourceBundle(lng, 'common');
      const parts = key.split('.');
      let value: unknown = bundle;
      for (const part of parts) {
        if (value && typeof value === 'object' && part in value) {
          value = (value as Record<string, unknown>)[part];
        } else {
          value = undefined;
          break;
        }
      }
      const translatedTitle = typeof value === 'string' ? value : null;

      return {
        ...section,
        title: translatedTitle || section.title,
      };
    });

    return {
      ...chapter,
      sections: translatedSections,
    };
  }, [chapter, lng, i18n]);
}
