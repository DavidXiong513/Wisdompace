'use client';

import { useCallback } from 'react';
import { useReadingProgressStore } from '@/stores/readingProgressStore';
import { useCloudSync } from './useCloudSync';

interface ChapterProgress {
  sectionId: string;
  timestamp: number;
  percentComplete?: number;
}

/**
 * 章节阅读进度 Hook（本地 + 云端同步）
 *
 * 未登录：纯 localStorage，通过 readingProgressStore 保存
 * 已登录：本地缓存 + 自动同步到 Supabase progress 表
 */
export function useChapterReadingProgress(chapterSlug: string) {
  const { saveProgress: saveLocal } = useReadingProgressStore();

  const {
    data: cloudProgress,
    setData: saveCloud,
    syncStatus,
  } = useCloudSync<ChapterProgress>('chapter-read', chapterSlug, {
    localStorageKey: `wp-reading-progress-${chapterSlug}`,
    debounceMs: 2000,
  });

  const saveProgress = useCallback(
    (sectionId: string) => {
      const entry: ChapterProgress = {
        sectionId,
        timestamp: Date.now(),
      };

      // 本地（即时，兼容旧逻辑）
      saveLocal(chapterSlug, sectionId);

      // 云端（防抖）
      saveCloud(entry);
    },
    [chapterSlug, saveLocal, saveCloud]
  );

  return { progress: cloudProgress, saveProgress, syncStatus };
}
