'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  readinessPrompt,
  readinessOptions,
  urgencySignals,
  scopeRows,
  closingNotes,
  type ReadinessTone,
  type ScopeTone,
} from '@/data/will-literacy/willLiteracyData';

const toneStyle: Record<ReadinessTone, string> = {
  act: 'border-[#CBDDC8] bg-[#EDF4EC] text-[#3F6B45]',
  soon: 'border-[#F0D9B0] bg-[#FDF5EE] text-[#8A5A17]',
  hold: 'border-[#E5DED2] bg-[#F7F4EF] text-[#8A7E6A]',
};

const scopeStyle: Record<ScopeTone, string> = {
  yes: 'bg-[#EDF4EC] text-[#3F6B45] border-[#CBDDC8]',
  partial: 'bg-[#FDF3E3] text-[#8A5A17] border-[#F0D9B0]',
  no: 'bg-[#FBEDEB] text-[#93372C] border-[#EFC9C2]',
};

const scopeLabel: Record<ScopeTone, string> = {
  yes: '能写进遗嘱',
  partial: '写了也不一定算数',
  no: '不归遗嘱管',
};

/**
 * WillLiteracyBox
 * 「无憾的交代」末尾的内嵌科普框。
 * 不复述怎么写遗嘱（模板库已经讲过），只把「要不要现在动手」摆到用户面前，
 * 并说清一份遗嘱到底管得了什么、管不了什么。
 */
export default function WillLiteracyBox() {
  const [readiness, setReadiness] = useState<string | null>(null);
  const [signals, setSignals] = useState<string[]>([]);

  const selectedOption = useMemo(
    () => readinessOptions.find(o => o.id === readiness) ?? null,
    [readiness]
  );

  const toggleSignal = useCallback((id: string) => {
    setSignals(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  }, []);

  const hitCount = signals.length;

  const urgencyVerdict = useMemo(() => {
    if (hitCount === 0) {
      return {
        tone: 'ok' as const,
        text: '一条都没中。那么自书遗嘱基本够用，真正要操心的是「写完放在哪」和「想法变了要更新」。',
      };
    }
    if (hitCount <= 2) {
      return {
        tone: 'mid' as const,
        text: `中了 ${hitCount} 条。建议在半年内把这件事做完——不必赶，但别再往后推。拖得越久，你的想法和文件之间的差距越大。`,
      };
    }
    return {
      tone: 'high' as const,
      text: `中了 ${hitCount} 条。这类组合拖下去出事的概率不低，建议优先处理。形式上有任何不确定，直接找公证处或律师，不要自己试。`,
    };
  }, [hitCount]);

  return (
    <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#FDF5EE] px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] text-[#C87941]">
          科普
        </span>
        <h3 className="text-lg font-bold text-[#4A3728]">关于遗嘱，先回答三个问题</h3>
      </div>
      <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
        不过在动手之前，有一个决定绕不过去：现在写，还是再等等。大多数人卡住的不是格式，正是这个决定。
        下面三问没有标准答案，却能告诉你接下来该做什么——或者，让你安心地暂时不做。
      </p>

      {/* ── 第一问：写不写 ── */}
      <section className="mt-5 rounded-xl border border-[#F0E6D6] bg-[#FAF8F3] p-4">
        <h4 className="flex items-center gap-2.5 text-[15px] font-bold text-[#4A3728]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C87941] text-[11px] font-bold text-white">
            1
          </span>
          {readinessPrompt}
        </h4>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {readinessOptions.map(opt => {
            const active = readiness === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => setReadiness(active ? null : opt.id)}
                className={`rounded-xl border px-3.5 py-2.5 text-left text-[13px] leading-snug font-medium transition ${
                  active
                    ? 'border-[#C87941] bg-white text-[#A85E2D] shadow-sm'
                    : 'border-[#E8D9C2] bg-white text-[#6A6256] hover:border-[#D9C6AC]'
                }`}
              >
                <span className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                      active ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D9C6AC] bg-white'
                    }`}
                  >
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                  <span>{opt.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {selectedOption && (
          <p
            className={`mt-3 rounded-lg border px-3.5 py-2.5 text-[13px] leading-[1.8] ${toneStyle[selectedOption.tone]}`}
          >
            {selectedOption.feedback}
          </p>
        )}
      </section>

      {/* ── 第二问：能不能拖 ── */}
      <section className="mt-3 rounded-xl border border-[#F0E6D6] bg-[#FAF8F3] p-4">
        <h4 className="flex items-center gap-2.5 text-[15px] font-bold text-[#4A3728]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C87941] text-[11px] font-bold text-white">
            2
          </span>
          <span>这些情况，有你吗？</span>
        </h4>
        <p className="mt-1.5 text-[13px] leading-[1.7] text-[#8A7E6A]">
          民法典对写遗嘱没有年龄门槛，真正让「还早」变成「来不及」的，是这些结构性的情况。
        </p>
        <p className="mt-1.5 text-[11px] text-[#A8927A]">
          可多选 · 已中 <span className="font-bold text-[#C87941]">{hitCount}</span> 条
        </p>

        <div className="mt-3 space-y-1.5">
          {urgencySignals.map(s => {
            const active = signals.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleSignal(s.id)}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-left transition ${
                  active
                    ? 'border-[#C87941] bg-white shadow-sm'
                    : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${
                      active ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D9C6AC] bg-white'
                    }`}
                  >
                    {active && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-snug font-semibold text-[#4A3728]">
                      {s.label}
                    </span>
                    {active && (
                      <span className="mt-1 block text-[12.5px] leading-[1.7] text-[#8A7E6A]">
                        {s.why}
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p
          className={`mt-3 rounded-lg border px-3.5 py-2.5 text-[13px] leading-[1.8] ${
            urgencyVerdict.tone === 'ok'
              ? 'border-[#CBDDC8] bg-[#EDF4EC] text-[#3F6B45]'
              : urgencyVerdict.tone === 'mid'
                ? 'border-[#F0D9B0] bg-[#FDF5EE] text-[#8A5A17]'
                : 'border-[#EFC9C2] bg-[#FBEDEB] text-[#93372C]'
          }`}
        >
          {urgencyVerdict.text}
        </p>
      </section>

      {/* ── 第三问：遗嘱管不了的事 ── */}
      <section className="mt-3 rounded-xl border border-[#F0E6D6] bg-[#FAF8F3] p-4">
        <h4 className="flex items-center gap-2.5 text-[15px] font-bold text-[#4A3728]">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C87941] text-[11px] font-bold text-white">
            3
          </span>
          你以为能写进遗嘱、其实不归它管的，有哪些？
        </h4>
        <p className="mt-1.5 text-[13px] leading-[1.7] text-[#8A7E6A]">
          这一问最容易踩空：很多人以为一份遗嘱能管所有事，结果该安排的没安排上。
        </p>

        <div className="mt-3 space-y-2">
          {scopeRows.map(row => (
            <div
              key={row.matter}
              className="rounded-lg border border-[#EDE2D0] bg-white px-3.5 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 flex-1 text-[13px] leading-snug font-semibold text-[#4A3728]">
                  {row.matter}
                </span>
                <span
                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${scopeStyle[row.tone]}`}
                >
                  {scopeLabel[row.tone]}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.75] text-[#8A7E6A]">
                <span className="font-semibold text-[#6A6256]">实际归属：</span>
                {row.owner}。{row.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 收尾提醒 ── */}
      <ul className="mt-4 space-y-2">
        {closingNotes.map(text => (
          <li key={text} className="flex gap-2.5 text-[13px] leading-[1.8] text-[#8A7E6A]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9C6AC]" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
