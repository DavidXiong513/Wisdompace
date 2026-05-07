import Link from "next/link";

export default function AbilityCard() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-1">
      <Link
        href="/tools/ability-test"
        className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(42,32,23,0.12)]"
      >
        {/* 背景渐变装饰 */}
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-[#5B8A72] to-[#78B090] opacity-10 blur-2xl transition-opacity group-hover:opacity-20" />

        {/* 徽章 */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-[#F0F5F2] px-3 py-1 text-xs font-medium text-[#4A7A62]">
            能力扫描
          </span>
        </div>

        {/* 图标 */}
        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#EBF5EF] to-white text-3xl shadow-sm">
          📊
        </div>

        {/* 标题 */}
        <h3 className="relative text-xl font-semibold text-[#2F2A24] transition-colors group-hover:text-[#5B8A72]">
          社会能力自评
        </h3>

        {/* 副标题 */}
        <p className="relative mt-1 text-sm font-medium text-[#8A7E6A]">
          42项核心能力 · 麦肯锡体系
        </p>

        {/* 描述 */}
        <p className="relative mt-3 text-sm leading-relaxed text-[#6A6256]">
          基于麦肯锡社会能力体系，从认知、人际到自我管理，全面扫描你的能力版图。发现优势区、潜力区和待提升区。
        </p>

        {/* 箭头指示 */}
        <div className="relative mt-4 flex items-center text-sm font-medium text-[#5B8A72] transition-transform group-hover:translate-x-1">
          开始测评
          <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
}
