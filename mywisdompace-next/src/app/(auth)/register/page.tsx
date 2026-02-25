"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { registerUser } from "@/lib/auth-placeholder";
import { setCurrentUserForDemo } from "@/hooks/useCurrentUser";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("请输入昵称");
      return;
    }

    if (!trimmedEmail) {
      setError("请输入邮箱");
      return;
    }

    if (password.length < 6) {
      setError("密码长度至少 6 位");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (!agreeTerms) {
      setError("请先阅读并同意相关条款");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        password,
        agreeTerms,
      });

      if (!result.ok) {
        setError(result.message || "注册失败，请稍后重试");
        setSubmitting(false);
        return;
      }

      // 注册成功：设置用户状态并跳转（当前为内存模拟，后续接入真实认证后会写入 Cookie）
      setCurrentUserForDemo(result.data);
      router.push("/");
    } catch {
      setError("网络异常，请稍后重试");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      <div className="rounded-3xl border border-border bg-surface/95 p-8 shadow-[var(--shadow-card)] sm:p-10">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">注册</h1>
        <p className="mt-2 text-sm text-muted">
          使用邮箱创建你的 Wisdompace 账号，后续可以保存阅读进度和工具使用记录。
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">昵称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你希望被怎样称呼？"
              autoComplete="name"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="用于登录和找回密码"
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
              placeholder="至少 6 位，建议包含数字和字母"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              autoComplete="new-password"
              className="w-full rounded-2xl border border-border bg-background/60 px-3 py-2.5 text-sm text-foreground outline-none ring-0 placeholder:text-muted focus:border-[#C7A96A] focus:ring-2 focus:ring-[#E8C872]/60"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-[2px] h-3.5 w-3.5 rounded border border-border text-[#C7A96A] focus:outline-none focus:ring-1 focus:ring-[#E8C872]/70"
            />
            <span>
              我已阅读并理解本站的使用方式，愿意在能力范围内为自己的人生负责。
            </span>
          </label>

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
            {submitting ? "注册中..." : "注册"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-muted">
          <Link className="hover:text-foreground" href="/login">
            已有账号？去登录
          </Link>
          <Link className="hover:text-foreground" href="/">
            先随便逛逛
          </Link>
        </div>

        <div className="mt-6 text-center text-[11px] leading-relaxed text-muted">
          当前为体验阶段，账号体系会逐步完善。正式上线前，我们会补充隐私与条款说明。
        </div>
      </div>
    </div>
  );
}
