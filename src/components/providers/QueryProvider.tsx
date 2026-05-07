'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

/**
 * QueryClientProvider
 * 在用户登录后初始化 QueryClient，确保所有请求都携带正确的 Supabase session。
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 已登录：默认缓存 5 分钟，避免频繁请求
            // 未登录：设置为 0，禁用服务端数据缓存
            staleTime: useAuthStore.getState().user ? 5 * 60 * 1000 : 0,
            gcTime: useAuthStore.getState().user ? 30 * 60 * 1000 : 0,
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
