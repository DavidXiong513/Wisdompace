import Link from 'next/link';

export function RolePieChartCard() {
  return (
    <div className="mt-8">
      <Link
        href="/tools/role-pie-chart"
        className="group relative block overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,32,23,0.12)]"
      >
        {/* 背景渐变装饰 */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#E8C872] to-[#D4A574] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

        {/* 徽章 */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-[#F8F2E6] px-3 py-1 text-xs font-medium text-[#7A6A52]">
            自我探索
          </span>
        </div>

        {/* 图标 */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#F8F2E6] to-white text-3xl shadow-sm">
          🥧
        </div>

        {/* 标题 */}
        <h3 className="relative text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#C9A15A]">
          人生角色饼图
        </h3>

        {/* 副标题 */}
        <p className="relative mt-1 text-sm font-medium text-[#8A7E6A]">
          角色分配可视化
        </p>

        {/* 描述 */}
        <p className="relative mt-3 text-sm leading-relaxed text-[#6A6256]">
          帮助你梳理生活中的各种角色分配，看见时间与精力的去向。
        </p>

        {/* 箭头指示 */}
        <div className="relative mt-4 flex items-center text-sm font-medium text-[#C9A15A] transition-transform group-hover:translate-x-1">
          开始测评
          <svg
            className="ml-1 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
}
