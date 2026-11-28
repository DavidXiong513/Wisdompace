/**
 * 认证状态管理（Zustand + Supabase Auth）
 *
 * 职责：
 * - 管理全局认证状态（用户信息、登录态）
 * - 提供 login / register / logout 方法封装
 * - 与 Supabase Auth 双向同步
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { AuthUser } from '@/lib/auth-placeholder';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * initSession 的单飞（in-flight）守卫。
 *
 * Providers 与 useCurrentUser 都会在挂载时调用 initSession()，
 * 若不加守卫会对 Supabase 发起两次并发 getUser() 请求，
 * 白白占用首屏主线程与网络。这里让并发调用共享同一个 Promise。
 */
let initSessionPromise: Promise<void> | null = null;

interface AuthState {
  // 状态
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  /** 初始 session 校验是否已完成（用于 SSR 水合判断） */
  initialized: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setInitialized: () => void;

  // 认证方法
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  initSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ ok: boolean; message?: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; message?: string }>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ==================== 状态 ==================== //
      user: null,
      status: 'loading', // 初始为 loading，等 initSession 完成后确定
      error: null,
      initialized: false,

      // ==================== 状态更新 ==================== //
      setUser: user => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
      setStatus: status => set({ status }),
      setError: error => set({ error }),
      clearError: () => set({ error: null }),
      setInitialized: () => set({ initialized: true }),

      // ==================== 认证方法 ==================== //

      /**
       * 初始化会话 — 从 Supabase 获取当前 session
       * 每次页面加载时调用（通过 middleware 已在 cookie 写入，这里做客户端同步）
       *
       * 使用单飞守卫：并发调用共享同一次网络请求，避免重复 getUser()。
       */
      initSession: async () => {
        if (initSessionPromise) return initSessionPromise;

        initSessionPromise = (async () => {
          try {
            const supabase = createClient();
            const {
              data: { user: supaUser },
              error,
            } = await supabase.auth.getUser();

            if (error || !supaUser) {
              set({ user: null, status: 'unauthenticated', initialized: true });
              return;
            }

            set({
              user: toAuthUser(supaUser),
              status: 'authenticated',
              initialized: true,
            });
          } catch {
            set({ user: null, status: 'unauthenticated', initialized: true });
          } finally {
            // 请求结束后释放守卫，允许后续（如登录后）再次校验
            initSessionPromise = null;
          }
        })();

        return initSessionPromise;
      },

      /**
       * 登录
       */
      login: async (email, password) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          const message = mapAuthError(error);
          set({ error: message });
          return { ok: false, message };
        }

        // 性能：signInWithPassword 的响应里已包含 user，
        // 直接落到 store，省掉一次多余的 auth.getUser() 网络往返
        // （原实现会多打一个请求，登录感知延迟明显更高）
        if (data?.user) {
          set({
            user: toAuthUser(data.user),
            status: 'authenticated',
            initialized: true,
            error: null,
          });
        } else {
          await get().initSession();
          set({ error: null });
        }

        // 登录成功后，异步合并本地数据到云端（非阻塞）
        try {
          const { syncLocalToCloud } = await import('@/lib/sync');
          syncLocalToCloud().catch(() => {
            // 静默忽略同步错误，不影响登录体验
          });
        } catch {
          // 动态导入失败也忽略
        }

        return { ok: true };
      },

      /**
       * 注册
       */
      register: async (name, email, password) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          const message = mapAuthError(error);
          set({ error: message });
          return { ok: false, message };
        }

        // 若项目开启了邮箱验证，signUp 不返回 session（data.session 为 null），
        // 此时保持未登录态，等用户点邮件里的链接走 /auth/callback。
        // 若已自动登录，则直接用返回的 user，省掉一次 getUser() 往返。
        if (data?.session && data.user) {
          set({
            user: toAuthUser(data.user),
            status: 'authenticated',
            initialized: true,
            error: null,
          });
        } else {
          await get().initSession();
          set({ error: null });
        }

        // 注册登录成功后，异步合并本地数据到云端（非阻塞）
        try {
          const { syncLocalToCloud } = await import('@/lib/sync');
          syncLocalToCloud().catch(() => {
            // 静默忽略同步错误
          });
        } catch {
          // 动态导入失败也忽略
        }

        return { ok: true };
      },

      /**
       * 登出
       */
      logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, status: 'unauthenticated', error: null });
      },

      /**
       * 发送密码重置邮件
       */
      resetPassword: async email => {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          const message = mapAuthError(error);
          set({ error: message });
          return { ok: false, message };
        }

        set({ error: null });
        return { ok: true };
      },

      /**
       * 更新密码（在重置密码页面调用，需已有有效 session）
       */
      updatePassword: async password => {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
          const message = mapAuthError(error);
          set({ error: message });
          return { ok: false, message };
        }

        set({ error: null });
        return { ok: true };
      },
    }),
    {
      name: 'auth-storage',
      // 只持久化必要字段
      partialize: state => ({
        user: state.user,
      }),
      // 合并策略：服务端 session 为准，localStorage 仅做降级缓存
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AuthState>),
        // 每次恢复时强制重新验证 session
        status: 'loading',
      }),
    }
  )
);

/**
 * 把 Supabase 返回的 user 对象归一化为应用内的 AuthUser。
 */
function toAuthUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): AuthUser {
  const metaName = user.user_metadata?.name;
  const name =
    typeof metaName === 'string' && metaName.length > 0
      ? metaName
      : user.email
        ? user.email.split('@')[0]
        : '用户';

  return {
    id: user.id,
    email: user.email ?? undefined,
    name,
  };
}

/**
 * Supabase Auth 错误码映射为中文友好提示
 */
function mapAuthError(error: { message?: string; code?: string }): string {
  const msg = error.message ?? error.code ?? '';

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return '邮箱或密码错误';
  }
  if (msg.includes('Email not confirmed') || msg.includes('email_not_confirmed')) {
    return '请先验证邮箱，登录链接已发送到您的邮箱';
  }
  if (msg.includes('User already registered') || msg.includes('user_already_exists')) {
    return '该邮箱已被注册，请直接登录或使用其他邮箱';
  }
  if (msg.includes('Password should be at least 6 characters')) {
    return '密码长度至少 6 位';
  }
  if (msg.includes('rate limit') || msg.includes('over_request_rate_limit_or_retry_interval')) {
    return '操作过于频繁，请稍后再试';
  }
  if (msg.includes('Invalid email') || msg.includes('invalid_email')) {
    return '邮箱格式不正确';
  }

  // 网络连接失败
  if (msg.includes('fetch failed') || msg.includes('NetworkError') || msg.includes('network')) {
    return '网络连接异常，请检查网络后重试';
  }

  // 通用兜底
  return msg || '操作失败，请稍后再试';
}
