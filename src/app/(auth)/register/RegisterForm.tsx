'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

import { useAuthStore } from '@/stores/authStore';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const register = useAuthStore(s => s.register);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 从 URL 读取 returnUrl（注册后跳转回来源页面）
  const returnUrl = useMemo(() => {
    const p = searchParams.get('returnUrl');
    return p && p.startsWith('/') ? p : '/';
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('请输入昵称');
      return;
    }

    if (!trimmedEmail) {
      setError('请输入邮箱');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少 6 位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (!agreeTerms) {
      setError('请先阅读并同意相关条款');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await register(trimmedName, trimmedEmail, password);

      if (!result.ok) {
        setError(result.message || '注册失败，请稍后重试');
        setSubmitting(false);
        return;
      }

      // 注册成功：跳转到来源页面或首页
      router.push(returnUrl);
    } catch {
      setError('网络异常，请稍后重试');
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="border-border bg-surface/95 rounded-3xl border p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">注册</h1>
            <p className="text-muted mt-2 text-sm">
              创建一个 Wisdompace 账号，开始记录你的整理之路。
            </p>
          </div>
          <LanguageSwitcher className="text-muted mt-1 shrink-0" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="text-foreground block text-sm font-medium">昵称</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="你希望我们怎么称呼你"
              autoComplete="nickname"
              className="border-border bg-background/60 text-foreground placeholder:text-muted w-full rounded-2xl border px-3 py-2.5 text-sm ring-0 outline-none focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-foreground block text-sm font-medium">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="用于登录和找回账号"
              autoComplete="email"
              className="border-border bg-background/60 text-foreground placeholder:text-muted w-full rounded-2xl border px-3 py-2.5 text-sm ring-0 outline-none focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-foreground block text-sm font-medium">密码</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="至少 6 位"
              autoComplete="new-password"
              className="border-border bg-background/60 text-foreground placeholder:text-muted w-full rounded-2xl border px-3 py-2.5 text-sm ring-0 outline-none focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="text-foreground block text-sm font-medium">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="再输一次密码"
              autoComplete="new-password"
              className="border-border bg-background/60 text-foreground placeholder:text-muted w-full rounded-2xl border px-3 py-2.5 text-sm ring-0 outline-none focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="text-muted flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="border-border mt-0.5 h-3.5 w-3.5 shrink-0 rounded border text-[#C7A96A] focus:ring-1 focus:ring-[#E8C872]/70 focus:outline-none"
            />
            <span>
              我已阅读并同意{' '}
              <button type="button" className="underline underline-offset-1 hover:text-[#B58A3A]">
                服务条款
              </button>{' '}
              和{' '}
              <button type="button" className="underline underline-offset-1 hover:text-[#B58A3A]">
                隐私政策
              </button>
            </span>
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
            {submitting ? '注册中…' : '注册'}
          </button>
        </form>

        <p className="text-muted mt-6 text-center text-sm">
          已有账号？{' '}
          <a
            href="/login"
            className="font-medium text-[#C7A96A] underline decoration-[#E8C872]/50 underline-offset-2 hover:text-[#B58A3A]"
          >
            立即登录
          </a>
        </p>
      </div>
    </div>
  );
}
