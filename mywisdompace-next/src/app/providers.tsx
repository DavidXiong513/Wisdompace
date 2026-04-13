'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { QueryProvider } from '@/components/providers/QueryProvider';
import '@/i18n/config';

/**
 * 路由切换时自动滚动到页面顶部
 *
 * Next.js App Router 的 <Link> 默认 scroll=true，但以下场景会失效：
 * 1. 同一动态路由段软导航（如 /chapter/chapter-1 → /chapter/chapter-2）
 * 2. 全局 scroll-behavior: smooth 导致 scrollTo 变成动画，与 DOM 更新冲突
 *
 * 修复方式：
 * - 先临时关闭 smooth scroll → 立即跳转到顶部 → 恢复 smooth scroll
 * - 同时设置 document.documentElement.scrollTop = 0 作为双保险
 */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    // 临时禁用 smooth scroll
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';

    // 双保险：两种方式同时设置
    html.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);

    // 恢复 smooth scroll（下一帧，避免影响本次跳转）
    requestAnimationFrame(() => {
      html.style.scrollBehavior = prevBehavior || '';
    });
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
