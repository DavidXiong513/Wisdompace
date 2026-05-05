'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProgressItem, useUpsertProgress } from '@/lib/hooks/useProgress';
import type { ProgressCategory } from '@/lib/validations/progress';

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseCloudSyncOptions<T> {
  localStorageKey?: string;
  debounceMs?: number;
  serialize?: (data: T) => unknown;
  deserialize?: (raw: unknown) => T;
}

interface LocalPayload<T> {
  data: T;
  updatedAt: string;
}

/**
 * 通用云端同步 Hook
 *
 * 对调用者透明地管理「本地缓存 + 云端同步」：
 * - 未登录：纯 localStorage，体验与当前一致
 * - 已登录：本地缓存 + 自动同步到 Supabase（防抖）
 * - 初始化时：本地与云端时间戳比较，保留较新的
 */
export function useCloudSync<T>(
  category: ProgressCategory,
  key: string,
  options: UseCloudSyncOptions<T> = {}
) {
  const {
    localStorageKey = `wp-cloud-sync-${category}-${key}`,
    debounceMs = 1000,
    serialize = (d) => d as unknown,
    deserialize = (r) => r as T,
  } = options;

  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  const [data, setDataState] = useState<T | undefined>(undefined);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [initialized, setInitialized] = useState(false);

  const { data: cloudItem, isLoading } = useProgressItem(category, key);
  const upsert = useUpsertProgress();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ====== 初始化：先读本地，再合并云端（只执行一次）======
  useEffect(() => {
    if (initialized) return;
    if (isLoading) return;

    let local: LocalPayload<T> | null = null;
    try {
      const raw = localStorage.getItem(localStorageKey);
      if (raw) local = JSON.parse(raw) as LocalPayload<T>;
    } catch {
      // ignore parse error
    }

    if (cloudItem) {
      const cloudValue = cloudItem.value as { data: unknown; updatedAt: string } | undefined;
      if (cloudValue?.updatedAt) {
        const cloudTime = new Date(cloudValue.updatedAt).getTime();
        const localTime = local ? new Date(local.updatedAt).getTime() : 0;

        if (cloudTime >= localTime) {
          // 云端较新或相等 → 用云端数据
          try {
            setDataState(deserialize(cloudValue.data));
          } catch {
            // 反序列化失败，fallback 到本地
            if (local) setDataState(local.data);
          }
        } else {
          // 本地较新 → 保持本地，稍后由防抖自动上传
          if (local) setDataState(local.data);
        }
      } else {
        // 云端数据格式异常，fallback 到本地
        if (local) setDataState(local.data);
      }
    } else if (local) {
      // 无云端数据 → 用本地
      setDataState(local.data);
    }

    setInitialized(true);
  }, [cloudItem, isLoading, initialized, localStorageKey, deserialize]);

  // ====== 设置数据：本地即时 + 云端防抖 ======
  const setData = useCallback(
    (value: T | ((prev: T | undefined) => T)) => {
      setDataState((prev) => {
        const next = typeof value === 'function'
          ? (value as (prev: T | undefined) => T)(prev)
          : value;

        // 1. 即时写入 localStorage
        const payload = {
          data: serialize(next),
          updatedAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(payload));
        } catch {
          // 忽略存储失败（如空间满）
        }

        // 2. 清除旧定时器，设置新防抖
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSyncStatus('saving');
        debounceRef.current = setTimeout(() => {
          if (isLoggedIn) {
            upsert.mutate(
              { category, key, value: payload },
              {
                onSuccess: () => {
                  setSyncStatus('saved');
                  // 2 秒后恢复 idle
                  setTimeout(() => {
                    setSyncStatus((s) => (s === 'saved' ? 'idle' : s));
                  }, 2000);
                },
                onError: () => {
                  setSyncStatus('error');
                },
              }
            );
          } else {
            // 未登录用户：显示本地保存成功
            setSyncStatus('saved');
            setTimeout(() => {
              setSyncStatus((s) => (s === 'saved' ? 'idle' : s));
            }, 2000);
          }
        }, debounceMs);

        return next;
      });
    },
    [category, key, localStorageKey, serialize, isLoggedIn, upsert, debounceMs]
  );

  // ====== 清理 ======
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { data, setData, syncStatus, isLoading: isLoading || !initialized };
}
