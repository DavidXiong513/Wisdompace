'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { baselineQuestions, lifestyleQuestions, MAX_LIFESTYLE_SCORE } from '@/data/dementia-prevention/questions';
import { calculateFullResult, getRiskLevel, type BaselineAnswers, type LifestyleAnswers, type RiskLevel, type RiskResult } from '@/data/dementia-prevention/calculation';
import { riskLevelDefs, getGeneticDescription, getAgeDescription, getLifestyleDescription, getActionItems } from '@/data/dementia-prevention/reports';
import { stages, windowColors, windowLabels } from '@/data/dementia-prevention/stages';

// ── 阶段类型 ──
type Phase = 'intro' | 'baseline' | 'lifestyle' | 'report';

// ── 通用单选组件 ──
function RadioGroup({
  question,
  options,
  selectedValue,
  onChange,
}: {
  question: string;
  description?: string;
  options: { label: string; value: number }[];
  selectedValue: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed text-[#5A5A5A]">{question}</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selectedValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-[#C87941] bg-[#FDF5EE] shadow-sm'
                  : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
              }`}
            >
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  isSelected ? 'border-[#C87941] bg-[#C87941]' : 'border-[#C8B8A0] bg-white'
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
              <span className={`text-sm ${isSelected ? 'font-semibold text-[#4A3728]' : 'text-[#5A5A5A]'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 进度条组件 ──
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8D9C2]">
        <div
          className="h-full rounded-full bg-[#C87941] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium text-[#8A7E6A]">
        {current}/{total}
      </span>
    </div>
  );
}

// ── 仪表盘可视化组件 ──
function GaugeMeter({ value, maxValue, label, color }: { value: number; maxValue: number; label: string; color: string }) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#E8D9C2"
            strokeWidth="3"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-lg font-bold" style={{ color }}>
          {value.toFixed(1)}
        </span>
      </div>
      <span className="text-xs font-medium text-[#8A7E6A]">{label}</span>
    </div>
  );
}

