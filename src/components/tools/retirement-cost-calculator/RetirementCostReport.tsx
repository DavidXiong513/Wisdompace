'use client';

import React from 'react';
import Link from 'next/link';
import { useRetirementCostStore } from '@/stores/retirementCostStore';
import { calculateRetirementCost } from '@/lib/retirement-cost-calculator/engine';
import {
  ADJUSTABLE_EXPENSE_KEYS,
  ADJUSTABLE_EXPENSE_LABELS,
} from '@/data/retirement-cost-calculator/defaults';
import { formatMoney, formatPercent, formatWan } from './format';
import type { ExpenseCategoryKey } from '@/types/retirement-cost-calculator';

const CATEGORY_COLORS: Record<ExpenseCategoryKey, string> = {
  basicLiving: '#C87941',
  housing: '#B88B5A',
  medical: '#7A9A7E',
  lifestyle: '#D9A85C',
  care: '#A36B5C',
  majorIllness: '#8E7BA0',
  funeral: '#8A7E6A',
  buffer: '#C9BFAE',
};

function Metric({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: 'gap' | 'safe';
}) {
  return (
    <div className="rounded-xl border border-[#E8D9C2] bg-white p-4">
      <p className="text-[11px] font-medium text-[#8A7E6A]">{label}</p>
      <p
        className={`mt-1.5 text-xl font-bold ${
          emphasis === 'gap'
            ? 'text-[#B4553E]'
            : emphasis === 'safe'
              ? 'text-[#4F7A5D]'
              : 'text-[#4A3728]'
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[10px] leading-relaxed text-[#A99C88]">{hint}</p>}
    </div>
  );
}

export function RetirementCostReport() {
  const { input, scales, setScale, resetScales, setStep, reset } = useRetirementCostStore();
  const report = calculateRetirementCost(input, scales);
  const hasData = report.totalExpenses > 0 || report.totalIncome > 0 || report.movableReserve > 0;
  const coverageForBar = Math.min(1, Math.max(0, report.coverageRate));

  const timelineStart = report.startAge;
  const timelineEnd = report.base.planningAge;
  const timelineCareStart = Math.min(
    timelineEnd,
    Math.max(timelineStart, input.careStartAge)
  );
  const timelineActiveEnd = Math.min(
    timelineCareStart,
    Math.max(timelineStart, Math.min(input.lifestyleUntilAge, timelineEnd))
  );
  const timelineCareEnd = Math.min(
    timelineEnd,
    timelineCareStart + report.careYearsUsed
  );
  const timelineSegments = [
    {
      key: 'active',
      label: '活力期',
      start: timelineStart,
      end: timelineActiveEnd,
      color: '#C87941',
      note: '旅行、兴趣、社交最活跃',
    },
    {
      key: 'transition',
      label: '过渡期',
      start: timelineActiveEnd,
      end: timelineCareStart,
      color: '#7A9A7E',
      note: '医疗与日常照护需求上升',
    },
    {
      key: 'care',
      label: '照护期',
      start: timelineCareStart,
      end: timelineCareEnd,
      color: '#A36B5C',
      note: '照护支出最集中',
    },
    {
      key: 'remaining',
      label: '余生',
      start: timelineCareEnd,
      end: timelineEnd,
      color: '#C9BFAE',
      note: '照护期之后的生活',
    },
  ].filter((segment) => segment.end > segment.start);

  const advice: string[] = [];
  if (!hasData) {
    advice.push('先回到前面填写退休金、储备和支出，才能得到有意义的测算结果。');
  } else if (report.gap > 0) {
    const annualGap = report.retirementYears > 0 ? report.gap / report.retirementYears : report.gap;
    advice.push(
      `基准情景下还差 ${formatWan(report.gap)}；若分摊到退休后的 ${report.retirementYears} 年，每年约需额外准备 ${formatWan(annualGap)}。`
    );
  } else {
    advice.push(
      `按当前假设，退休金与可动用储备可以覆盖晚年支出的 ${formatPercent(report.coverageRate)}，预计结余 ${formatWan(report.surplus)}。`
    );
  }

  if (report.carePerExtraYear > 0) {
    advice.push(
      `照护期每多 1 年，净照护支出约增加 ${formatWan(report.carePerExtraYear)}。这是整个账本里最值得优先确认的数字。`
    );
  }
  if (input.protectLifestyle && report.lifestyleShare > 0) {
    advice.push(
      `你把「热爱与旅行」标记为尽量不牺牲，这部分占基准支出的 ${formatPercent(report.lifestyleShare)}。如果出现缺口，报告建议先调整住房、日常或其他弹性支出，再考虑削减这一段。`
    );
  }
  if (report.careShare >= 0.3 && hasData) {
    advice.push(
      `照护支出占总支出 ${formatPercent(report.careShare)}。可以重点了解本地长护险、社区居家照护与护理院的自付差异。`
    );
  }
  if (report.yearsToRetirement > 0) {
    advice.push(
      `距离计划退休还有 ${report.yearsToRetirement} 年。本工具只测算退休后，退休前的储蓄安排需要单独规划。`
    );
  }

  const handleClear = () => {
    if (window.confirm('确定要清除这台设备上保存的全部测算数据吗？此操作无法撤销。')) {
      reset();
    }
  };

  if (!hasData) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDF5EE] text-2xl">
            🧾
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#4A3728]">账本还是空的</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#8A7E6A]">
            至少填写退休金、可动用储备或一项晚年支出，才能看见属于你的结构与缺口。
          </p>
          <button
            type="button"
            onClick={() => setStep(0)}
            className="mt-5 rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#A85E2D]"
          >
            返回填写
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white shadow-sm">
        <div className="bg-[#4A3728] px-5 py-6 text-white sm:px-8 sm:py-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D9C2]">Your Later-Life Ledger</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">你的晚年账本</h2>
          <p className="mt-2 text-xs leading-relaxed text-[#E8D9C2]/90">
            从 {report.startAge} 岁到 {report.base.planningAge} 岁，共 {report.retirementYears} 年。
            所有金额按当前购买力静态估算，不是未来精确预言。
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[11px] text-[#E8D9C2]">晚年总支出</p>
              <p className="mt-1 text-2xl font-bold">{formatWan(report.totalExpenses)}</p>
              <p className="mt-1 text-[10px] text-[#E8D9C2]/80">{formatMoney(report.totalExpenses)}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#E8D9C2]">可覆盖资金</p>
              <p className="mt-1 text-2xl font-bold">{formatWan(report.availableFunds)}</p>
              <p className="mt-1 text-[10px] text-[#E8D9C2]/80">
                退休金 {formatWan(report.totalIncome)} + 储备 {formatWan(report.movableReserve)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-[#E8D9C2]">{report.gap > 0 ? '预计缺口' : '预计结余'}</p>
              <p className={`mt-1 text-2xl font-bold ${report.gap > 0 ? 'text-[#FFD2C4]' : 'text-[#BFE0C8]'}`}>
                {formatWan(report.gap > 0 ? report.gap : report.surplus)}
              </p>
              <p className="mt-1 text-[10px] text-[#E8D9C2]/80">
                覆盖 {formatPercent(report.coverageRate)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] text-[#E8D9C2]/80">
              <span>资金覆盖进度</span>
              <span>{formatPercent(report.coverageRate)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#D9A85C] transition-all duration-500"
                style={{ width: `${coverageForBar * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
          <Metric
            label="照护期每年净支出"
            value={formatWan(report.careAnnualNet)}
            hint={`按 ${report.careYearsUsed} 年照护期计入，已扣除报销后的自付`}
          />
          <Metric
            label="照护占全部支出"
            value={formatPercent(report.careShare)}
            hint="这是多数家庭最容易低估的一块"
          />
          <Metric
            label="不可动用的家庭资产"
            value={formatWan(report.nonLiquidAssets)}
            hint="仅作参考，没有自动计入可覆盖资金"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C87941]">Adjust</p>
            <h3 className="mt-1 text-lg font-bold text-[#4A3728]">先看总数，再拖动数字条调整</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">
              拖动的是该类支出相对当前预算的比例；应急预备金会随总额自动重算。
            </p>
          </div>
          <button
            type="button"
            onClick={resetScales}
            className="self-start rounded-full border border-[#E8D9C2] px-3.5 py-1.5 text-xs font-medium text-[#8A7E6A] hover:bg-[#FAF8F3]"
          >
            恢复原始预算
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {ADJUSTABLE_EXPENSE_KEYS.map((key) => {
            const category = report.categories.find((item) => item.key === key);
            const percent = Math.round((scales[key] ?? 1) * 100);
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[#4A3728]">
                    {ADJUSTABLE_EXPENSE_LABELS[key]}
                  </span>
                  <span className="text-sm font-bold text-[#C87941]">
                    {formatWan(category?.amount ?? 0)}
                    <span className="ml-1 text-[10px] font-normal text-[#A99C88]">
                      {formatPercent(category?.share ?? 0)}
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-3">
                  <input
                    type="range"
                    min={30}
                    max={180}
                    step={5}
                    value={percent}
                    onChange={(event) => setScale(key, Number(event.target.value) / 100)}
                    className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-[#E8D9C2] accent-[#C87941]"
                    aria-label={`${ADJUSTABLE_EXPENSE_LABELS[key]}调整比例`}
                  />
                  <span className="w-12 text-right text-[11px] tabular-nums text-[#8A7E6A]">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-[#4A3728]">钱花在了哪里</h3>
        <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[#F0E8DC]">
          {report.categories
            .filter((category) => category.amount > 0)
            .map((category) => (
              <div
                key={category.key}
                title={`${category.label}：${formatWan(category.amount)}（${formatPercent(category.share)}）`}
                style={{
                  width: `${category.share * 100}%`,
                  backgroundColor: CATEGORY_COLORS[category.key],
                }}
              />
            ))}
        </div>
        <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {report.categories.map((category) => (
            <div key={category.key} className="flex items-center justify-between gap-3 border-b border-[#F5F0E8] py-1.5">
              <span className="flex items-center gap-2 text-xs text-[#6A6256]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[category.key] }}
                />
                {category.label}
              </span>
              <span className="text-xs font-semibold tabular-nums text-[#4A3728]">
                {formatWan(category.amount)}
                <span className="ml-1.5 font-normal text-[#A99C88]">
                  {formatPercent(category.share)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-[#4A3728]">余生时间轴</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">
          不同阶段的消费重点不同。照护期开始后，旅行与高强度兴趣默认停止累计。
        </p>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full bg-[#F0E8DC]">
          {timelineSegments.map((segment) => (
            <div
              key={segment.key}
              title={`${segment.label}：${segment.start}–${segment.end} 岁`}
              style={{
                width: `${((segment.end - segment.start) / Math.max(1, timelineEnd - timelineStart)) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {timelineSegments.map((segment) => (
            <div key={segment.key} className="flex items-start gap-2 text-xs">
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span>
                <strong className="font-semibold text-[#4A3728]">{segment.label}</strong>
                <span className="ml-1 text-[#A99C88]">
                  {segment.start}–{segment.end} 岁
                </span>
                <span className="mt-0.5 block text-[10px] text-[#8A7E6A]">{segment.note}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 shadow-sm sm:p-7">
        <h3 className="text-lg font-bold text-[#4A3728]">如果活得更久呢</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">
          寿命预测不能当作财务规划的唯一终点。下面三个情景使用同一套支出假设，只延长规划年限。
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {report.scenarios.map((scenario) => {
            const isBase = scenario.key === 'base';
            return (
              <div
                key={scenario.key}
                className={`rounded-xl border p-4 ${
                  isBase ? 'border-[#C87941] bg-[#FDF5EE]' : 'border-[#E8D9C2] bg-white'
                }`}
              >
                <p className={`text-xs font-bold ${isBase ? 'text-[#A85E2D]' : 'text-[#6A6256]'}`}>
                  {scenario.label}
                </p>
                <p className="mt-1 text-[10px] text-[#A99C88]">
                  到 {scenario.planningAge} 岁 · {scenario.years} 年
                </p>
                <p className="mt-3 text-lg font-bold text-[#4A3728]">
                  {formatWan(scenario.totalExpenses)}
                </p>
                <p className={`mt-1 text-[11px] ${scenario.gap > 0 ? 'text-[#B4553E]' : 'text-[#4F7A5D]'}`}>
                  {scenario.gap > 0 ? `缺口 ${formatWan(scenario.gap)}` : `结余 ${formatWan(scenario.surplus)}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#C87941]/25 bg-[#FDF5EE] p-5 sm:p-7">
        <h3 className="text-lg font-bold text-[#4A3728]">这份账本对你的提醒</h3>
        <ul className="mt-3 space-y-2.5">
          {advice.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-[#5D4A3A]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C87941]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {report.warnings.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t border-[#C87941]/15 pt-3">
            {report.warnings.map((warning) => (
              <p key={warning} className="text-[11px] leading-relaxed text-[#A06B4A]">
                提示：{warning}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={() => setStep(0)}
          className="rounded-full border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-semibold text-[#8A7E6A] hover:bg-[#FAF8F3]"
        >
          返回修改数据
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-full bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#A85E2D]"
        >
          打印 / 保存 PDF
        </button>
        <Link
          href="/chapter/chapter-3#retirement-cost"
          className="rounded-full border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-semibold text-[#8A7E6A] hover:bg-[#FAF8F3]"
        >
          返回清楚交代
        </Link>
      </div>

      <div className="rounded-xl bg-[#FAF8F3] p-4 text-[10px] leading-relaxed text-[#A99C88]">
        <p>
          测算口径：以当前购买力静态估算，不预测通胀、投资收益或养老金调整；只测算退休后的支出。
          健康状态仅用于生成照护预算，不构成医学判断。
        </p>
        <p className="mt-1.5">
          本工具仅用于人生规划参考，不构成财务、投资、医疗或法律建议。所有输入仅保存在本机浏览器，不上传云端。
        </p>
        <p className="mt-1.5">
          模型思路参考微信公众号「笔迹侠」《退休到离世要花掉多少钱？》，并结合本站场景重新建立计算公式。
        </p>
        <button
          type="button"
          onClick={handleClear}
          className="mt-2 text-[10px] font-medium text-[#B4553E] underline underline-offset-2 print:hidden"
        >
          清除本机保存的测算数据
        </button>
      </div>
    </div>
  );
}
