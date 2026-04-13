'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { QueryProvider } from '@/components/providers/QueryProvider';
import '@/i18n/config';

/**
 * 路由切换时自动滚动到页面顶部
 * Next.js App Router 的 <Link> 默认 scroll=true，但某些情况下
 * （如同动态路由段软导航、scroll-behavior:smooth 干扰）不会正确滚动。
 * 在全局 providers 层监听 pathname 变化，强制 scrollTo(0, 0) 最可靠。
 */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * 聚合所有 Client Provider
 * - QueryProvider：TanStack Query
 * - useAuthStore.initSession()：初始化 Supabase Auth 会话
 * - ScrollToTopOnRouteChange：路由切换时滚动到顶部
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // 初始化 Supabase Auth session（在 Client Component 顶层调用一次即可）
  useAuthStore.getState().initSession();

  return (
    <QueryProvider>
      <ScrollToTopOnRouteChange />
      {children}
    </QueryProvider>
  );
}
