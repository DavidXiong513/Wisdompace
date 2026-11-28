import type { Metadata } from 'next';
import Link from 'next/link';
import AgingChoiceWizard from '@/components/tools/AgingChoiceWizard';
import { DISCLAIMER } from '@/data/aging-choice/agingData';

export const metadata: Metadata = {
  title: '居家养老还是去养老院 | 《一生的整理》',
  description:
    '先判断居家养老还撑不撑得住——身体、身边有没有人、房子住不住得下去；撑不住，再按护理等级、预算与所在城市，把机构类型收窄到一两类。不推荐具体机构，不做排名。',
};

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
          <h1 className="hidden text-sm font-bold text-[#4A3728] sm:block">居家养老还是去养老院</h1>
          <div className="hidden w-24 sm:block" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <header>
          <p className="text-[13px] font-medium tracking-[0.18em] text-[#A8927A]">先分流 · 再匹配</p>
          <h2 className="mt-3 text-3xl leading-snug font-bold text-[#4A3728] sm:text-[34px]">
            先判断居家还撑不撑得住，
            <br className="hidden sm:block" />
            再谈去不去机构。
          </h2>
          <p className="mt-4 text-[15px] leading-[1.9] text-[#5A5A5A]">
            九成老人最后在自己家里老去。所以要先判断的不是「想不想去机构」，而是
            <span className="font-medium text-[#4A3728]">居家还撑不撑得住</span>。
          </p>
        </header>

        <AgingChoiceWizard />

        <section className="mt-8 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">四类机构，先分清</h3>
          <ul className="mt-3 divide-y divide-[#F0E6D6]">
            {facilityTypes.map((item) => (
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

        <p className="mt-6 text-[12px] leading-[1.75] text-[#A8927A]">{DISCLAIMER}</p>
      </main>
    </div>
  );
}
