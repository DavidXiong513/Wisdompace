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
    desc: '本人、子女代问、本人已无法表达——三条路后面追问的不同。',
    note: '约 1 分钟',
  },
  {
    step: '二',
    title: '看居家还撑不撑得住',
    desc: '先过硬条件，再看还差什么、社区服务能不能补上。',
    note: '居家／社区／机构',
  },
  {
    step: '三',
    title: '撑不住时，收窄机构类型',
    desc: '按护理等级、医疗需求、预算与城市逐层排除，剩一到两类。',
    note: '类型建议与提问清单',
  },
];

const facilityTypes = [
  { name: '养老院', desc: '生活照料为主，门槛最低' },
  { name: '护理院', desc: '医疗护理为主，多可对接医保' },
  { name: '康复医院', desc: '术后与功能恢复，有住院周期' },
  { name: '康养社区', desc: '能自理但想省心，多为押金制' },
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
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#A8927A]">先分流 · 再匹配</p>
          <h2 className="mt-3 text-3xl leading-snug font-bold text-[#4A3728] sm:text-[34px]">
            先判断居家还撑不撑得住，
            <br className="hidden sm:block" />
            再谈去不去机构。
          </h2>
          <p className="mt-5 text-[15px] leading-[1.9] text-[#5A5A5A]">
            九成老人最后在自己家里老去。所以要先判断的不是「想不想去机构」，而是
            <span className="font-medium text-[#4A3728]">居家还撑不撑得住</span>。
          </p>
        </header>

        <section className="mt-8 flex flex-col gap-3">
          {stages.map(item => (
            <div key={item.step} className="rounded-2xl border border-[#E8D9C2] bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-[14px] font-bold text-[#C87941]">
                  {item.step}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-[16px] font-bold text-[#4A3728]">{item.title}</h3>
                    <span className="rounded-full bg-[#FDF5EE] px-2.5 py-0.5 text-[11px] font-medium text-[#A85E2D]">
                      {item.note}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-[1.75] text-[#6A6256]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">撑不住时，要分清是哪一类</h3>
          <ul className="mt-3 divide-y divide-[#F0E6D6]">
            {facilityTypes.map(item => (
              <li key={item.name} className="flex items-baseline gap-3 py-2.5">
                <span className="w-[4.5em] shrink-0 text-[14px] font-bold text-[#C87941]">
                  {item.name}
                </span>
                <span className="text-[13.5px] leading-[1.7] text-[#5A5A5A]">{item.desc}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-[#F0E6D6] pt-3 text-[12px] leading-[1.7] text-[#A8927A]">
            注意「康养社区」是机构，和「社区养老」（日间照料、上门服务）不是一回事。名称各地不统一，参访先问一句：有没有医疗执业许可，能不能做你要的那项护理。
          </p>
        </section>

        <section className="mt-8 rounded-2xl border border-[#E8D9C2] bg-[#FAF8F3] p-5 sm:p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">测评环节正在开发中</h3>
          <p className="mt-1.5 text-[13.5px] leading-[1.75] text-[#6A6256]">
            三步逻辑已定稿，问卷与报告在做。开放后随时可退出，回来接着填。
          </p>
          <Link
            href="/chapter/chapter-3"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#A85E2D]"
          >
            先回到「清楚交代」
          </Link>
        </section>

        <p className="mt-6 text-[12px] leading-[1.75] text-[#A8927A]">
          一般性梳理，不构成医疗诊断，也不替代老年人能力评估与长护险失能等级评定。价格以上海样本为参考，各地政策与供给请以当地民政、医保部门及机构口径为准。
        </p>
      </main>
    </div>
  );
}
