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
 *
 * 性能优化（首屏）：
 * 首屏挂载时浏览器本身就是从顶部开始绘制的，此时再写 scrollTop 会强制一次
 * 同步布局计算（forced reflow），属于首屏可交互延迟的隐藏成本。
 * 因此首次 commit 直接跳过，只有真正的路由变化才执行滚动。
 */
function ScrollToTopOnRouteChange() {
  const pathname = usePathname();
  const isScrollingRef = useRef(false);
  const isFirstCommitRef = useRef(true);

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
    if (isFirstCommitRef.current) {
      // 首屏无需滚动，避免强制同步布局
      isFirstCommitRef.current = false;
      return;
    }
    forceScrollToTop();
  }, [pathname, forceScrollToTop]);

  // 兜底：渲染后 100ms 再确认一次（首屏位置必然为 0，条件判断自然跳过）
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
 * 在浏览器空闲时执行任务，避免与首屏渲染抢主线程。
 * Safari 不支持 requestIdleCallback，回退到短延时。
 */
function runWhenIdle(task: () => void) {
  if (typeof window === 'undefined') return;
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(task, { timeout: 2000 });
  } else {
    setTimeout(task, 200);
  }
}

/**
 * 聚合所有 Client Provider
 * - QueryProvider：TanStack Query
 * - useAuthStore.initSession()：初始化 Supabase Auth 会话
 * - ScrollToTopOnRouteChange：路由切换时滚动到顶部
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // 初始化 Supabase Auth session
  // 放到浏览器空闲时段执行：getUser() 是网络请求，若在首帧后立刻发起，
  // 会与图片解码/LCP 抢主线程，并触发一次额外重渲染。
  useEffect(() => {
    runWhenIdle(() => {
      useAuthStore.getState().initSession();
    });
  }, []);

  return (
    <QueryProvider>
      <ScrollToTopOnRouteChange />
      {children}
    </QueryProvider>
  );
}
