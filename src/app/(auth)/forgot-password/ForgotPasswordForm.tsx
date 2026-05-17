'use client';

import { FormEvent, useState } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';

export function ForgotPasswordForm() {
  const resetPassword = useAuthStore(s => s.resetPassword);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('请输入邮箱');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await resetPassword(trimmedEmail);
      if (!result.ok) {
        setError(result.message || '发送失败，请稍后重试');
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError('网络异常，请稍后重试');
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
        <div className="border-border bg-surface/95 rounded-3xl border p-8 text-center shadow-[var(--shadow-card)] sm:p-10">
          <div className="-mt-4 -mr-4 mb-2 flex items-start justify-end">
            <LanguageSwitcher className="text-muted" />
          </div>
          <div className="mb-4 text-5xl">📬</div>
          <h1 className="text-foreground text-2xl font-semibold">邮件已发送</h1>
          <p className="text-muted mt-3 text-sm leading-relaxed">
            我们已向 <strong className="text-foreground">{email}</strong> 发送了密码重置链接。
            <br />
            请检查你的邮箱（包括垃圾箱），点击链接重置密码。
          </p>
          <a
            href="/login"
            className="mt-6 inline-block rounded-2xl bg-[#C7A96A] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(60,45,24,0.35)] transition hover:bg-[#B58A3A]"
          >
            返回登录
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="border-border bg-surface/95 rounded-3xl border p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-semibold sm:text-3xl">忘记密码</h1>
            <p className="text-muted mt-2 text-sm">输入你的注册邮箱，我们将发送密码重置链接。</p>
          </div>
          <LanguageSwitcher className="text-muted mt-1 shrink-0" />
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="text-foreground block text-sm font-medium">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="请输入你的注册邮箱"
              autoComplete="email"
              className="border-border bg-background/60 text-foreground placeholder:text-muted w-full rounded-2xl border px-3 py-2.5 text-sm ring-0 outline-none focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
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
            {submitting ? '发送中…' : '发送重置链接'}
          </button>
        </form>

        <p className="text-muted mt-6 text-center text-sm">
          <a
            href="/login"
            className="font-medium text-[#C7A96A] underline decoration-[#E8C872]/50 underline-offset-2 hover:text-[#B58A3A]"
          >
            ← 返回登录
          </a>
        </p>
      </div>
    </div>
  );
}
