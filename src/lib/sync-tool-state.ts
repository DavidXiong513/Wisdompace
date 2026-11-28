'use client';

import type { ProgressCategory } from '@/lib/validations/progress';

/**
 * 同步工具中间状态到云端（直接 fetch，不依赖 React Hook）
 *
 * 用于 Zustand Store 内部，在状态变更时防抖同步到 Supabase progress 表。
 */

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * 是否已登录（读 auth-storage）
 *
 * 未登录时不发任何 /api/progress 请求：否则匿名用户每打开一个工具页面
 * 都会在控制台留下一条 401，且白跑一次网络往返。
 */
function hasAuthUser(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const raw = localStorage.getItem('auth-storage');
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as { state?: { user?: { id?: string } } };
    return Boolean(data?.state?.user?.id);
  } catch {
    return false;
  }
}

export function syncToolState(
  category: ProgressCategory,
  key: string,
  state: unknown
): void {
  // 清除旧定时器
  const timerKey = `${category}:${key}`;
  if (debounceTimers.has(timerKey)) {
    clearTimeout(debounceTimers.get(timerKey)!);
  }

  // 设置新防抖定时器（1.5 秒）
  debounceTimers.set(
    timerKey,
    setTimeout(() => {
      // 未登录不同步
      if (!hasAuthUser()) return;

      // 发送请求
      const payload = {
        category,
        key,
        value: {
          state,
          updatedAt: new Date().toISOString(),
        },
      };

      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // 静默忽略网络错误
      });

      debounceTimers.delete(timerKey);
    }, 1500)
  );
}

/**
 * 从云端拉取工具状态（用于 onFinishHydration 时合并）
 */
export async function fetchToolState(
  category: ProgressCategory,
  key: string
): Promise<unknown | null> {
  // 未登录直接返回：避免匿名访问打出一个 401
  if (!hasAuthUser()) return null;
  try {
    const res = await fetch(`/api/progress?category=${category}`);
    if (!res.ok) return null;
    const json = await res.json();
    const items = json.data as Array<{ key: string; value: { state?: unknown } }> | undefined;
    const item = items?.find((i) => i.key === key);
    return item?.value?.state ?? null;
  } catch {
    return null;
  }
}
