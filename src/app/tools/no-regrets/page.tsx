'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  dimensions,
  dimensionAdvice,
  getAgeStage,
  type Dimension,
} from '@/data/no-regrets/assessmentData';
import {
  calculateResult,
  getLifeTypeDef,
  getDimensionAdvice,
  type AssessmentResult,
} from '@/data/no-regrets/calculation';

// ── 阶段类型 ──
type Phase = 'intro' | 'questionnaire' | 'report';

// ── 滑动条组件 ──
function SliderInput({
  dimension,
  value,
  onChange,
}: {
  dimension: Dimension;
  value: number;
  onChange: (v: number) => void;
}) {
  const getColor = (v: number) => {
    if (v < 30) return '#DC2626';
    if (v < 50) return '#D97706';
    if (v < 70) return '#C87941';
    return '#059669';
  };

  return (
    <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-bold text-[#4A3728]">{dimension.label}</span>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color: getColor(value) }}
        >
          {value}
        </span>
      </div>
      <p className="mb-4 text-sm text-[#5A5A5A]">{dimension.question}</p>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#C87941] cursor-pointer"
      />
      <div className="mt-1 flex justify-between text-[10px] text-[#8A7E6A]">
        <span>完全不符合</span>
        <span>完全符合</span>
      </div>
      <p className="mt-2 text-xs text-[#B8A888]">{dimension.source}</p>
    </div>
  );
}

// ── 雷达图 SVG（7 维度）──
function RadarChart7({ scores }: { scores: Record<string, number> }) {
  const cx = 150, cy = 150, maxR = 120;
  const count = dimensions.length;
  const angles = dimensions.map((_, i) => (360 / count) * i - 90);

  const getPoint = (angle: number, ratio: number) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + maxR * ratio * Math.cos(rad), y: cy + maxR * ratio * Math.sin(rad) };
  };

  const gridLevels = [0.33, 0.66, 1];
  const gridPolygons = gridLevels.map((level) => {
    const pts = angles.map((a) => getPoint(a, level));
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  const dataPoints = dimensions.map((dim, i) => {
    const ratio = (scores[dim.id] ?? 0) / 100;
    return getPoint(angles[i], ratio);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const labelPoints = angles.map((a) => getPoint(a, 1.18));

  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]">
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#E8D9C2" strokeWidth="1" opacity={i === 2 ? 0.8 : 0.4} />
      ))}
      {angles.map((a, i) => {
        const p = getPoint(a, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E8D9C2" strokeWidth="1" opacity="0.5" />;
      })}
      <polygon points={dataPolygon} fill="rgba(200,121,65,0.15)" stroke="#C87941" strokeWidth="2" strokeLinejoin="round" />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#C87941" />
      ))}
      {dimensions.map((dim, i) => {
        const lp = labelPoints[i];
        return (
          <text key={dim.id} x={lp.x} y={lp.y + 3} textAnchor="middle" className="text-[9px] font-bold" fill="#4A3728">
            {dim.label}
          </text>
        );
      })}
    </svg>
  );
}

// ── 问卷阶段 ──
function QuestionnairePhase({
  scores,
  age,
  onScoreChange,
  onAgeChange,
  onGenerate,
  onBack,
}: {
  scores: Record<string, number>;
  age: number;
  onScoreChange: (dimId: string, value: number) => void;
  onAgeChange: (age: number) => void;
  onGenerate: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          基本信息
        </span>
        <p className="mt-2 text-sm text-[#8A7E6a]">你的年龄用于计算「紧迫系数」，不同生命阶段有不同的侧重。</p>
        <div className="mt-3 flex items-center gap-4">
          <label className="text-sm font-medium text-[#4A3728]">你的年龄</label>
          <input
            type="number"
            min={18}
            max={120}
            value={age || ''}
            onChange={(e) => onAgeChange(Number(e.target.value))}
            placeholder="例如：35"
            className="w-24 rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
          />
          {age > 0 && (
            <span className="text-xs text-[#8A7E6A]">当前阶段：{getAgeStage(age)}</span>
          )}
        </div>
      </div>

      {dimensions.map((dim) => (
        <SliderInput
          key={dim.id}
          dimension={dim}
          value={scores[dim.id] ?? 50}
          onChange={(v) => onScoreChange(dim.id, v)}
        />
      ))}

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="rounded-lg border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-medium text-[#4A3728] transition-all hover:border-[#C87941]"
        >
          ← 返回介绍
        </button>
        <button
          onClick={onGenerate}
          disabled={age < 18}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          生成我的生命自洽报告 →
        </button>
      </div>
    </div>
  );
}

