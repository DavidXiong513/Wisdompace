'use client';

import React from 'react';
import Link from 'next/link';
import { useLifeClockStore } from '@/stores/lifeClockStore';
import { useRetirementCostStore } from '@/stores/retirementCostStore';
import { calculateAge } from '@/lib/life-clock/engine';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import {
  DEFAULT_RETIREMENT_AGE,
  HEALTH_PRESETS,
  HOUSEHOLD_OPTIONS,
} from '@/data/retirement-cost-calculator/defaults';
import { getRetirementStartAge } from '@/lib/retirement-cost-calculator/engine';
import { formatWan } from '@/components/tools/retirement-cost-calculator/format';

const STEP_LABELS = ['生命坐标', '收支底盘', '生活方式', '健康照护'];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#8A7E6A]">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-[11px] leading-relaxed text-[#A99C88]">{hint}</p>}
    </div>
  );
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 120,
  step = 1,
  suffix,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] px-4 py-3 text-sm text-[#4A3728] outline-none transition-colors focus:border-[#C87941]"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#A99C88]">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  );
}

function MoneyField({
  label,
  hint,
  value,
  onChange,
  unit,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  unit: 'month' | 'year' | 'once';
}) {
  const unitLabel = unit === 'month' ? '元/月' : unit === 'year' ? '元/年' : '元，一次性';
  return (
    <Field label={label} hint={hint}>
      <div className="relative">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={100}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Math.max(0, Number(event.target.value) || 0))}
          className="w-full rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] px-4 py-3 pr-24 text-sm text-[#4A3728] outline-none transition-colors focus:border-[#C87941]"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#A99C88]">
          {unitLabel}
        </span>
      </div>
      {value > 0 && (
        <p className="mt-1 text-[11px] text-[#C87941]">≈ {formatWan(value)}</p>
      )}
    </Field>
  );
}

