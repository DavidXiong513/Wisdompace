'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { createClient } from '@/lib/supabase/client';

export function ResetPasswordForm() {
  const router = useRouter();
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [validSession, setValidSession] = useState(false);

  // 检查是否有有效的重置 session（Supabase 通过 URL hash 中的 token 自动建立）
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
      }
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await updatePassword(password);
      if (!result.ok) {
        setError(result.message || '重置失败，请稍后重试');
        setSubmitting(false);
        return;
      }
      // 重置成功，跳转到登录页
      router.push('/login');
    } catch {
      setError('网络异常，请稍后重试');
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-border bg-surface/95 p-8 shadow-[var(--shadow-card)] sm:p-10 text-center">
          <p className="text-sm text-muted">正在验证链接…</p>
        </div>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="rounded-3xl border border-border bg-surface/95 p-8 shadow-[var(--shadow-card)] sm:p-10 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-foreground">链接无效或已过期</h1>
          <p className="mt-3 text-sm text-muted leading-relaxed">
            密码重置链接可能已过期或已被使用。
            <br />
            请重新申请密码重置。
          </p>
          <a
            href="/forgot-password"
            className="mt-6 inline-block rounded-2xl bg-[#C7A96A] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(60,45,24,0.35)] transition hover:bg-[#B58A3A]"
          >
            重新申请
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-border bg-surface/95 p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">设置新密码</h1>
        <p className="mt-2 text-sm text-muted">
          请输入你的新密码。
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">新密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再输一次密码"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-2xl bg-[#C7A96A] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(60,45,24,0.35)] transition hover:bg-[#B58A3A] hover:shadow-[0_18px_40px_rgba(60,45,24,0.45)] disabled:pointer-events-none disabled:opacity-70"
          >
            {submitting ? '重置中…' : '确认重置'}
          </button>
        </form>
      </div>
    </div>
  );
}
