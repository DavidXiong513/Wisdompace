/**
 * 用户态管理 Hook
 *
 * 对接 Supabase Auth：
 * - 初始从 Zustand authStore 读取（持久化的用户信息）
 * - 调用 initSession() 从服务端验证 session，同步最新用户数据
 */

import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/lib/auth-placeholder';

export function useCurrentUser() {
  const user     = useAuthStore((s) => s.user);
  const status   = useAuthStore((s) => s.status);
  const error    = useAuthStore((s) => s.error);
  const initSession = useAuthStore((s) => s.initSession);
  const logoutStore  = useAuthStore((s) => s.logout);

  // 页面加载时：从服务端验证 session，同步最新用户数据
  useEffect(() => {
    if (status === 'loading') {
      initSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // 故意不加 initSession 依赖，避免每次渲染都触发

  const logout = useCallback(async () => {
    await logoutStore();
    // 登出后跳转到首页
    window.location.href = '/';
  }, [logoutStore]);

  return {
    user,
    isLoggedIn: status === 'authenticated',
    isLoading:  status === 'loading',
    error,
    updateUser: (newUser: AuthUser | null) => useAuthStore.getState().setUser(newUser),
    logout,
  };
}
