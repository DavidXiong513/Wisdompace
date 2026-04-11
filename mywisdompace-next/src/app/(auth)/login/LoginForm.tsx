'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/authStore';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe] = useState(true); // rememberMe 暂未使用，由 Supabase 管理
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState('/');

  // 从 URL 读取 returnUrl（登录后跳转回来源页面）
  useEffect(() => {
    const returnParam = searchParams.get('returnUrl');
    if (returnParam && returnParam.startsWith('/')) {
      setReturnUrl(returnParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await login(trimmedEmail, password);

      if (!result.ok) {
        setError(result.message || '登录失败，请稍后重试');
        setSubmitting(false);
        return;
      }

      // 登录成功：跳转到来源页面或首页
      router.push(returnUrl);
    } catch {
      setError('网络异常，请稍后重试');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-border bg-surface/95 p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">登录</h1>
        <p className="mt-2 text-sm text-muted">
          使用邮箱登录你的 Wisdompace 账号，后续可以同步阅读进度与工具使用记录。
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="请输入你的邮箱"
              autoComplete="email"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => {}} // 暂未使用，由 Supabase 管理
                className="h-3.5 w-3.5 rounded border border-border text-[#C7A96A] focus:outline-none focus:ring-1 focus:ring-[#E8C872]/70"
              />
              <span>记住我（在这台设备上保持登录）</span>
            </label>
            <button type="button" className="cursor-not-allowed text-muted">
              忘记密码（筹备中）
            </button>
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
            {submitting ? '登录中…' : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          还没有账号？{' '}
          <a
            href="/register"
            className="font-medium text-[#C7A96A] underline decoration-[#E8C872]/50 underline-offset-2 hover:text-[#B58A3A]"
          >
            立即注册
          </a>
        </p>
      </div>
    </div>
  );
}
