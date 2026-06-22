'use no memo';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  syncPeopleInsightWithCloud,
  uploadPeopleInsightToCloud,
} from '@/knowpeople/services/cloudSyncService';

/**
 * 慧眼识人云同步 Hook
 *
 * 行为：
 * 1. 用户登录后，页面首次加载时执行一次双向同步（以最新时间戳为准）
 * 2. 之后每 30 秒尝试上传一次本地数据（仅登录用户）
 * 3. 如果用户未登录，不执行任何网络请求，数据保持本地 IndexedDB
 */

const SYNC_INTERVAL_MS = 30_000;

export function usePeopleInsightCloudSync() {
  const user = useAuthStore(s => s.user);
  const isLoggedIn = !!user;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) return;

    // 首次加载：双向同步，以最新时间戳为准
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      syncPeopleInsightWithCloud().catch(err => {
        console.error('[PeopleInsightCloudSync] initial sync failed:', err);
      });
    }

    // 定时上传：将本地最新数据推送到云端
    timerRef.current = setInterval(() => {
      uploadPeopleInsightToCloud().catch(err => {
        console.error('[PeopleInsightCloudSync] interval upload failed:', err);
      });
    }, SYNC_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isLoggedIn]);
}
