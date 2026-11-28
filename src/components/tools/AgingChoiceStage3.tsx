'use client';

import React from 'react';
import { useAgingChoiceStore } from '@/stores/agingChoiceStore';
import { Nav, StepBadge, StepProgress } from '@/components/tools/agingUi';
import {
  budgetTierOptions,
  careLevelNotice,
  careLevels,
  medicalNeedOptions,
  type BudgetTier,
  type CareLevel,
} from '@/data/aging-choice/careLevels';
import { matchFacilities, type TypeVerdict } from '@/data/aging-choice/facilityMatch';
import { visitGroups, visitTips, visitTotalCount } from '@/data/aging-choice/visitQuestions';
import { pricingNotice } from '@/data/aging-choice/agingData';

const STAGE3_LABELS = ['护理等级', '医疗需求', '预算档', '类型建议'];

/* ── 步骤 1：护理等级 ─────────────────────────────────── */

function CareLevelStep({
  value,
  onPick,
  onBack,
  onNext,
}: {
  value: CareLevel | null;
  onPick: (v: CareLevel) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
      <StepBadge index="01" title="先定护理等级" />
      <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:text-2xl">
        现在最接近哪一级？
      </h2>
      <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
        对着下面的判断条件选一档。拿不准就往高估——低估的代价比高估大得多。
      </p>

      <div className="mt-5 space-y-2.5">
        {careLevels.map((def) => {
          const active = value === def.level;
          return (
            <button
              key={def.level}
              type="button"
              onClick={() => onPick(def.level)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
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
                  <p className="text-[15px] font-bold text-[#4A3728]">{def.name}</p>
                  <p className="mt-1 text-[13px] leading-[1.75] text-[#6A6256]">{def.summary}</p>
                  <p className="mt-1.5 text-[12px] leading-[1.7] text-[#A8927A]">
                    {def.criteria.join(' ／ ')}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl bg-[#FAF8F3] p-3 text-[12px] leading-[1.7] text-[#A8927A]">
        {careLevelNotice}
      </p>

      <Nav
        onBack={onBack}
        backLabel="← 回到五类速览"
        onNext={onNext}
        nextDisabled={!value}
        hint={value ? undefined : '请先选一档'}
      />
    </section>
  );
}

/* ── 步骤 2：医疗需求 ─────────────────────────────────── */

function MedicalStep({
  selected,
  onToggle,
  onBack,
  onNext,
}: {
  selected: string[];
  onToggle: (v: (typeof medicalNeedOptions)[number]['value']) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
      <StepBadge index="02" title="再看医疗需求" />
      <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:text-2xl">
        有没有医疗上的特殊需要？
      </h2>
      <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
        可以多选。这一组是排除法里最关键的一刀——它决定要不要「医院资质」，而不是「生活照料」。
      </p>

      <div className="mt-5 space-y-2.5">
        {medicalNeedOptions.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onToggle(opt.value)}
              className={`w-full rounded-xl border p-4 text-left transition-all ${
                active
                  ? 'border-[#C87941] bg-[#FDF5EE]'
                  : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold text-white ${
                    active ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D6C4AB] bg-white'
                  }`}
                >
                  {active ? '✓' : ''}
                </span>
                <div className="min-w-0">
                  <p className="text-[14.5px] font-bold text-[#4A3728]">{opt.label}</p>
                  <p className="mt-1 text-[12.5px] leading-[1.7] text-[#8A7E6A]">{opt.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Nav onBack={onBack} onNext={onNext} hint="可以一个都不选" />
    </section>
  );
}

/* ── 步骤 3：预算档 ───────────────────────────────────── */

function BudgetStep({
  value,
  onPick,
  onBack,
  onNext,
}: {
  value: BudgetTier;
  onPick: (v: BudgetTier) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="mt-4 rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
      <StepBadge index="03" title="最后看预算档" />
      <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:text-2xl">
        大概能承受哪个档？
      </h2>
      <p className="mt-3 text-[14px] leading-[1.8] text-[#6A6256]">
        档位<b className="font-bold text-[#4A3728]">不会排除任何类型</b>
        ，只影响同一类型内部选哪一档。拿不准就选「还没定」，结论里会给全档位。
      </p>

      <div className="mt-5 flex flex-wrap gap-2.5">
        {budgetTierOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onPick(opt.value)}
            className={`rounded-xl border px-4 py-3 text-left transition-all ${
              value === opt.value
                ? 'border-[#C87941] bg-[#FDF5EE]'
                : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
            }`}
          >
            <span className="block text-[14px] font-bold text-[#4A3728]">{opt.label}</span>
            <span className="mt-0.5 block text-[11.5px] text-[#A8927A]">{opt.scale}</span>
          </button>
        ))}
      </div>

      <Nav onBack={onBack} onNext={onNext} nextLabel="看类型建议" />
    </section>
  );
}

/* ── 报告 B ───────────────────────────────────────────── */

function TypeCard({
  verdict,
  primary,
}: {
  verdict: TypeVerdict;
  primary: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        primary ? 'border-[#C87941] bg-[#FDF5EE]/70' : 'border-[#E8D9C2] bg-white'
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-[16px] font-bold text-[#4A3728]">{verdict.name}</span>
        <span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-medium text-[#A85E2D]">
          {primary ? '首选' : '备选'}
        </span>
        {verdict.dementiaZone && (
          <span className="rounded-full bg-[#FDF3F0] px-2 py-0.5 text-[10.5px] font-medium text-[#8A4B33]">
            需记忆照护专区
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] leading-[1.7] text-[#6A6256]">{verdict.position}</p>
      {verdict.reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {verdict.reasons.map((r) => (
            <li key={r} className="flex gap-2 text-[12px] leading-[1.7] text-[#5A5A5A]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5C8A5C]" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      )}
      {verdict.tierNote && (
        <p className="mt-2 rounded-lg bg-[#FDF7EC] px-3 py-2 text-[11.5px] leading-[1.7] text-[#8A6420]">
          {verdict.tierNote}
        </p>
      )}
    </div>
  );
}

function ReportB({
  onRestart,
  onBack,
  onExit,
}: {
  onRestart: () => void;
  onBack: () => void;
  onExit: () => void;
}) {
  const careLevel = useAgingChoiceStore((s) => s.careLevel);
  const medicalNeeds = useAgingChoiceStore((s) => s.medicalNeeds);
  const budgetTier = useAgingChoiceStore((s) => s.budgetTier);
  const checked = useAgingChoiceStore((s) => s.checkedQuestions);
  const toggleQuestion = useAgingChoiceStore((s) => s.toggleQuestion);

  const [openGroup, setOpenGroup] = React.useState<string | null>(visitGroups[0]?.key ?? null);

  const result = matchFacilities({ level: careLevel, medical: medicalNeeds, tier: budgetTier });
  const levelDef = careLevels.find((l) => l.level === careLevel);
  const checkedCount = Object.values(checked).filter(Boolean).length;

  return (
    <section className="mt-4 space-y-4">
      {/* 建议类型 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-8">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[11px] font-bold tracking-[0.12em] text-[#C87941]">
          机构侧 · 类型建议
        </span>
        <h2 className="mt-3 text-[22px] leading-snug font-bold text-[#4A3728] sm:text-2xl">
          {result.primary
            ? `你现在该看的是「${result.primary.name}」${
                result.secondary ? `，备选「${result.secondary.name}」` : ''
              }`
            : '现有类型都对不上，建议先做正式评估'}
        </h2>
        <p className="mt-3 text-[13.5px] leading-[1.8] text-[#6A6256]">{result.notice}</p>

        <div className="mt-4 space-y-2.5">
          {result.primary && <TypeCard verdict={result.primary} primary />}
          {result.secondary && <TypeCard verdict={result.secondary} primary={false} />}
        </div>
      </div>

      {/* 护理等级回显 */}
      {levelDef && (
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">你选的等级：{levelDef.name}</h3>
          <p className="mt-2 text-[13px] leading-[1.8] text-[#6A6256]">{levelDef.homeVerdict}</p>
          <p className="mt-2 text-[12.5px] leading-[1.75] text-[#8A7E6A]">{levelDef.facilityHint}</p>
          <p className="mt-3 rounded-xl bg-[#FAF8F3] p-3 text-[11.5px] leading-[1.7] text-[#A8927A]">
            {careLevelNotice}
          </p>
        </div>
      )}

      {/* 排除理由 */}
      {result.excluded.length > 0 && (
        <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
          <h3 className="text-[15px] font-bold text-[#4A3728]">为什么排除了另外几类</h3>
          <div className="mt-4 space-y-3.5">
            {result.excluded.map((v) => (
              <div key={v.key} className="rounded-xl bg-[#FAF8F3] p-4">
                <p className="text-[13.5px] font-bold text-[#8A7E6A]">{v.name}</p>
                <ul className="mt-1.5 space-y-1">
                  {v.blockers.map((b) => (
                    <li key={b} className="flex gap-2 text-[12.5px] leading-[1.7] text-[#6A6256]">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9B49A]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-[1.7] text-[#A8927A]">
            排除是按「能力」不是按「好坏」。被排除的类型并非不好，只是接不住你现在的需求。
          </p>
        </div>
      )}

      {/* 支付渠道 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">钱从哪儿出</h3>
        <div className="mt-3 space-y-2.5">
          {[result.primary, result.secondary]
            .filter((v): v is TypeVerdict => Boolean(v))
            .map((v) => (
              <div key={v.key}>
                <p className="text-[13px] font-bold text-[#4A3728]">{v.name}</p>
                <p className="mt-0.5 text-[12.5px] leading-[1.75] text-[#6A6256]">{v.payment}</p>
              </div>
            ))}
        </div>
        <p className="mt-3 border-t border-[#F0E6D6] pt-3 text-[11.5px] leading-[1.7] text-[#A8927A]">
          各地政策差异大且逐年调整，以当地医保局、民政局最新口径为准。参保类型与户籍性质也会影响待遇。
        </p>
      </div>

      {/* 问价清单 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">{pricingNotice.title}</h3>
        <p className="mt-1.5 text-[12.5px] leading-[1.7] text-[#6A6256]">{pricingNotice.desc}</p>
        <p className="mt-3 text-[11px] font-bold tracking-[0.12em] text-[#A8927A]">问价时先问这六句</p>
        <ol className="mt-2 space-y-1.5">
          {pricingNotice.askTips.map((q, i) => (
            <li key={q} className="flex gap-2 text-[12.5px] leading-[1.7] text-[#6A6256]">
              <span className="shrink-0 font-bold text-[#C87941]">{i + 1}.</span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 参访提问清单 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-[15px] font-bold text-[#4A3728]">参访提问清单</h3>
          <span className="text-[11px] text-[#A8927A]">
            {visitGroups.length} 组 {visitTotalCount} 问 · 已勾 {checkedCount}
          </span>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-[1.7] text-[#8A7E6A]">
          问的是「能不能兑现」，不是「好不好」。点开每组看：听到什么答案算过关。
        </p>

        <div className="mt-4 divide-y divide-[#F0E6D6]">
          {visitGroups.map((g) => {
            const open = openGroup === g.key;
            const done = g.questions.filter((q) => checked[q.id]).length;
            return (
              <div key={g.key} className="py-3">
                <button
                  type="button"
                  onClick={() => setOpenGroup(open ? null : g.key)}
                  className="flex w-full items-baseline justify-between gap-3 text-left"
                >
                  <span className="text-[13.5px] font-bold text-[#4A3728]">
                    {g.title}
                    <span className="ml-2 text-[11px] font-normal text-[#A8927A]">
                      {done}/{g.questions.length}
                    </span>
                  </span>
                  <span className="shrink-0 text-[11px] text-[#C87941]">{open ? '收起' : '展开'}</span>
                </button>

                {open && (
                  <div className="mt-2.5">
                    <p className="rounded-lg bg-[#FAF8F3] p-2.5 text-[11.5px] leading-[1.7] text-[#8A7E6A]">
                      {g.why}
                    </p>
                    <ul className="mt-2.5 space-y-2.5">
                      {g.questions.map((q) => (
                        <li key={q.id} className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleQuestion(q.id)}
                            aria-label={checked[q.id] ? '取消标记' : '标记已问'}
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                              checked[q.id]
                                ? 'border-[#5C8A5C] bg-[#5C8A5C] text-white'
                                : 'border-[#D6C4AB] bg-white text-transparent'
                            }`}
                          >
                            ✓
                          </button>
                          <div className="min-w-0">
                            <p
                              className={`text-[12.5px] leading-[1.75] ${
                                checked[q.id] ? 'text-[#A8927A] line-through' : 'text-[#4A3728]'
                              }`}
                            >
                              {q.text}
                            </p>
                            <p className="mt-0.5 text-[11.5px] leading-[1.65] text-[#A8927A]">
                              过关答案：{q.goodAnswer}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl bg-[#FDF5EE] p-4">
          <p className="text-[11px] font-bold tracking-[0.12em] text-[#A85E2D]">现场技巧</p>
          <ul className="mt-2 space-y-1.5">
            {visitTips.map((t) => (
              <li key={t} className="flex gap-2 text-[12px] leading-[1.7] text-[#6A6256]">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C87941]" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 签约红线 */}
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
        <h3 className="text-[15px] font-bold text-[#4A3728]">签之前，这四条不让步</h3>
        <ul className="mt-3 space-y-2">
          {[
            '口头承诺不写进合同，一律当作没有。',
            '会员卡、大额预存要警惕——预存越多，机构出问题时损失越大。',
            '押金退费条款逐字看：什么条件退、退多少、多久到账。',
            '调价机制要写进合同，不接受「到时候再说」。',
          ].map((t) => (
            <li key={t} className="flex gap-2 text-[13px] leading-[1.75] text-[#6A6256]">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#B4644A]" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-5">
            <button
              type="button"
              onClick={onBack}
              className="text-left text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
            >
              ← 回去改答案
            </button>
            <button
              type="button"
              onClick={onExit}
              className="text-left text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
            >
              ← 回到五类机构对照
            </button>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-full bg-[#C87941] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#A85E2D]"
          >
            重新自查
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── 主组件 ───────────────────────────────────────────── */

export default function AgingChoiceStage3({ onExit }: { onExit: () => void }) {
  const stage3Step = useAgingChoiceStore((s) => s.stage3Step);
  const careLevel = useAgingChoiceStore((s) => s.careLevel);
  const medicalNeeds = useAgingChoiceStore((s) => s.medicalNeeds);
  const budgetTier = useAgingChoiceStore((s) => s.budgetTier);
  const setCareLevel = useAgingChoiceStore((s) => s.setCareLevel);
  const toggleMedicalNeed = useAgingChoiceStore((s) => s.toggleMedicalNeed);
  const setBudgetTier = useAgingChoiceStore((s) => s.setBudgetTier);
  const setStage3Step = useAgingChoiceStore((s) => s.setStage3Step);
  const resetStage3 = useAgingChoiceStore((s) => s.resetStage3);

  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const prevStep = React.useRef(stage3Step);
  React.useEffect(() => {
    if (prevStep.current === stage3Step) return;
    prevStep.current = stage3Step;
    const id = requestAnimationFrame(() => {
      const el = wrapRef.current;
      if (!el) return;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 84 });
    });
    return () => cancelAnimationFrame(id);
  }, [stage3Step]);

  return (
    <div ref={wrapRef}>
      <StepProgress
        labels={STAGE3_LABELS}
        current={stage3Step}
        note={stage3Step === 3 ? undefined : '约 2 分钟 · 只问三件事'}
      />

      {stage3Step === 0 && (
        <CareLevelStep
          value={careLevel}
          onPick={setCareLevel}
          onBack={onExit}
          onNext={() => setStage3Step(1)}
        />
      )}

      {stage3Step === 1 && (
        <MedicalStep
          selected={medicalNeeds}
          onToggle={toggleMedicalNeed}
          onBack={() => setStage3Step(0)}
          onNext={() => setStage3Step(2)}
        />
      )}

      {stage3Step === 2 && (
        <BudgetStep
          value={budgetTier}
          onPick={setBudgetTier}
          onBack={() => setStage3Step(1)}
          onNext={() => setStage3Step(3)}
        />
      )}

      {stage3Step === 3 && (
        <ReportB
          onBack={() => setStage3Step(2)}
          onRestart={resetStage3}
          onExit={onExit}
        />
      )}
    </div>
  );
}
