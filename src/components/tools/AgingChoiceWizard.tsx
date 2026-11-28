'use client';

import React from 'react';
import Link from 'next/link';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useAgingChoiceStore } from '@/stores/agingChoiceStore';
import {
  MAX_SCORE,
  actorOf,
  branchOptions,
  dimScore,
  dimensions,
  evaluate,
  facilityBranchIntro,
  facilityNextStep,
  gapsOf,
  hardSignals,
  homeAdvice,
  identityOptions,
  institutionNotice,
  institutionTypes,
  pricingNotice,
  referralRules,
  scoredDimensions,
  subjectOf,
  verdictCopy,
  watchPoints,
  type Branch,
  type Dimension,
  type HardSignal,
  type IdentityType,
  type SignalId,
} from '@/data/aging-choice/agingData';

/* ── 通用小组件 ───────────────────────────────────────── */

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-all ${
        active
          ? 'border-[#C87941] bg-[#FDF5EE] font-semibold text-[#4A3728]'
          : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
      }`}
    >
      {children}
    </button>
  );
}

function StepBadge({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF5EE] text-[11px] font-bold text-[#C87941]">
        {index}
      </span>
      <span className="text-[11px] font-bold tracking-[0.18em] text-[#C87941] uppercase">{title}</span>
    </div>
  );
}

function Nav({
  onBack,
  onNext,
  nextLabel = '下一步',
  nextDisabled,
  hint,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 上一步
          </button>
        )}
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        {hint && <span className="text-[12px] text-[#A8927A]">{hint}</span>}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`rounded-full px-7 py-3 text-sm font-bold transition-all ${
            nextDisabled
              ? 'cursor-not-allowed bg-[#E8D9C2] text-white'
              : 'bg-[#C87941] text-white hover:bg-[#A85E2D]'
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

/* ── 入口：先选一条路 ─────────────────────────────────── */

function WelcomeStep({ onPick }: { onPick: (b: Branch) => void }) {
  return (
    <section className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
      <StepBadge index="00" title="先选一条路" />
      <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:mt-4 sm:text-2xl">
        两条路，选一条就行
      </h2>
      <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
        不确定自己的情况，走第一条；已经决定要看机构，直接走第二条。做完自测也会给机构建议，两条路不冲突。
      </p>

      <div className="mt-5 grid gap-3 sm:mt-6 sm:grid-cols-2">
        {branchOptions.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            className={`group flex h-full flex-col rounded-xl border p-4 text-left transition-all ${
              i === 0
                ? 'border-[#C87941]/60 bg-[#FDF5EE]/60 hover:border-[#C87941] hover:shadow-[0_8px_20px_rgba(200,121,65,0.10)]'
                : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/60'
            }`}
          >
            <span className="w-fit rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-[#A85E2D]">
              {opt.tag}
            </span>
            <p className="mt-2.5 text-[16px] font-bold text-[#4A3728]">{opt.title}</p>
            <p className="mt-1.5 flex-1 text-[13px] leading-[1.75] text-[#6A6256]">{opt.desc}</p>
            <span className="mt-3 text-[13px] font-bold text-[#C87941] group-hover:underline">
              {opt.cta} →
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-[1.7] text-[#A8927A]">
        两条路都不推荐具体机构、不做排名。
      </p>
    </section>
  );
}

/* ── 机构侧：跳过居家自测 ─────────────────────────────── */

function FacilityStep({ onBackHome }: { onBackHome: () => void }) {
  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#C87941]">
          机构侧 · 已跳过居家自测
        </span>
        <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:text-2xl">
          五类载体，先分清各管什么
        </h2>
        <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">{facilityBranchIntro}</p>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">五类机构对照</h3>
        <p className="mt-1 text-[12.5px] leading-[1.7] text-[#A8927A]">
          类型看功能，档位看价格——同一类型从经济档到高端，能差两三倍。
        </p>
        <div className="mt-4">
          {institutionTypes.map((t) => (
            <div
              key={t.key}
              className="border-t border-[#F0E6D6] py-4 first:border-t-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-[15px] font-bold text-[#4A3728]">{t.name}</span>
                <span className="rounded-full bg-[#FDF5EE] px-2 py-0.5 text-[10.5px] font-medium text-[#A85E2D]">
                  {t.tag}
                </span>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-[1.7] text-[#5A5A5A]">{t.medical}</p>
              <p className="mt-1 text-[12.5px] leading-[1.7] text-[#6A6256]">
                <span className="text-[#A8927A]">适合：</span>
                {t.fitFor}
              </p>
              <p className="mt-0.5 text-[12.5px] leading-[1.7] text-[#6A6256]">
                <span className="text-[#A8927A]">量级：</span>
                {t.scale}
              </p>
              <p className="mt-1 text-[12px] leading-[1.7] text-[#A8927A]">{t.caution}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 border-t border-[#F0E6D6] pt-3 text-[12px] leading-[1.75] text-[#A8927A]">
          {institutionNotice}
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">{pricingNotice.title}</h3>
        <p className="mt-1.5 text-[13px] leading-[1.75] text-[#6A6256]">{pricingNotice.desc}</p>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-[#A8927A]">报价为什么会变</p>
            <ul className="mt-2 space-y-1.5">
              {pricingNotice.factors.map((f) => (
                <li key={f} className="flex gap-2 text-[12.5px] leading-[1.7] text-[#6A6256]">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9B49A]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-[#A8927A]">参访时先问这六句</p>
            <ol className="mt-2 space-y-1.5">
              {pricingNotice.askTips.map((q, i) => (
                <li key={q} className="flex gap-2 text-[12.5px] leading-[1.7] text-[#6A6256]">
                  <span className="shrink-0 font-bold text-[#C87941]">{i + 1}.</span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-[#E8D9C2] bg-[#FAF8F3] p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-[15px] font-bold text-[#8A7E6A]">{facilityNextStep.title}</h3>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[10.5px] font-medium text-[#A85E2D]">
            正在开发
          </span>
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.75] text-[#A8927A]">{facilityNextStep.desc}</p>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
        <p className="text-[13px] leading-[1.8] text-[#6A6256]">
          如果不确定现在该不该往机构走，也可以先花四分钟做一次居家自测——它不劝你去，也不劝你留。之前填过的进度会保留。
        </p>
        <button
          type="button"
          onClick={onBackHome}
          className="mt-4 rounded-full border border-[#C87941] px-5 py-2.5 text-sm font-bold text-[#C87941] transition-colors hover:bg-[#FDF5EE]"
        >
          ← 回到居家自测
        </button>
      </div>
    </section>
  );
}

/* ── Step 0 身份分流 ──────────────────────────────────── */

function IdentityStep({
  identity,
  onPick,
  onNext,
}: {
  identity: IdentityType | null;
  onPick: (v: IdentityType) => void;
  onNext: () => void;
}) {
  return (
    <section className="mt-5 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
      <StepBadge index="01" title="先确认是谁在问" />
      <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:mt-4 sm:text-2xl">
        这三种情况，后面问的问题不一样
      </h2>
      <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
        结论要给的人不同，行动的人也不同。先选一个，题目会跟着改变人称。
      </p>

      <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:gap-3">
        {identityOptions.map((opt) => {
          const active = identity === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPick(opt.value)}
              className={`rounded-xl border p-3.5 text-left transition-all sm:p-4 ${
                active
                  ? 'border-[#C87941] bg-[#FDF5EE] shadow-[0_8px_20px_rgba(200,121,65,0.10)]'
                  : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D6C4AB]'
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-[16px] font-bold text-[#4A3728]">{opt.label}</span>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-[#A85E2D]">
                      {opt.note}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#8A7E6A]">{opt.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Nav onNext={onNext} nextDisabled={!identity} hint={identity ? undefined : '请先选择'} />
    </section>
  );
}

/* ── Step 1 硬信号 ────────────────────────────────────── */

function SignalRow({
  signal,
  value,
  onPick,
}: {
  signal: HardSignal;
  value: boolean | undefined;
  onPick: (v: boolean) => void;
}) {
  return (
    <div className="border-t border-[#F0E6D6] py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#A8927A]">{signal.id}</span>
            <span className="text-[15px] font-bold text-[#4A3728]">{signal.title}</span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed text-[#8A7E6A]">{signal.detail}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Pill active={value === true} onClick={() => onPick(true)}>
            有
          </Pill>
          <Pill active={value === false} onClick={() => onPick(false)}>
            没有
          </Pill>
        </div>
      </div>
    </div>
  );
}

function SignalStep({
  signals,
  onToggle,
  onBack,
  onNext,
}: {
  signals: Partial<Record<SignalId, boolean>>;
  onToggle: (id: SignalId, v: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const answered = hardSignals.filter((s) => typeof signals[s.id] === 'boolean').length;
  const hitRed = hardSignals.filter((s) => s.level === 'red' && signals[s.id]).length;

  return (
    <section className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white p-6 sm:p-8">
      <StepBadge index="02" title="过一遍硬条件" />
      <h2 className="mt-4 text-2xl leading-snug font-bold text-[#4A3728]">这六条，有就点「有」</h2>
      <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
        它们不是扣分项，是开关。前四条任意一条成立，居家这条路的判断逻辑就要换一套。
      </p>

      <div className="mt-6">
        {hardSignals.map((s) => (
          <SignalRow
            key={s.id}
            signal={s}
            value={signals[s.id]}
            onPick={(v) => onToggle(s.id, v)}
          />
        ))}
      </div>

      {hitRed > 0 && (
        <div className="mt-5 rounded-xl border border-[#E8C9C0] bg-[#FDF3F0] p-4">
          <p className="text-[13px] leading-[1.75] text-[#8A4B33]">
            已命中 {hitRed} 条硬条件。后面的五维仍可以填完——它会告诉你缺口在哪、还能补什么，但结论会落在「机构」这一侧。
          </p>
        </div>
      )}

      <Nav
        onBack={onBack}
        onNext={onNext}
        hint={answered < hardSignals.length ? `还有 ${hardSignals.length - answered} 条未答，未答按「没有」计` : undefined}
      />
    </section>
  );
}

/* ── Step 2 五维 ──────────────────────────────────────── */

function DimensionCard({
  dim,
  subject,
  answers,
  onAnswer,
}: {
  dim: Dimension;
  subject: string;
  answers: Partial<Record<string, number>>;
  onAnswer: (qid: string, score: number) => void;
}) {
  const scored = dim.key !== 'will';
  const score = dimScore(dim, answers);

  return (
    <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[17px] font-bold text-[#4A3728]">{dim.name}</h3>
        {scored ? (
          <span className="text-[12px] font-medium text-[#A8927A]">{score} / 4</span>
        ) : (
          <span className="rounded-full bg-[#FDF5EE] px-2.5 py-0.5 text-[11px] font-medium text-[#A85E2D]">
            不计入总分
          </span>
        )}
      </div>
      <p className="mt-1 text-[13px] leading-relaxed text-[#8A7E6A]">{dim.intro}</p>

      <div className="mt-5 space-y-5">
        {dim.questions.map((q) => (
          <div key={q.id}>
            <p className="mb-2 text-[14px] font-medium text-[#4A3728]">
              {q.text.replace('{s}', subject)}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((opt) => (
                <Pill
                  key={opt.label}
                  active={answers[q.id] === opt.score}
                  onClick={() => onAnswer(q.id, opt.score)}
                >
                  {opt.label}
                </Pill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DimensionStep({
  identity,
  answers,
  onAnswer,
  onBack,
  onNext,
}: {
  identity: IdentityType | null;
  answers: Partial<Record<string, number>>;
  onAnswer: (qid: string, score: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const subject = subjectOf(identity);
  const total = dimensions.reduce((n, d) => n + d.questions.length, 0);
  const done = dimensions.reduce(
    (n, d) => n + d.questions.filter((q) => typeof answers[q.id] === 'number').length,
    0
  );

  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6 sm:p-8">
        <StepBadge index="03" title="看五个维度" />
        <h2 className="mt-4 text-2xl leading-snug font-bold text-[#4A3728]">
          撑不撑得住，看这五件事
        </h2>
        <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
          一共 {total} 个问题。前四维计入结论，第五维只做提醒——意愿和结论冲突时，以意愿为准。
        </p>
      </div>

      {dimensions.map((d) => (
        <DimensionCard
          key={d.key}
          dim={d}
          subject={subject}
          answers={answers}
          onAnswer={onAnswer}
        />
      ))}

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6 sm:p-8">
        <Nav
          onBack={onBack}
          onNext={onNext}
          nextLabel="看结论"
          nextDisabled={done < total}
          hint={done < total ? `还有 ${total - done} 题未答` : undefined}
        />
      </div>
    </section>
  );
}

/* ── Step 3 报告 A ────────────────────────────────────── */

const toneStyles: Record<'green' | 'amber' | 'red', { bg: string; border: string; text: string; bar: string }> = {
  green: { bg: 'bg-[#F1F7F1]', border: 'border-[#C9DFC9]', text: 'text-[#3F6B45]', bar: 'bg-[#5C8A5C]' },
  amber: { bg: 'bg-[#FDF7EC]', border: 'border-[#EBD9BB]', text: 'text-[#8A6420]', bar: 'bg-[#C89B45]' },
  red: { bg: 'bg-[#FDF3F0]', border: 'border-[#E8C9C0]', text: 'text-[#8A4B33]', bar: 'bg-[#B4644A]' },
};

function ReportStep({
  identity,
  signals,
  answers,
  onRestart,
  onBack,
  onOpenFacility,
}: {
  identity: IdentityType | null;
  signals: Partial<Record<SignalId, boolean>>;
  answers: Partial<Record<string, number>>;
  onRestart: () => void;
  onBack: () => void;
  onOpenFacility: () => void;
}) {
  const result = evaluate(signals, answers);
  const copy = verdictCopy(result.verdict);
  const tone = toneStyles[copy.tone];
  const gaps = gapsOf(answers);
  const actor = actorOf(identity);
  const willScore = dimScore(dimensions[4], answers);
  const hitSignals = hardSignals.filter((s) => signals[s.id]);

  return (
    <section className="mt-4 space-y-4">
      {/* 结论 */}
      <div className={`rounded-2xl border ${tone.border} ${tone.bg} p-6 sm:p-8`}>
        <div className="flex items-center gap-2">
          <span className={`rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold tracking-[0.16em] ${tone.text}`}>
            {copy.tag}
          </span>
          <span className={`text-[12px] ${tone.text} opacity-80`}>
            四维得分 {result.score} / {result.maxScore}
          </span>
        </div>
        <h2 className={`mt-3 text-[26px] leading-snug font-bold ${tone.text}`}>{copy.title}</h2>
        <p className="mt-3 text-[14px] leading-[1.85] text-[#5A5A5A]">{copy.desc}</p>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/70">
          <div
            className={`h-full rounded-full ${tone.bar}`}
            style={{ width: `${Math.round(result.ratio * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[#A8927A]">
          满分 {MAX_SCORE}；13 分及以上为绿灯，8–12 分为黄灯，7 分以下或命中硬条件为红灯
        </p>
      </div>

      {/* 命中的硬条件 */}
      {hitSignals.length > 0 && (
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">命中的硬条件</h3>
          <ul className="mt-4 space-y-3">
            {hitSignals.map((s) => (
              <li key={s.id} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDF3F0] text-[10px] font-bold text-[#A85E2D]">
                  {s.id}
                </span>
                <div>
                  <p className="text-[14px] font-medium text-[#4A3728]">{s.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#8A7E6A]">
                    指向：{s.pointsTo}
                  </p>
                  {s.href && (
                    <Link
                      href={s.href}
                      className="mt-1 inline-block text-[12.5px] font-semibold text-[#C87941] hover:underline"
                    >
                      去做意定人评估 →
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 五维拉平 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">五个维度</h3>
        <div className="mt-4 space-y-3.5">
          {dimensions.map((d) => {
            const s = dimScore(d, answers);
            const isWill = d.key === 'will';
            return (
              <div key={d.key}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-[#4A3728]">{d.name}</span>
                  <span className="text-[11px] text-[#A8927A]">
                    {isWill ? `${s} / 4（仅提醒）` : `${s} / 4`}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#F2EADD]">
                  <div
                    className={`h-full rounded-full ${
                      isWill ? 'bg-[#C9B49A]' : s >= 3 ? 'bg-[#5C8A5C]' : s === 2 ? 'bg-[#C89B45]' : 'bg-[#B4644A]'
                    }`}
                    style={{ width: `${(s / 4) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {willScore <= 1 && (
          <p className="mt-4 rounded-xl bg-[#FDF7EC] p-3 text-[12.5px] leading-relaxed text-[#8A6420]">
            意愿这一维偏低。它不改变上面的结论，但如果本人坚决不去机构，这个约束是真实的——需要先解决信任问题，再谈条件。
          </p>
        )}
      </div>

      {/* 缺口与补法 */}
      {scoredDimensions.length > 0 && (
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">缺口在哪，怎么补</h3>
          {gaps.length === 0 ? (
            <p className="mt-3 text-[13.5px] leading-[1.8] text-[#6A6256]">
              四个维度都在及格线以上，没有明显短板。接下来重点是维持：把已经做了的事固定成习惯。
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {gaps.map((d) => (
                <div key={d.key} className="rounded-xl bg-[#FAF8F3] p-4">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[14px] font-bold text-[#4A3728]">{d.name}</p>
                    <span className="text-[11px] text-[#A85E2D]">{dimScore(d, answers)} / 4</span>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {d.fixes.map((f) => (
                      <li key={f.title} className="text-[12.5px] leading-[1.75] text-[#6A6256]">
                        <span className="font-semibold text-[#4A3728]">{f.title}：</span>
                        {f.detail}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-[11.5px] text-[#A8927A]">建议由{actor}来推进。</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 居家注意事项 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">留在家里，先把这五件事办了</h3>
        <ol className="mt-4 space-y-3">
          {homeAdvice.map((a, i) => (
            <li key={a.title} className="flex gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-[10px] font-bold text-[#C87941]">
                {i + 1}
              </span>
              <div>
                <p className="text-[13.5px] font-medium text-[#4A3728]">{a.title}</p>
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#8A7E6A]">{a.detail}</p>
                {a.href && (
                  <Link
                    href={a.href}
                    className="mt-1 inline-block text-[12.5px] font-semibold text-[#C87941] hover:underline"
                  >
                    {a.linkLabel} →
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* 转介条件 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">出现这些，就该重新看机构</h3>
        <ul className="mt-3 space-y-2">
          {referralRules.map((r) => (
            <li key={r} className="flex gap-2 text-[13px] leading-[1.7] text-[#6A6256]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C87941]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl bg-[#FAF8F3] p-4">
          <p className="text-[12px] font-bold tracking-[0.12em] text-[#A8927A] uppercase">
            半年后回来看这几项
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {watchPoints.map((w) => (
              <li key={w} className="text-[12.5px] leading-relaxed text-[#6A6256]">
                · {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 下一步 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">接下来</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-[#E8D9C2] p-4">
            <p className="text-[13.5px] font-bold text-[#8A7E6A]">机构类型建议</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#A8927A]">
              护理等级自查、机构类型排除法、参访提问清单——正在开发。
            </p>
            <button
              type="button"
              onClick={onOpenFacility}
              className="mt-2 text-[12.5px] font-semibold text-[#C87941] hover:underline"
            >
              先看五类机构对照 →
            </button>
          </div>
          <Link
            href="/tools/ta-worth-trust"
            className="rounded-xl border border-[#E8D9C2] p-4 transition-colors hover:border-[#C87941]"
          >
            <p className="text-[13.5px] font-bold text-[#4A3728]">先把医疗代理补上 →</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#8A7E6A]">
              无人签字这件事，指向「意定人选择」。这个工具帮你评估那个人扛不扛得住。
            </p>
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            ← 回去改答案
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full bg-[#C87941] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#A85E2D]"
          >
            重新填一次
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── 主组件 ───────────────────────────────────────────── */

const STEP_LABELS = ['身份', '硬条件', '五个维度', '结论'];

export default function AgingChoiceWizard() {
  const hydrated = usePersistHydrated(useAgingChoiceStore);
  const branch = useAgingChoiceStore((s) => s.branch);
  const identity = useAgingChoiceStore((s) => s.identity);
  const signals = useAgingChoiceStore((s) => s.signals);
  const answers = useAgingChoiceStore((s) => s.answers);
  const step = useAgingChoiceStore((s) => s.step);
  const setBranch = useAgingChoiceStore((s) => s.setBranch);
  const setIdentity = useAgingChoiceStore((s) => s.setIdentity);
  const toggleSignal = useAgingChoiceStore((s) => s.toggleSignal);
  const setAnswer = useAgingChoiceStore((s) => s.setAnswer);
  const setStep = useAgingChoiceStore((s) => s.setStep);
  const complete = useAgingChoiceStore((s) => s.complete);
  const reset = useAgingChoiceStore((s) => s.reset);

  // 步骤 / 分支切换后回到顶部：下一步按钮在长页底部，不重置会落在新内容的中段
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const prevStep = React.useRef(step);
  const prevBranch = React.useRef(branch);
  React.useEffect(() => {
    if (prevStep.current === step && prevBranch.current === branch) return;
    prevStep.current = step;
    prevBranch.current = branch;
    // 等新内容完成布局再量位置，否则会按旧高度算出被夹断的滚动目标
    const id = requestAnimationFrame(() => {
      const el = wrapRef.current;
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84 });
    });
    return () => cancelAnimationFrame(id);
  }, [step, branch]);

  if (!hydrated) {
    return (
      <div className="mt-5 rounded-2xl border border-[#E8D9C2] bg-white p-8">
        <p className="text-sm text-[#8A7E6A]">正在读取上次的进度…</p>
      </div>
    );
  }

  if (branch === null) {
    return (
      <div ref={wrapRef} className="mt-5">
        <WelcomeStep onPick={setBranch} />
      </div>
    );
  }

  if (branch === 'facility') {
    return (
      <div ref={wrapRef} className="mt-5">
        <FacilityStep onBackHome={() => setBranch('home')} />
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="mt-5">
      {/* 进度 */}
      <div className="flex items-center gap-2">
        {STEP_LABELS.map((label, i) => {
          const active = step === i;
          const done = step > i;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`h-1 flex-1 rounded-full ${
                  active ? 'bg-[#C87941]' : done ? 'bg-[#E0B182]' : 'bg-[#E8D9C2]'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] text-[#A8927A]">
        <span className="tracking-[0.14em]">
          第 {Math.min(step + 1, 4)} 步 / 共 4 步 · {STEP_LABELS[Math.min(step, 3)]}
        </span>
        <span>约 4 分钟 · 进度自动保存</span>
      </div>

      {step === 0 && (
        <IdentityStep identity={identity} onPick={setIdentity} onNext={() => setStep(1)} />
      )}

      {step === 1 && (
        <SignalStep
          signals={signals}
          onToggle={toggleSignal}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <DimensionStep
          identity={identity}
          answers={answers}
          onAnswer={setAnswer}
          onBack={() => setStep(1)}
          onNext={complete}
        />
      )}

      {step === 3 && (
        <ReportStep
          identity={identity}
          signals={signals}
          answers={answers}
          onBack={() => setStep(2)}
          onRestart={reset}
          onOpenFacility={() => setBranch('facility')}
        />
      )}
    </div>
  );
}
