import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8] px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-7xl">🌿</div>
        <h1 className="mb-3 text-4xl font-bold text-[#3D2B1F]">404</h1>
        <p className="mb-2 text-lg font-medium text-[#5D4A3A]">这一页似乎走丢了</p>
        <p className="mb-8 text-sm text-[#8A7E6A]">
          人生整理的路上偶尔也会迷路，没关系，回到起点重新出发就好。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C9A15A] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#B8912F] hover:shadow-md"
          >
            ← 回到首页
          </Link>
          <Link
            href="/chapter/chapter-1"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D5CFC2] bg-white px-6 py-3 text-sm font-medium text-[#5D4A3A] transition-all hover:bg-[#FAF8F3]"
          >
            开始阅读
          </Link>
        </div>
      </div>
    </div>
  );
}
