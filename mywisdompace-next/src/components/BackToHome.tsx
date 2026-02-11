import Link from "next/link";

export default function BackToHome() {
  return (
    <div className="flex items-center justify-start">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium text-muted shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:bg-background hover:text-foreground hover:shadow-[var(--shadow-float)]"
      >
        <span className="text-base">←</span>
        <span>返回主页</span>
      </Link>
    </div>
  );
}
