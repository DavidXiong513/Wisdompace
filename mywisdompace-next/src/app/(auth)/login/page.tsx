import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-border bg-surface p-8 shadow-[var(--shadow-card)]">
        <h1 className="text-2xl font-semibold text-foreground">登录</h1>
        <p className="mt-2 text-sm text-muted">
          这是占位页：后续接入真正的注册/登录与用户态。
        </p>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted">
            预留字段：邮箱/手机号、验证码或密码、第三方登录等
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link className="text-muted hover:text-foreground" href="/register">
              去注册
            </Link>
            <Link className="text-muted hover:text-foreground" href="/">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
