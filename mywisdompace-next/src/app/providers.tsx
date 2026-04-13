'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { QueryProvider } from '@/components/providers/QueryProvider';
import '@/i18n/config';

/**
 * 路由切换时强制滚动到页面顶部
 *
 * Next.js App Router 软导航（尤其是同一段动态路由如 /chapter/chapter-1 → /chapter/chapter-2）
 * 不会自动重置滚动位置。
 *
 * 修复策略：
 * 1. 全局 scroll-behavior: smooth 已从 globals.css 移除（它是导致随机位置的核心元凶）
 * 2. useLayoutEffect 在 DOM 绘制前同步执行 scrollTo(0,0)
 * 3. 双重 rAF 确保在 Next.js 完成页面渲染后再次确认位置
 * 4. 100ms 兜底 setTimeout 防止极端情况
 */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const isScrollingRef = useRef(false);

  const forceScrollToTop = useCallback(() => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;

    // 多种方式同时设置，覆盖所有浏览器行为
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 双重 rAF：等 Next.js 完成新页面渲染后再次确认
    requestAnimationFrame(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      requestAnimationFrame(() => {
        document.documentElement.scrollTop = 0;
        isScrollingRef.current = false;
      });
    });
  }, []);

  // useLayoutEffect：在浏览器绘制前同步执行，比 useEffect 更可靠
  useLayoutEffect(() => {
    forceScrollToTop();
  }, [pathname, forceScrollToTop]);

  // 兜底：渲染后 100ms 再确认一次
  useEffect(() => {
    const timer = setTimeout(() => {
      if (document.documentElement.scrollTop > 10) {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    }, 100);
    return () => clearTimeout(timer);
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
