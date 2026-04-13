import Link from "next/link";

export default function CareerValuesCard() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-1">
      <Link
        href="/tools/career-values-test"
        className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,32,23,0.12)]"
      >
        {/* 背景渐变装饰 */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#8B6AA0] to-[#A78BBF] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

        {/* 徽章 */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-[#F5F0F8] px-3 py-1 text-xs font-medium text-[#7A5A8A]">
            价值排序
          </span>
        </div>

        {/* 图标 */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#F0EBF5] to-white text-3xl shadow-sm">
          💎
        </div>

        {/* 标题 */}
        <h3 className="relative text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#8B6AA0]">
          生涯价值观测评
        </h3>

        {/* 副标题 */}
        <p className="relative mt-1 text-sm font-medium text-[#8A7E6A]">
          14种职业价值取向 → 3个核心价值
        </p>

        {/* 描述 */}
        <p className="relative mt-3 text-sm leading-relaxed text-[#6A6256]">
          在职业选择中，什么对你真正重要？通过这个测评，发现自己最看重的职业价值取向，最终锁定核心价值观。
        </p>

        {/* 箭头指示 */}
        <div className="relative mt-4 flex items-center text-sm font-medium text-[#8B6AA0] transition-transform group-hover:translate-x-1">
          开始测评
          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
