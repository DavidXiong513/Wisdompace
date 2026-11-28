import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '居家养老还是去养老院 | 《一生的整理》',
  description:
    '先判断居家养老还撑不撑得住——身体、身边有没有人、房子住不住得下去；撑不住，再按护理等级、预算与所在城市，把机构类型收窄到一两类。不推荐具体机构，不做排名。',
};

const stages = [
  {
    step: '一',
    title: '先确认你是谁在问',
    desc: '是本人来问，还是子女替父母问，还是本人已经无法表达意愿。三种情况后面问的问题不一样，结论要给的人也不一样。',
    note: '约 1 分钟',
  },
  {
    step: '二',
    title: '看居家还撑不撑得住',
    desc: '先过一遍硬条件：认知是否已不能独处、是否需要 24 小时照护、是否需要定期专业医疗、独居时有没有人能在几小时内赶到。没有触发，再看五个维度还差什么、能不能补。',
    note: '给出居家结论与注意事项',
  },
  {
    step: '三',
    title: '撑不住时，收窄机构类型',
    desc: '按护理等级先排除，再按医疗需求排除，然后用预算和所在城市标注价格区间，最后剩一到两类。附一份可以打印带走的参访提问清单。',
    note: '给出类型建议与提问清单',
  },
];

const facilityTypes = [
  {
    name: '养老院',
    forWhom: '能自理到半自理，主要需要人照看起居',
    offer: '住宿、三餐、日常照料、活动组织，多数内设医务室但不做治疗',
    note: '门槛最低，也最容易被误当成「什么都能管」',
  },
  {
    name: '护理院',
    forWhom: '失能、长期卧床、需要管路护理或专业护理操作',
    offer: '医疗护理为主，需医疗执业许可，护理员与护士配比更高',
    note: '很多同时是医保与长护险定点，但并非全部',
  },
  {
    name: '康复医院',
    forWhom: '术后、卒中后、骨折后，处于功能恢复期',
    offer: '以康复训练与医疗治疗为主，通常有明确住院周期',
    note: '解决的是「恢复」，不是「长期住下去」',
  },
  {
    name: '康养社区',
    forWhom: '还能自理，但希望省心、有配套与社交',
    offer: '居住品质、餐饮、健康管理与活动，可逐步升级到协助照护',
    note: '多含押金或会员费，前期资金占用最大',
  },
];

export default function AgingChoicePage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/60 bg-white/85 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/chapter/chapter-3"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">居家养老还是去养老院</h1>
          <div className="w-24" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-10 sm:px-6">
        <header>
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#A8927A]">
            先分流 · 再匹配
          </p>
          <h2 className="mt-3 text-3xl leading-snug font-bold text-[#4A3728] sm:text-[34px]">
            先判断居家还撑不撑得住，
            <br className="hidden sm:block" />
            再谈去不去机构。
          </h2>
          <p className="mt-5 text-[15px] leading-[1.9] text-[#5A5A5A]">
            九成老人最终在自己家里老去。所以这个工具不先问你「想不想去养老院」，而是先问一件更实际的事：
            <span className="font-medium text-[#4A3728]">现在这个状态，居家还撑不撑得住。</span>
            撑得住，就不必被「该不该送机构」这种问题消耗；撑不住，也要知道到底卡在哪一条，该找哪一类机构。
          </p>
        </header>

        <section className="mt-10 flex flex-col gap-4">
          {stages.map(item => (
            <div
              key={item.step}
              className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-[15px] font-bold text-[#C87941]">
                  {item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[17px] font-bold text-[#4A3728]">{item.title}</h3>
                    <span className="rounded-full bg-[#FDF5EE] px-2.5 py-0.5 text-[11px] font-medium text-[#A85E2D]">
                      {item.note}
                    </span>
                  </div>
                  <p className="mt-2 text-[14px] leading-[1.8] text-[#6A6256]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <h3 className="text-[17px] font-bold text-[#4A3728]">四类机构，一句话区分</h3>
          <p className="mt-2 text-[14px] leading-[1.8] text-[#6A6256]">
            它们的准入门槛、能提供的服务和价格完全不是一回事。选错的代价，往往是钱花了，却拿不到你真正需要的那一项。
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {facilityTypes.map(item => (
              <div
                key={item.name}
                className="rounded-2xl border border-[#E8D9C2] bg-white p-5"
              >
                <h4 className="text-[15px] font-bold text-[#C87941]">{item.name}</h4>
                <dl className="mt-3 space-y-2 text-[13px] leading-[1.75]">
                  <div>
                    <dt className="inline font-medium text-[#8A7E6A]">适合：</dt>
                    <dd className="inline text-[#5A5A5A]">{item.forWhom}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-[#8A7E6A]">提供：</dt>
                    <dd className="inline text-[#5A5A5A]">{item.offer}</dd>
                  </div>
                </dl>
                <p className="mt-3 border-t border-[#F0E6D6] pt-2.5 text-[12px] leading-[1.7] text-[#A8927A]">
                  {item.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12px] leading-[1.8] text-[#A8927A]">
            名称在各地并不统一：有的地方「养老院」「敬老院」「福利院」混用，有的护理院对外称「护理型养老机构」。
            报名前先问清一件事：这家有没有医疗执业许可、能不能做你要的那项护理操作。
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-[#E8D9C2] bg-[#FAF8F3] p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">测评环节正在开发中</h3>
          <p className="mt-2 text-[14px] leading-[1.8] text-[#6A6256]">
            上面三步的判断逻辑已经定稿，问卷与结果报告在做。开放后，你随时可以退出，回来接着填。
          </p>
          <Link
            href="/chapter/chapter-3"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#A85E2D]"
          >
            先回到「清楚交代」
          </Link>
        </section>

        <p className="mt-8 text-[12px] leading-[1.8] text-[#A8927A]">
          本工具提供的是一般性梳理，不构成医疗诊断，也不替代正式的老年人能力评估与长护险失能等级评定。
          价格区间以上海样本为参考，机构供给与补贴政策各地不同，请以当地民政、医保部门与机构实际口径为准。
        </p>
      </main>
    </div>
  );
}
