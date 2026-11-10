import type { Metadata } from 'next';
import Link from 'next/link';
import {
  selfWrittenTradeoffs,
  familyScenarios,
  templatePreviews,
  type ScenarioVerdict,
} from '@/data/will-templates/selfWrittenTradeoff';

export const metadata: Metadata = {
  title: '遗嘱模板库 | 《一生的整理》',
  description:
    '自书遗嘱的双刃剑：成本最低、举证最弱。对照你的家庭结构，看它到底够不够用——以及三份手抄范本的筹备进展。',
};

const verdictStyle: Record<ScenarioVerdict, string> = {
  ok: 'bg-[#EDF4EC] text-[#3F6B45] border-[#CBDDC8]',
  caution: 'bg-[#FDF3E3] text-[#8A5A17] border-[#F0D9B0]',
  no: 'bg-[#FBEDEB] text-[#93372C] border-[#EFC9C2]',
};

export default function WillTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href="/chapter/chapter-3"
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">遗嘱模板库</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pt-8 sm:pt-12">
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FDF5EE] px-3 py-1 text-[11px] font-bold tracking-[0.18em] text-[#C87941]">
              科普
            </span>
            <span className="text-[11px] tracking-[0.12em] text-[#A8927A]">
              清楚交代 · 第三章
            </span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-[#4A3728] sm:text-4xl">
            自书遗嘱的双刃剑
          </h2>
          <p className="mt-4 text-[15px] leading-[1.85] text-[#5A5A5A]">
            自书遗嘱是成本最低的一种：自己写、自己签、不用见证人、不用花钱。但它的每一项便利，背面都连着一个代价。到底算性价比最高，还是最容易失效，取决于一件很具体的事——你走了以后，有没有人愿意并且有动机去质疑它。
          </p>
        </header>

        <section className="mt-8">
          <h3 className="flex items-center gap-3 text-base font-bold text-[#4A3728]">
            <span className="h-4 w-1 rounded-full bg-[#C87941]" />
            同一件事，两面看
          </h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white">
            <div className="grid grid-cols-2 border-b border-[#F0E6D6] bg-[#FAF8F3]">
              <div className="px-5 py-3 text-[13px] font-bold text-[#3F6B45]">它省下什么</div>
              <div className="border-l border-[#F0E6D6] px-5 py-3 text-[13px] font-bold text-[#93372C]">
                它同时放弃什么
              </div>
            </div>
            {selfWrittenTradeoffs.map((row, i) => (
              <div
                key={row.pro}
                className={`grid grid-cols-2 ${
                  i === selfWrittenTradeoffs.length - 1 ? '' : 'border-b border-[#F5EFE6]'
                }`}
              >
                <div className="px-5 py-4 text-sm leading-[1.75] text-[#4A3728]">{row.pro}</div>
                <div className="border-l border-[#F5EFE6] px-5 py-4 text-sm leading-[1.75] text-[#6A6256]">
                  {row.con}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#E8D9C2] bg-[#FDF5EE] p-5 sm:p-6">
          <div className="text-[13px] font-bold tracking-[0.12em] text-[#C87941]">关键一句</div>
          <p className="mt-2 text-[15px] leading-[1.9] text-[#4A3728]">
            法律并没有规定「多子女时自书遗嘱效力更低」。真实的机制是——
            <strong className="font-bold">
              自书遗嘱的真实性要靠笔迹和日期自证，而这两样在人过世后几乎无法验证
            </strong>
            。独生子女家庭没有人有动机质疑，这道关根本不存在；多子女家庭每质疑成功一次就多分一份，质疑的动机是结构性的。一旦有人不认，就要做笔迹鉴定，而老人晚年的笔迹常常已经变了。
          </p>
          <p className="mt-3 text-[15px] leading-[1.9] text-[#4A3728]">
            说白了：不是遗嘱写错了，是它证明不了自己是真的，就输了。
          </p>
        </section>

        <section className="mt-8">
          <h3 className="flex items-center gap-3 text-base font-bold text-[#4A3728]">
            <span className="h-4 w-1 rounded-full bg-[#C87941]" />
            对号入座：你该用哪种形式
          </h3>
          <p className="mt-2 text-sm leading-[1.8] text-[#8A7E6A]">
            先找到和你最像的那一行，再看那只适用于你的提醒。
          </p>
          <div className="mt-4 space-y-3">
            {familyScenarios.map(item => (
              <div
                key={item.situation}
                className="rounded-2xl border border-[#E8D9C2] bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-[15px] font-semibold text-[#4A3728]">{item.situation}</span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${verdictStyle[item.verdict]}`}
                  >
                    {item.verdictLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-[1.8] text-[#6A6256]">{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-dashed border-[#D9C6AC] bg-[#FAF8F3] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#EFE6D8] px-2.5 py-0.5 text-[11px] font-bold tracking-[0.1em] text-[#8A7E6A]">
              筹备中
            </span>
            <h3 className="text-base font-bold text-[#4A3728]">三份手抄范本</h3>
          </div>
          <p className="mt-2 text-sm leading-[1.8] text-[#8A7E6A]">
            范本正在编写中。每一份都会包含：适用情形 / 不适用情形 / 抄完必查五项、一句一行的手抄正文、逐句注解，以及成本对照。它们只供阅读参照，不能打印签署。
          </p>
          <ul className="mt-4 space-y-3">
            {templatePreviews.map(item => (
              <li key={item.name} className="flex gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C87941]" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#4A3728]">{item.name}</div>
                  <p className="mt-0.5 text-[13px] leading-[1.7] text-[#8A7E6A]">{item.fit}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/tools/will-preparation"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C87941] px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D]"
          >
            开始遗嘱准备
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <Link
            href="/chapter/chapter-3"
            className="inline-flex items-center justify-center rounded-full border border-[#E8D9C2] bg-white px-6 py-3 text-sm font-medium text-[#6A6256] transition-all hover:border-[#C87941] hover:text-[#C87941]"
          >
            先回章节继续读
          </Link>
        </div>
      </main>
    </div>
  );
}
