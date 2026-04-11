'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { QueryProvider } from '@/components/providers/QueryProvider';

/**
 * 聚合所有 Client Provider
 * - QueryProvider：TanStack Query
 * - useAuthStore.initSession()：初始化 Supabase Auth 会话
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // 初始化 Supabase Auth session（在 Client Component 顶层调用一次即可）
  useAuthStore.getState().initSession();

  return <QueryProvider>{children}</QueryProvider>;
}