// ── 报告阶段 ──
function ReportPhase({ result }: { result: AssessmentResult }) {
  const typeDef = getLifeTypeDef(result.lifeType);

  const getScoreColor = (v: number) => {
    if (v < 40) return '#DC2626';
    if (v < 60) return '#D97706';
    if (v < 75) return '#C87941';
    return '#059669';
  };

  return (
    <div className="space-y-8">
      {/* 头部 */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          生命自洽报告
        </span>
        <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">你的生命自洽指数</h3>
      </div>

      {/* 核心指数 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4" style={{ borderColor: getScoreColor(result.selfAlignIndex) }}>
          <span className="text-4xl font-bold" style={{ color: getScoreColor(result.selfAlignIndex) }}>
            {result.selfAlignIndex}
          </span>
        </div>
        <p className="mt-2 text-xs text-[#8A7E6A]">生命自洽指数（满分100）</p>
        <div className="mt-3 flex justify-center gap-6 text-center">
          <div>
            <div className="text-lg font-bold text-[#C87941]">{result.foundationScore}</div>
            <div className="text-[10px] text-[#8A7E6A]">健康根基</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#C87941]">{result.relationScore}</div>
            <div className="text-[10px] text-[#8A7E6A]">关系质量</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[#C87941]">{result.selfScore}</div>
            <div className="text-[10px] text-[#8A7E6A]">自我实现</div>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-[#B8A888]">
          紧迫系数：{result.urgencyFactor}（{getAgeStage(result.urgencyFactor === 1.2 ? 28 : result.urgencyFactor === 1.0 ? 42 : 55)}）
        </p>
      </div>

      {/* 雷达图 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">生命之花 · 七维全景</h4>
        <RadarChart7 scores={result.scores} />
      </div>

      {/* 类型卡片 */}
      <div className="rounded-xl border-2 p-6" style={{ borderColor: `${typeDef.color}40`, backgroundColor: `${typeDef.color}08` }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {result.lifeType === 'A' ? '🔥' : result.lifeType === 'B' ? '🎭' : result.lifeType === 'C' ? '🏔️' : result.lifeType === 'D' ? '🧭' : '✨'}
          </span>
          <div>
            <h4 className="text-base font-bold" style={{ color: typeDef.color }}>
              类型{typeDef.id}：{typeDef.name}
            </h4>
            <p className="text-xs text-[#8A7E6A]">{typeDef.subtitle}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#5A5A5A]">{typeDef.description}</p>
      </div>

      {/* 改善建议 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">你的改善路线图</h4>
        <div className="space-y-4">
          <div className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
            <h5 className="text-sm font-bold text-[#C87941]">{typeDef.advice.phase1.title}</h5>
            <div className="mt-2 space-y-1.5">
              {typeDef.advice.phase1.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-sm text-[#5A5A5A]">
                  <span className="shrink-0 font-bold text-[#C87941]">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
            <h5 className="text-sm font-bold text-[#C87941]">{typeDef.advice.phase2.title}</h5>
            <div className="mt-2 space-y-1.5">
              {typeDef.advice.phase2.steps.map((step, i) => (
                <div key={i} className="flex gap-2 text-sm text-[#5A5A5A]">
                  <span className="shrink-0 font-bold text-[#C87941]">{i + 1}.</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 分维度建议 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">各维度详细解读</h4>
        <div className="space-y-3">
          {dimensions.map((dim) => {
            const score = result.scores[dim.id] ?? 0;
            return (
              <div key={dim.id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#4A3728]">{dim.label}</span>
                  <span className="text-lg font-bold" style={{ color: getScoreColor(score) }}>{score}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#5A5A5A]">
                  {getDimensionAdvice(dim.id, score, dimensionAdvice)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 核心提示 */}
      <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5 text-center">
        <p className="text-sm font-medium leading-relaxed text-[#4A3728]">
          最好的告别，始于最好的活着。这面镜子不是为了让你焦虑，而是为了让你看见——还有时间，还有机会。
        </p>
      </div>

      {/* 重新测评 */}
      <div className="flex justify-center">
        <Link
          href="/tools/no-regrets"
          className="inline-block rounded-xl border border-[#C87941] bg-white px-6 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
        >
          重新评估
        </Link>
      </div>
    </div>
  );
}

// ── 主页面 ──
export default function NoRegretsPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    dimensions.forEach((d) => { init[d.id] = 50; });
    return init;
  });
  const [age, setAge] = useState<number>(0);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleScoreChange = (dimId: string, value: number) => {
    setScores((prev) => ({ ...prev, [dimId]: value }));
  };

  const handleGenerate = () => {
    const r = calculateResult(scores, age);
    setResult(r);
    setPhase('report');
  };

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#F5F0E8] pb-20">
        <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link href="/chapter/chapter-4" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
              ← 返回好好告别
            </Link>
            <h1 className="text-sm font-bold text-[#4A3728]">不留遗憾</h1>
            <div className="w-20" />
          </div>
        </nav>

        <main className="mx-auto max-w-2xl px-4 pt-10">
          <div className="space-y-10">
            <header className="text-center">
              <div className="mb-4 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
                No Regrets Life Assessment
              </div>
              <h2 className="text-3xl font-bold text-[#4A3728]">【不留遗憾】生命自洽评估</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8A7E6A]">
                融合东西方临终关怀研究，从7个维度评估你的生命质量，<br className="hidden sm:block" />
                生成个性化的「生命自洽指数」和改善路线图。
              </p>
            </header>

            {/* 理论来源 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
                <h3 className="text-sm font-bold text-[#4A3728]">临终五大遗憾</h3>
                <p className="mt-1 text-xs text-[#8A7E6A]">Bronnie Ware · 澳大利亚</p>
                <ul className="mt-3 space-y-1 text-xs text-[#5A5A5A]">
                  <li>• 没有勇气过自己想要的生活</li>
                  <li>• 花太多时间在工作上</li>
                  <li>• 没有勇气表达自己的感受</li>
                  <li>• 没有和朋友保持联系</li>
                  <li>• 没有让自己更快乐</li>
                </ul>
              </div>
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
                <h3 className="text-sm font-bold text-[#4A3728]">中国老人三大后悔</h3>
                <p className="mt-1 text-xs text-[#8A7E6A]">复旦大学调研</p>
                <ul className="mt-3 space-y-1 text-xs text-[#5A5A5A]">
                  <li>• 没有照顾好自己的身体</li>
                  <li>• 没有好好珍惜身边的人</li>
                  <li>• 没有追求真正热爱的事</li>
                </ul>
              </div>
            </div>

            {/* 7 维度预览 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#4A3728]">评估的七大维度</h3>
              <div className="space-y-2">
                {dimensions.map((dim, i) => (
                  <div key={dim.id} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 font-bold text-[#C87941]">{i + 1}.</span>
                    <div>
                      <span className="font-semibold text-[#4A3728]">{dim.label}</span>
                      <span className="ml-2 text-xs text-[#8A7E6A]">{dim.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 评分说明 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-[#4A3728]">生命自洽指数的计算</h3>
              <div className="space-y-2 text-sm text-[#5A5A5A]">
                <p>指数 = （健康根基 × 40% + 关系质量 × 30% + 自我实现 × 30%）× 紧迫系数</p>
                <p className="text-xs text-[#8A7E6A]">
                  紧迫系数：20-35岁=1.2（侧重自我探索）· 36-50岁=1.0（侧重平衡调整）· 51岁+=0.9（侧重意义整合）
                </p>
              </div>
            </div>

            {/* 开始按钮 */}
            <div className="text-center">
              <button
                onClick={() => setPhase('questionnaire')}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C87941] px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:bg-[#A85E2D] hover:shadow-lg"
              >
                开始评估
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="mt-3 text-[10px] text-[#B8A888]">
                约需 3-5 分钟 · 所有数据仅用于本次评估，不会保存
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-16 text-center">
          <p className="text-[10px] tracking-widest text-[#B8A888] uppercase">
            参考来源：Bronnie Ware · 复旦大学调研 · 柳叶刀 2024
          </p>
        </footer>
      </div>
    );
  }

  // ── 问卷 / 报告 ──
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-4" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回好好告别
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">
            {phase === 'questionnaire' ? '生命自洽评估' : '你的生命自洽报告'}
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {phase === 'questionnaire' && (
          <QuestionnairePhase
            scores={scores}
            age={age}
            onScoreChange={handleScoreChange}
            onAgeChange={setAge}
            onGenerate={handleGenerate}
            onBack={() => setPhase('intro')}
          />
        )}

        {phase === 'report' && result && (
          <ReportPhase result={result} />
        )}
      </main>
    </div>
  );
}
