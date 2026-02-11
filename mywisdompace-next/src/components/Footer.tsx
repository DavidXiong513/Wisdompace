import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="space-y-1">
          <div className="font-medium text-foreground">《一生的整理》</div>
          <div>Warm humanism, with a tiny cyber accent.</div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="hover:text-foreground" href="/">
            首页
          </Link>
          <Link className="hover:text-foreground" href="/chapter/chapter-1">
            章节
          </Link>
          <Link className="hover:text-foreground" href="/login">
            登录
          </Link>
        </div>
      </div>
    </footer>
  );
}
