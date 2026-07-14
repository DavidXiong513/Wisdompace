import Link from 'next/link';

const ATTRIBUTES = [
  {
    name: '颜值身材',
    icon: '💃',
    desc: '外在的容貌与体态。0 分丑爆或先天残疾，5 分是正常路人，10 分则是盛世美颜。',
  },
  {
    name: '财富财商',
    icon: '💰',
    desc: '赚钱能力与财富积累。0 分一生穷苦，5 分普通温饱，10 分堪比巴菲特。',
  },
  {
    name: '名誉地位',
    icon: '📜',
    desc: '社会声望与历史留名。0 分臭名昭著，5 分默默无闻或毁誉参半，10 分如圣贤般被敬仰。',
  },
  {
    name: '身心健康',
    icon: '🍃',
    desc: '身体与心理的综合状态。0 分疾病缠身，10 分一生身心健康、精力充沛。',
  },
  {
    name: '学习能力',
    icon: '🧠',
    desc: '智商、学历、学习敏锐度与独立思考。0 分几乎没有学习力，5 分大专二本水平，10 分堪比天才侦探。',
  },
  {
    name: '和睦家庭',
    icon: '🏠',
    desc: '原生家庭与亲密关系。0 分六亲缘薄，10 分原生家庭幸福、夫妻灵魂伴侣、亲子关系健康。',
  },
  {
    name: '长寿善终',
    icon: '🕯️',
    desc: '寿命长度与离世方式。0 分早夭，5 分约 65 岁退休后离世，10 分长命百岁、在家寿终正寝。',
  },
  {
    name: '修行善根',
    icon: '☸️',
    desc: '信仰与灵性根基。0 分不信因果业报，5 分将信将疑，10 分天生修行人，早走解脱之道。',
  },
];

export default function NextLifeDesignPage() {
  return (
    <main className="min-h-screen bg-[#F5F0E8] px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* 介绍卡片 */}
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-4xl">🌀</span>
            <h1 className="text-2xl font-bold text-[#4A3728]">来生设计：配置你的人生属性</h1>
          </div>

          <p className="mb-4 leading-relaxed text-[#6A6256]">
            假设你马上要投胎到下一世去做人，目前手里握着
            <strong className="text-[#C87941]">50 点投胎福德积分</strong>
            。你会如何分配这 50 个积点到以下八大属性中呢？
          </p>

          <p className="mb-6 leading-relaxed text-[#6A6256]">
            这不是算命，而是一次深度价值观的折射。你在这一世最看重的东西，往往会在下一世的选择里暴露无遗。
          </p>

          <div className="rounded-xl bg-[#FDF5EE] p-5">
            <h2 className="mb-4 font-semibold text-[#4A3728]">八大属性</h2>
            <div className="grid gap-4">
              {ATTRIBUTES.map(attr => (
                <div
                  key={attr.name}
                  className="rounded-xl border border-[#E8D9C2] bg-white p-4 transition-all hover:border-[#C87941]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{attr.icon}</span>
                    <h3 className="font-bold text-[#4A3728]">{attr.name}</h3>
                    <span className="ml-auto text-xs font-medium text-[#C87941]">0–10 分</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#6A6256]">{attr.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-4">
            <p className="text-sm leading-relaxed text-[#6A6256]">
              <strong className="text-[#C87941]">玩法提示：</strong>
              每个属性最低 0 分、最高 10 分，八大属性总分不能超过 50
              分。你需要在颜值、财富、名望、健康、才智、家庭、寿命、修行之间做出取舍。后续版本会加入实时雷达图和「来生档案」解读。
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
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
      </div>
    </main>
  );
}
