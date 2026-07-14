import Link from 'next/link';

export default function NextLifeDesignPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8D9C2] bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="text-4xl">🌀</span>
          <h1 className="text-2xl font-bold text-[#4A3728]">来生设计：配置你的人生属性</h1>
        </div>

        <p className="mb-6 leading-relaxed text-[#6A6256]">
          这个互动小游戏正在开发中。完成后，你将可以用 50 点投胎福德积分分配到八大属性中，
          生成属于你的「来生配置报告」，并从中照见你这一世真正看重的东西。
        </p>

        <div className="rounded-xl bg-[#FDF5EE] p-5">
          <h2 className="mb-2 font-semibold text-[#4A3728]">预计玩法</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-[#6A6256]">
            <li>八大属性：财富、健康、智慧、美貌、家世、运气、性格、寿命</li>
            <li>50 点积分，随心分配，实时显示剩余点数</li>
            <li>提交后生成「来生档案」与价值观折射解读</li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4">
          <Link
            href="/chapter/chapter-1"
            className="rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D]"
          >
            返回看见自己
          </Link>
          <Link
            href="/tools/career-values-test"
            className="rounded-full border border-[#C87941] px-6 py-2.5 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
          >
            去生涯价值观测评
          </Link>
        </div>
      </div>
    </main>
  );
}