function ChoiceButton({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-all ${
        active
          ? 'border-[#C87941] bg-[#FDF5EE] text-[#A85E2D]'
          : 'border-[#E8D9C2] bg-white text-[#6A6256] hover:border-[#C87941]/60'
      }`}
    >
      <span className={`block text-sm ${active ? 'font-bold' : 'font-semibold'}`}>{title}</span>
      {description && <span className="mt-1 block text-[11px] leading-relaxed opacity-80">{description}</span>}
    </button>
  );
}

export function RetirementCostForm() {
  const { input, step, updateInput, setStep } = useRetirementCostStore();
  const lifeClockHydrated = usePersistHydrated(useLifeClockStore);
  const lifeCompleted = useLifeClockStore((state) => state.isCompleted);
  const lifeResult = useLifeClockStore((state) => state.result);
  const lifeInput = useLifeClockStore((state) => state.input);

  const startAge = getRetirementStartAge(input);
  const ageInvalid = input.planningAge <= startAge;
  const notRetired = input.currentAge < input.retirementAge;
  const yearsToRetirement = Math.max(0, input.retirementAge - input.currentAge);

  const importLifeClock = () => {
    if (!lifeResult) return;
    const currentAge = calculateAge(lifeInput.birthDate);
    updateInput({
      currentAge,
      planningAge: Math.max(input.retirementAge + 1, Math.ceil(lifeResult.expectedLifespan)),
      referenceLifespan: lifeResult.expectedLifespan,
      lifespanImportedAt: new Date().toISOString(),
    });
  };

  const applyHealthPreset = (key: (typeof HEALTH_PRESETS)[number]['key']) => {
    const preset = HEALTH_PRESETS.find((item) => item.key === key);
    if (!preset) return;
    const careStartAge =
      preset.careStartAgeOffset === -999
        ? Math.max(startAge, input.currentAge)
        : Math.min(
            input.planningAge,
            Math.max(startAge, input.planningAge + preset.careStartAgeOffset)
          );
    updateInput({
      healthStatus: preset.key,
      careStartAge,
      careYears: preset.careYears,
    });
  };

  const lifestyleAnnual =
    input.interestsMonthly * 12 +
    input.domesticTripsPerYear * input.domesticTripCost +
    (input.overseasTripEveryYears > 0
      ? input.overseasTripCost / input.overseasTripEveryYears
      : 0) +
    input.socialAnnual;

  return (
    <div className="mx-auto max-w-3xl">
      <nav className="mb-5 flex items-start gap-1.5" aria-label="填写步骤，可点击切换">
        {STEP_LABELS.map((label, index) => {
          const isCurrent = step === index;
          const isVisited = step > index;
          return (
            <button
              key={label}
              type="button"
              onClick={() => setStep(index)}
              aria-current={isCurrent ? 'step' : undefined}
              title={`切换到：${label}`}
              className="group flex-1 cursor-pointer rounded-md pb-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C87941]/50"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  isCurrent
                    ? 'bg-[#C87941]'
                    : isVisited
                      ? 'bg-[#C87941]/45 group-hover:bg-[#C87941]/70'
                      : 'bg-[#E8D9C2] group-hover:bg-[#D9C6AA]'
                }`}
              />
              <span
                className={`mt-1.5 block text-center text-[9px] transition-colors sm:text-[10px] ${
                  isCurrent
                    ? 'font-bold text-[#C87941]'
                    : isVisited
                      ? 'font-medium text-[#A87245] group-hover:text-[#C87941]'
                      : 'text-[#A99C88] group-hover:text-[#8A7E6A]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 shadow-sm sm:p-8">
        {step === 0 && (
          <section className="animate-in fade-in slide-in-from-right-3 duration-300">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">Step 01</p>
            <h2 className="mt-1 text-xl font-bold text-[#4A3728]">先确定余生有多长</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#8A7E6A]">
              本工具只测算退休后的花费，退休前的日常消费不在范围内。
            </p>

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="我现在的年龄"
                  value={input.currentAge}
                  onChange={(value) => updateInput({ currentAge: value })}
                  min={18}
                  max={110}
                  suffix="岁"
                />
                <NumberField
                  label="计划退休年龄"
                  value={input.retirementAge}
                  onChange={(value) => updateInput({ retirementAge: value })}
                  min={40}
                  max={90}
                  suffix="岁"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updateInput({ retirementAge: DEFAULT_RETIREMENT_AGE.male })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    input.retirementAge === DEFAULT_RETIREMENT_AGE.male
                      ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941]'
                      : 'border-[#E8D9C2] text-[#8A7E6A]'
                  }`}
                >
                  男职工默认 63 岁
                </button>
                <button
                  type="button"
                  onClick={() => updateInput({ retirementAge: DEFAULT_RETIREMENT_AGE.female })}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    input.retirementAge === DEFAULT_RETIREMENT_AGE.female
                      ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941]'
                      : 'border-[#E8D9C2] text-[#8A7E6A]'
                  }`}
                >
                  女职工默认 58 岁
                </button>
              </div>

              {notRetired && (
                <div className="rounded-xl border border-[#E8D9C2] bg-[#FAF8F3] px-4 py-3 text-xs leading-relaxed text-[#8A7E6A]">
                  距离计划退休还有 <strong className="text-[#C87941]">{yearsToRetirement} 年</strong>。
                  测算将从 {input.retirementAge} 岁开始，不计算退休前的收入与消费。
                </div>
              )}

              <div className="rounded-2xl border border-[#C87941]/25 bg-[#FDF5EE] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#4A3728]">从「生命余光」带入年龄与参考寿命</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">
                      只读取当前年龄和寿命结果，不读取健康明细。带入后仍可手动修改。
                    </p>
                    {lifeClockHydrated && lifeCompleted && lifeResult ? (
                      <p className="mt-2 text-xs text-[#C87941]">
                        已检测到参考寿命约 {lifeResult.expectedLifespan.toFixed(1)} 岁，剩余约{' '}
                        {lifeResult.remainingYears.toFixed(1)} 年。
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-[#8A7E6A]">
                        还没有完成生命余光测算？可以先去测一次，再回来带入。
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    {lifeClockHydrated && lifeCompleted && lifeResult ? (
                      <button
                        type="button"
                        onClick={importLifeClock}
                        className="rounded-full bg-[#C87941] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#A85E2D]"
                      >
                        采用生命余光结果
                      </button>
                    ) : (
                      <Link
                        href="/tools/life-clock"
                        target="_blank"
                        className="rounded-full border border-[#C87941] px-4 py-2 text-center text-xs font-bold text-[#C87941] transition-colors hover:bg-white"
                      >
                        去测生命余光
                      </Link>
                    )}
                  </div>
                </div>
                {input.lifespanImportedAt && (
                  <p className="mt-3 border-t border-[#C87941]/15 pt-2 text-[10px] text-[#A99C88]">
                    上次带入：{new Date(input.lifespanImportedAt).toLocaleString('zh-CN')} · 参考寿命{' '}
                    {input.referenceLifespan?.toFixed(1)} 岁
                  </p>
                )}
              </div>

              <NumberField
                label="规划终点年龄"
                hint="表示“我打算为到多少岁之前的生活做准备”，不是寿命判断。结果页还会自动给出 +5 年和 +10 年情景。"
                value={input.planningAge}
                onChange={(value) => updateInput({ planningAge: value })}
                min={startAge + 1}
                max={120}
                suffix="岁"
              />

              {ageInvalid && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  规划终点必须晚于退休起始年龄（{startAge} 岁）。请调整年龄后再继续。
                </p>
              )}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="animate-in fade-in slide-in-from-right-3 duration-300">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">Step 02</p>
            <h2 className="mt-1 text-xl font-bold text-[#4A3728]">你和钱，从哪里来</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#8A7E6A]">
              首版默认养老主要靠自己与伴侣；不计子女赡养收入，也不计算对子女的长期转移支出。
            </p>

            <div className="mt-6 space-y-6">
              <Field label="测算口径">
                <div className="grid gap-3 sm:grid-cols-2">
                  {HOUSEHOLD_OPTIONS.map((option) => (
                    <ChoiceButton
                      key={option.key}
                      active={input.householdMode === option.key}
                      onClick={() => updateInput({ householdMode: option.key })}
                      title={option.label}
                      description={option.description}
                    />
                  ))}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField
                  label={input.householdMode === 'couple' ? '两人合计退休金' : '我的退休金'}
                  value={input.monthlyPension}
                  onChange={(value) => updateInput({ monthlyPension: value })}
                  unit="month"
                />
                <MoneyField
                  label="其他稳定月收入"
                  hint="房租、年金、商业养老金等可长期领取的收入。"
                  value={input.otherMonthlyIncome}
                  onChange={(value) => updateInput({ otherMonthlyIncome: value })}
                  unit="month"
                />
                <MoneyField
                  label="可动用养老储备"
                  hint="存款、理财、商业养老金等真正可以拿出来花的钱。"
                  value={input.movableReserve}
                  onChange={(value) => updateInput({ movableReserve: value })}
                  unit="once"
                />
                <MoneyField
                  label="不可直接动用的家庭资产"
                  hint="例如自住房、家庭共有房产。这里仅作记录，不会自动算进可覆盖资金。"
                  value={input.nonLiquidAssets}
                  onChange={(value) => updateInput({ nonLiquidAssets: value })}
                  unit="once"
                />
                <MoneyField
                  label="基本生活月支出"
                  hint={input.householdMode === 'couple' ? '按两人合计填写：吃饭、水电、日用、通讯等。' : '吃饭、水电、日用、通讯等。'}
                  value={input.basicLivingMonthly}
                  onChange={(value) => updateInput({ basicLivingMonthly: value })}
                  unit="month"
                />
                <MoneyField
                  label="住房月支出"
                  hint="房租、房贷、物业等；无贷款的完全自有住房可填 0。"
                  value={input.housingMonthly}
                  onChange={(value) => updateInput({ housingMonthly: value })}
                  unit="month"
                />
                <MoneyField
                  label="年度医疗净自付"
                  hint="医保结算后自己实际承担的部分：慢病用药、体检、看牙等。"
                  value={input.medicalAnnual}
                  onChange={(value) => updateInput({ medicalAnnual: value })}
                  unit="year"
                />
              </div>

              <div className="rounded-xl bg-[#FAF8F3] px-4 py-3 text-xs leading-relaxed text-[#8A7E6A]">
                可覆盖资金 = 退休金和其他稳定收入 + 可动用养老储备。自住房不会被自动当作现金使用。
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-in fade-in slide-in-from-right-3 duration-300">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">Step 03</p>
            <h2 className="mt-1 text-xl font-bold text-[#4A3728]">你想怎样活</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#8A7E6A]">
              这一页是基本生活之外的“享受型支出”。旅行和兴趣不会默认算到生命终点，而是计算到你设定的年龄。
            </p>

            <div className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField
                  label="兴趣爱好月均支出"
                  hint="课程、乐器、摄影、运动、演出、园艺等。"
                  value={input.interestsMonthly}
                  onChange={(value) => updateInput({ interestsMonthly: value })}
                  unit="month"
                />
                <NumberField
                  label="兴趣与社交持续到"
                  hint="超过这个年龄后，默认不再计入兴趣、国内旅行和社交人情。"
                  value={input.lifestyleUntilAge}
                  onChange={(value) => updateInput({ lifestyleUntilAge: value })}
                  min={input.retirementAge}
                  max={120}
                  suffix="岁"
                />
              </div>

              <div className="rounded-xl border border-[#E8D9C2] p-4">
                <h3 className="text-sm font-bold text-[#4A3728]">国内旅行</h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <NumberField
                    label="每年几次"
                    value={input.domesticTripsPerYear}
                    onChange={(value) => updateInput({ domesticTripsPerYear: value })}
                    min={0}
                    max={20}
                    suffix="次"
                  />
                  <MoneyField
                    label="每次人均花费"
                    value={input.domesticTripCost}
                    onChange={(value) => updateInput({ domesticTripCost: value })}
                    unit="once"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-[#E8D9C2] p-4">
                <h3 className="text-sm font-bold text-[#4A3728]">境外或长途旅行</h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <NumberField
                    label="每几年一次"
                    value={input.overseasTripEveryYears}
                    onChange={(value) => updateInput({ overseasTripEveryYears: value })}
                    min={1}
                    max={10}
                    suffix="年"
                  />
                  <MoneyField
                    label="每次人均花费"
                    value={input.overseasTripCost}
                    onChange={(value) => updateInput({ overseasTripCost: value })}
                    unit="once"
                  />
                  <NumberField
                    label="持续到"
                    value={input.overseasUntilAge}
                    onChange={(value) => updateInput({ overseasUntilAge: value })}
                    min={input.retirementAge}
                    max={120}
                    suffix="岁"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <MoneyField
                  label="社交人情年支出"
                  hint="红白喜事、随礼、亲友聚餐、节日往来。"
                  value={input.socialAnnual}
                  onChange={(value) => updateInput({ socialAnnual: value })}
                  unit="year"
                />
                <MoneyField
                  label="一次性愿望总预算"
                  hint="这辈子一定要去的旅行、想体验的事，作为一次性支出计入。"
                  value={input.wishListTotal}
                  onChange={(value) => updateInput({ wishListTotal: value })}
                  unit="once"
                />
              </div>

              <button
                type="button"
                onClick={() => updateInput({ protectLifestyle: !input.protectLifestyle })}
                className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  input.protectLifestyle
                    ? 'border-[#C87941] bg-[#FDF5EE]'
                    : 'border-[#E8D9C2] bg-white'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${
                    input.protectLifestyle
                      ? 'border-[#C87941] bg-[#C87941] text-white'
                      : 'border-[#D8CBB5] text-transparent'
                  }`}
                >
                  ✓
                </span>
                <span>
                  <span className="block text-sm font-bold text-[#4A3728]">这一段热爱，尽量不牺牲</span>
                  <span className="mt-1 block text-xs leading-relaxed text-[#8A7E6A]">
                    标记后，结果页会单列这部分成本；即使出现缺口，也优先从其他类别调整。
                  </span>
                </span>
              </button>

              <div className="rounded-xl bg-[#FAF8F3] px-4 py-3">
                <div className="flex items-center justify-between text-xs text-[#8A7E6A]">
                  <span>活力期年平均享受型支出</span>
                  <strong className="text-base text-[#C87941]">{formatWan(lifestyleAnnual)}</strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-in fade-in slide-in-from-right-3 duration-300">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">Step 04</p>
            <h2 className="mt-1 text-xl font-bold text-[#4A3728]">为身体变化留出余地</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#8A7E6A]">
              这里的健康状态只用于生成照护预算，不是医学预期，也不会被当作寿命判断。
            </p>

            <div className="mt-6 space-y-6">
              <Field label="当前身体状况">
                <div className="grid gap-2 sm:grid-cols-2">
                  {HEALTH_PRESETS.map((preset) => (
                    <ChoiceButton
                      key={preset.key}
                      active={input.healthStatus === preset.key}
                      onClick={() => applyHealthPreset(preset.key)}
                      title={preset.label}
                      description={preset.description}
                    />
                  ))}
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField
                  label="预计从几岁开始需要照护"
                  value={input.careStartAge}
                  onChange={(value) => updateInput({ careStartAge: value })}
                  min={startAge}
                  max={120}
                  suffix="岁"
                />
                <NumberField
                  label="预计照护多少年"
                  hint="超过规划终点时会按规划终点截断。"
                  value={input.careYears}
                  onChange={(value) => updateInput({ careYears: value })}
                  min={0}
                  max={30}
                  suffix="年"
                />
                <MoneyField
                  label="每月净照护自付"
                  hint="日常生活之外的增量：保姆、护理院、护工等，扣除长护险与商业保险报销后的自付部分。"
                  value={input.careMonthlyNet}
                  onChange={(value) => updateInput({ careMonthlyNet: value })}
                  unit="month"
                />
                <MoneyField
                  label="大病自付预留"
                  hint="希望为可能的重大疾病自费部分预留多少。"
                  value={input.majorIllnessReserve}
                  onChange={(value) => updateInput({ majorIllnessReserve: value })}
                  unit="once"
                />
                <MoneyField
                  label="身后安排预算"
                  hint="治丧、墓地或海葬、杂项等一次性支出。"
                  value={input.funeralCost}
                  onChange={(value) => updateInput({ funeralCost: value })}
                  unit="once"
                />
              </div>

              <Field
                label={`应急预备金：${input.emergencyReserveRate}%`}
                hint="在总支出之外额外预留，用来应对意外支出与估算误差。默认 10%。"
              >
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={1}
                  value={input.emergencyReserveRate}
                  onChange={(event) =>
                    updateInput({ emergencyReserveRate: Number(event.target.value) })
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8D9C2] accent-[#C87941]"
                />
                <div className="mt-1 flex justify-between text-[10px] text-[#A99C88]">
                  <span>0%</span>
                  <span>10%</span>
                  <span>20%</span>
                  <span>30%</span>
                </div>
              </Field>

              <div className="rounded-xl border border-[#E8D9C2] bg-[#FAF8F3] p-4 text-xs leading-relaxed text-[#8A7E6A]">
                所有数字仅保存在这台设备的浏览器里，不会上传云端。你可以随时清除。
              </div>
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#F0E8DC] pt-5">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="rounded-full border border-[#E8D9C2] px-5 py-2.5 text-sm font-semibold text-[#8A7E6A] transition-colors hover:bg-[#FAF8F3]"
            >
              上一步
            </button>
          ) : (
            <Link
              href="/chapter/chapter-3#retirement-cost"
              className="rounded-full border border-[#E8D9C2] px-5 py-2.5 text-sm font-semibold text-[#8A7E6A] transition-colors hover:bg-[#FAF8F3]"
            >
              返回篇章
            </Link>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => !ageInvalid && setStep(step + 1)}
              disabled={ageInvalid}
              className="rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              下一步
            </button>
          ) : (
            <button
              type="button"
              onClick={() => !ageInvalid && setStep(4)}
              disabled={ageInvalid}
              className="rounded-full bg-[#4A3728] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-[#2F2A24] disabled:cursor-not-allowed disabled:opacity-40"
            >
              查看我的晚年账本
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
