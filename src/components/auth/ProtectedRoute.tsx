'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * 重定向目标页面（默认: /login）
   * 未登录用户访问受保护路由时，跳转至此页面
   */
  redirectTo?: string;
}

/**
 * 客户端路由保护组件
 *
 * 使用场景：
 * - 需要登录才能访问的页面（如工具测评页）
 * - 在页面组件顶层包裹 <ProtectedRoute> 即可
 *
 * 工作原理：
 * 1. 依赖 middleware.ts 的服务端 Session 验证作为第一道防线
 * 2. 本组件作为客户端补充：处理页面加载时的状态同步和兜底跳转
 * 3. 优先信任 store.user（服务端刷新后已更新），避免重复验证请求
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialized, status } = useAuthStore();
  const isAuthenticated = status === 'authenticated';
  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      // 记录来源页面，登录后可以跳转回来
      const returnUrl = encodeURIComponent(pathname);
      const target =
        redirectTo.includes('?') //
          ? `${redirectTo}&returnUrl=${returnUrl}`
          : `${redirectTo}?returnUrl=${returnUrl}`;

      router.replace(target);
    }
    // else: 用户已登录，无需操作，initialized=true 时自然渲染 children
  }, [initialized, isAuthenticated, pathname, redirectTo, router]);

  // 未初始化时显示空白，避免闪烁
  // 未登录时 router.replace 会跳转，这里不渲染 children
  if (!initialized) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #8a7a6a)',
            fontFamily: 'var(--font-serif)',
          }}
        >
          正在验证身份…
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