// ── 阶段一：基准风险问卷 ──
function BaselinePhase({
  answers,
  onAnswer,
  onNext,
}: {
  answers: BaselineAnswers;
  onAnswer: (id: string, coefficient: number) => void;
  onNext: () => void;
}) {
  const allAnswered = baselineQuestions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
            第一步
          </span>
          <h3 className="mt-2 text-lg font-bold text-[#4A3728]">不可改变的基准风险</h3>
          <p className="mt-1 text-sm text-[#8A7E6A]">
            先了解一些您无法改变的基础情况——年龄和家族史。这部分占整体风险的 60% 权重。
          </p>
        </div>

        <ProgressBar
          current={baselineQuestions.filter((q) => answers[q.id] !== undefined).length}
          total={baselineQuestions.length}
        />

        <div className="mt-6 space-y-6">
          {baselineQuestions.map((q) => (
            <RadioGroup
              key={q.id}
              question={q.title}
              options={q.options.map((opt) => ({
                label: opt.label,
                value: opt.coefficient,
              }))}
              selectedValue={answers[q.id] ?? null}
              onChange={(v) => onAnswer(q.id, v)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          下一步：评估生活方式 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段二：生活方式问卷 ──
function LifestylePhase({
  answers,
  onAnswer,
  onNext,
  onBack,
}: {
  answers: LifestyleAnswers;
  onAnswer: (id: string, score: number) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const allAnswered = lifestyleQuestions.every((q) => answers[q.id] !== undefined);
  const totalScore = lifestyleQuestions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <div className="mb-6">
          <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
            第二步
          </span>
          <h3 className="mt-2 text-lg font-bold text-[#4A3728]">可改变的生活方式风险</h3>
          <p className="mt-1 text-sm text-[#8A7E6A]">
            这部分占整体风险的 40% 权重。根据《柳叶刀》2024 年研究，调整生活方式可降低 45% 的发病风险。如实回答即可。
          </p>
        </div>

        <ProgressBar
          current={lifestyleQuestions.filter((q) => answers[q.id] !== undefined).length}
          total={lifestyleQuestions.length}
        />

        <div className="mt-4 flex items-center justify-between rounded-lg bg-[#FAF8F3] px-4 py-2">
          <span className="text-xs text-[#8A7E6A]">当前生活方式得分</span>
          <span className={`text-sm font-bold ${totalScore <= 3 ? 'text-emerald-600' : totalScore <= 7 ? 'text-amber-600' : 'text-red-500'}`}>
            {totalScore} / {MAX_LIFESTYLE_SCORE} 分
            <span className="ml-1 text-[10px] font-normal text-[#8A7E6A]">
              （低分=健康）
            </span>
          </span>
        </div>

        <div className="mt-6 space-y-6">
          {lifestyleQuestions.map((q) => (
            <RadioGroup
              key={q.id}
              question={q.title}
              options={q.options.map((opt) => ({
                label: opt.label,
                value: opt.score,
              }))}
              selectedValue={answers[q.id] ?? null}
              onChange={(v) => onAnswer(q.id, v)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941]"
        >
          ← 上一步
        </button>
        <button
          onClick={onNext}
          disabled={!allAnswered}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          查看报告 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段三：综合风险报告 ──
function ReportPhase({ result }: { result: RiskResult }) {
  const def = riskLevelDefs[result.riskLevel];
  const actionItems = getActionItems(result.worstDimensions.map((d) => d.id));
  const [showStages, setShowStages] = useState(false);

  return (
    <div className="space-y-8">
      {/* 报告头部 */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          评估报告
        </span>
        <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">
          您的痴呆风险综合评估结果
        </h3>
        <p className="mt-2 text-sm text-[#8A7E6A]">
          基于您的家族史、年龄和当前生活方式综合计算
        </p>
      </div>

      {/* 风险等级卡片 */}
      <div className={`rounded-2xl border-2 p-6 text-center shadow-sm ${def.colorClass}`}>
        <div className="text-4xl">{def.emoji}</div>
        <h4 className="mt-2 text-xl font-bold">{def.label}</h4>
        <div className="mt-2 text-sm leading-relaxed">{def.summary}</div>
      </div>

      {/* 关键指标仪表盘 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">关键风险画像</h4>
        <div className="grid grid-cols-3 gap-4">
          <GaugeMeter
            value={result.baselineCoefficient}
            maxValue={8}
            label="先天风险"
            color={result.baselineCoefficient > 3 ? '#DC2626' : result.baselineCoefficient > 1.5 ? '#D97706' : '#059669'}
          />
          <GaugeMeter
            value={result.lifestyleScore}
            maxValue={MAX_LIFESTYLE_SCORE}
            label="生活方式得分"
            color={result.lifestyleScore > 7 ? '#DC2626' : result.lifestyleScore > 3 ? '#D97706' : '#059669'}
          />
          <GaugeMeter
            value={result.finalCoefficient}
            maxValue={8}
            label="综合风险系数"
            color={result.riskLevel === 'attention' ? '#059669' : result.riskLevel === 'alert' ? '#D97706' : result.riskLevel === 'action' ? '#EA580C' : '#DC2626'}
          />
        </div>
      </div>

      {/* 详细分析 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">详细解读</h4>
        <div className="space-y-3 text-sm leading-relaxed text-[#5A5A5A]">
          <div className="flex gap-2">
            <span className="shrink-0 font-semibold text-[#4A3728]">先天风险：</span>
            <span>{getGeneticDescription(result.geneticCoefficient)}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-semibold text-[#4A3728]">年龄因素：</span>
            <span>{getAgeDescription(result.ageCoefficient)}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 font-semibold text-[#4A3728]">生活方式：</span>
            <span>{getLifestyleDescription(result.lifestyleScore)}</span>
          </div>
        </div>
      </div>

      {/* 优势项 */}
      {result.bestDimensions.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <h4 className="mb-3 text-sm font-bold text-emerald-800">✅ 您的优势项</h4>
          <div className="space-y-2">
            {result.bestDimensions.map((d) => {
              const q = lifestyleQuestions.find((q) => q.id === d.id);
              return (
                <div key={d.id} className="rounded-lg bg-white px-4 py-2 text-sm text-emerald-700">
                  {q?.title || d.id}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-emerald-600">
            这些方面您做得很好！它们是您大脑最强的防护盾，请继续保持。
          </p>
        </div>
      )}

      {/* 待改进项 */}
      {result.worstDimensions.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h4 className="mb-3 text-sm font-bold text-amber-800">🎯 您的待改进项</h4>
          <div className="space-y-3">
            {actionItems.map((item, i) => (
              <div key={i} className="rounded-lg bg-white p-4">
                <div className="text-sm font-semibold text-amber-800">{item.dimension}</div>
                <p className="mt-1 text-xs leading-relaxed text-amber-700">{item.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 核心提示 */}
      <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5 text-center">
        <p className="text-sm font-medium leading-relaxed text-[#4A3728]">
          {def.advice}
        </p>
      </div>

      {/* 重要声明 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-[#FAF8F3] p-5">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#C87941]">重要声明</h4>
        <p className="text-xs leading-relaxed text-[#8A7E6A]">
          本评估结果仅供参考，不能替代专业医疗诊断。如果您有强烈担忧，特别是当您出现持续的记忆力减退等症状时，请务必咨询神经内科或记忆门诊医生。
        </p>
      </div>

      {/* 七阶段科普（可折叠） */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white shadow-sm">
        <button
          onClick={() => setShowStages(!showStages)}
          className="flex w-full items-center justify-between p-5 text-left transition-all hover:bg-[#FAF8F3]"
        >
          <div>
            <h4 className="text-sm font-bold text-[#4A3728]">
              📖 了解病程：阿尔茨海默病的七个发展阶段
            </h4>
            <p className="mt-0.5 text-xs text-[#8A7E6A]">
              把握干预时机，了解从潜伏期到临终期的完整病程
            </p>
          </div>
          <svg
            className={`h-5 w-5 shrink-0 text-[#C87941] transition-transform ${showStages ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showStages && (
          <div className="border-t border-[#E8D9C2] px-5 pb-5">
            <div className="relative mt-4">
              {/* 时间轴线 */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E8D9C2]" />

              <div className="space-y-6">
                {stages.map((stage) => {
                  const windowColor = windowColors[stage.interventionWindow];
                  const windowLabel = windowLabels[stage.interventionWindow];
                  return (
                    <div key={stage.id} className="relative pl-10">
                      {/* 时间轴节点 */}
                      <div className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-white ${
                        stage.interventionWindow === 'primary' ? 'bg-emerald-500' :
                        stage.interventionWindow === 'golden' ? 'bg-amber-500' :
                        stage.interventionWindow === 'late-golden' ? 'bg-orange-500' : 'bg-slate-400'
                      }`} />

                      <div className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-[#4A3728]">
                            阶段 {stage.id}：{stage.label}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${windowColor}`}>
                            {windowLabel}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[#C87941]">{stage.subtitle}</p>
                        <p className="mt-1 text-[10px] text-[#8A7E6A]">{stage.timeframe}</p>
                        <ul className="mt-2 space-y-0.5">
                          {stage.keySymptoms.map((s, i) => (
                            <li key={i} className="text-xs text-[#5A5A5A]">• {s}</li>
                          ))}
                        </ul>
                        {stage.note && (
                          <p className={`mt-2 rounded px-2 py-1 text-[10px] font-medium ${
                            stage.interventionWindow === 'primary' ? 'bg-emerald-50 text-emerald-700' :
                            stage.interventionWindow === 'golden' ? 'bg-amber-50 text-amber-700' :
                            stage.interventionWindow === 'late-golden' ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-500'
                          }`}>
                            💡 {stage.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 重新测评按钮 */}
      <div className="flex justify-center">
        <Link
          href="/tools/dementia-prevention"
          className="inline-block rounded-xl border border-[#C87941] bg-white px-6 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
        >
          重新测评
        </Link>
      </div>
    </div>
  );
}

// ── 主页面 ──
export default function DementiaPreventionPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [baselineAnswers, setBaselineAnswers] = useState<BaselineAnswers>({});
  const [lifestyleAnswers, setLifestyleAnswers] = useState<LifestyleAnswers>({});
  const [result, setResult] = useState<RiskResult | null>(null);

  const handleBaselineAnswer = (id: string, coefficient: number) => {
    setBaselineAnswers((prev) => ({ ...prev, [id]: coefficient }));
  };

  const handleLifestyleAnswer = (id: string, score: number) => {
    setLifestyleAnswers((prev) => ({ ...prev, [id]: score }));
  };

  const goToLifestyle = () => setPhase('lifestyle');

  const goToReport = () => {
    const r = calculateFullResult(baselineAnswers, lifestyleAnswers);
    setResult(r);
    setPhase('report');
  };

  // ── Intro 页面 ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#F5F0E8] pb-20">
        {/* 顶部导航 */}
        <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link href="/chapter/chapter-3" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
              ← 返回清楚交代
            </Link>
            <h1 className="text-sm font-bold text-[#4A3728]">预防痴呆 · 风险自测</h1>
            <div className="w-20" />
          </div>
        </nav>

        <main className="mx-auto max-w-2xl px-4 pt-10">
          <div className="space-y-10">
            {/* 标题区 */}
            <header className="text-center">
              <div className="mb-4 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
                Dementia Risk Assessment
              </div>
              <h2 className="text-3xl font-bold text-[#4A3728]">我不痴呆</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8A7E6A]">
                花 3 分钟，为你的大脑做一次「年检」。
              </p>
            </header>

            {/* 关键数据卡片 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 text-center">
                <div className="text-2xl font-bold text-[#C87941]">3秒</div>
                <p className="mt-1 text-xs text-[#8A7E6A]">全球每 3 秒新增一位 AD 患者</p>
              </div>
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 text-center">
                <div className="text-2xl font-bold text-[#C87941]">45%</div>
                <p className="mt-1 text-xs text-[#8A7E6A]">调整生活方式可降低 45% 风险</p>
              </div>
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 text-center">
                <div className="text-2xl font-bold text-[#C87941]">14项</div>
                <p className="mt-1 text-xs text-[#8A7E6A]">柳叶刀确认的可改变风险因素</p>
              </div>
            </div>

            {/* 流程说明 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#4A3728]">测评流程</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-xs font-bold text-[#C87941]">1</div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A3728]">不可改变的基准风险</p>
                    <p className="text-xs text-[#8A7E6A]">家族史与年龄（3 个问题）</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-xs font-bold text-[#C87941]">2</div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A3728]">可改变的生活方式</p>
                    <p className="text-xs text-[#8A7E6A]">生活习惯自测（7 个问题）</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-xs font-bold text-[#C87941]">3</div>
                  <div>
                    <p className="text-sm font-semibold text-[#4A3728]">生成综合报告</p>
                    <p className="text-xs text-[#8A7E6A]">风险评估 + 个性化行动指南 + 科普附录</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 开始按钮 */}
            <div className="text-center">
              <button
                onClick={() => setPhase('baseline')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C87941] px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#A85E2D] hover:shadow-lg"
              >
                开始测评
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="mt-3 text-[10px] text-[#B8A888]">
                所有回答仅用于本次评估，不会保存到服务器
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center">
          <p className="text-[10px] tracking-widest text-[#B8A888] uppercase">
            参考来源：柳叶刀 2024 · GDS 总体衰退量表
          </p>
        </footer>
      </div>
    );
  }

  // ── 测评阶段 ──
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-3" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">
            {phase === 'baseline' ? '第一步：基准风险' : phase === 'lifestyle' ? '第二步：生活方式' : '评估报告'}
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {phase === 'baseline' && (
          <BaselinePhase
            answers={baselineAnswers}
            onAnswer={handleBaselineAnswer}
            onNext={goToLifestyle}
          />
        )}

        {phase === 'lifestyle' && (
          <LifestylePhase
            answers={lifestyleAnswers}
            onAnswer={handleLifestyleAnswer}
            onNext={goToReport}
            onBack={() => setPhase('baseline')}
          />
        )}

        {phase === 'report' && result && <ReportPhase result={result} />}
      </main>
    </div>
  );
}
