'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  hobbies,
  categoryMeta,
  interestLevelOptions,
  DEFAULT_VISIBLE_COUNT,
  getHobbiesByCategory,
  type HobbyCategory,
  type InterestLevel,
} from '@/data/hobby-radar/hobbyData';
import { calculateRadar, getWeakestDimension, type RadarResult } from '@/data/hobby-radar/calculation';
import {
  getDimensionInterpretation,
  getInterestLevelDiagnosis,
  getPrescriptions,
} from '@/data/hobby-radar/reports';

// ── 阶段类型 ──
type Phase = 'intro' | 'select' | 'depth' | 'result';

// ── 进度条 ──
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

// ── 雷达图 SVG ──
function RadarChart({ dimensions }: { dimensions: { category: HobbyCategory; total: number }[] }) {
  const cx = 150, cy = 150, maxR = 120;
  // 三个顶点角度：上、右下、左下
  const angles = [-90, 30, 150];
  const catOrder: HobbyCategory[] = ['physical', 'creative', 'cognitive'];

  const getPoint = (angle: number, ratio: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + maxR * ratio * Math.cos(rad),
      y: cy + maxR * ratio * Math.sin(rad),
    };
  };

  // 背景网格（3层）
  const gridLevels = [0.33, 0.66, 1];
  const gridPolygons = gridLevels.map((level) => {
    const pts = angles.map((a) => getPoint(a, level));
    return pts.map((p) => `${p.x},${p.y}`).join(' ');
  });

  // 数据多边形
  const dataPoints = catOrder.map((cat, i) => {
    const dim = dimensions.find((d) => d.category === cat);
    const ratio = (dim?.total ?? 0) / 10;
    return getPoint(angles[i], ratio);
  });
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // 标签位置
  const labelPoints = angles.map((a) => getPoint(a, 1.2));

  return (
    <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[320px]">
      {/* 背景网格 */}
      {gridPolygons.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="#E8D9C2"
          strokeWidth="1"
          opacity={i === 2 ? 0.8 : 0.4}
        />
      ))}
      {/* 轴线 */}
      {angles.map((a, i) => {
        const p = getPoint(a, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#E8D9C2" strokeWidth="1" opacity="0.5" />;
      })}
      {/* 数据区域 */}
      <polygon
        points={dataPolygon}
        fill="rgba(200,121,65,0.15)"
        stroke="#C87941"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* 数据点 */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="#C87941" />
      ))}
      {/* 标签 */}
      {catOrder.map((cat, i) => {
        const meta = categoryMeta[cat];
        const lp = labelPoints[i];
        const dim = dimensions.find((d) => d.category === cat);
        return (
          <g key={cat}>
            <text
              x={lp.x}
              y={lp.y - 8}
              textAnchor="middle"
              className="text-[11px] font-bold"
              fill={meta.color}
            >
              {meta.label}
            </text>
            <text
              x={lp.x}
              y={lp.y + 8}
              textAnchor="middle"
              className="text-[10px]"
              fill="#8A7E6A"
            >
              {dim?.total.toFixed(1)}/10
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 自定义爱好输入组件 ──
function CustomHobbyInput({
  onAdd,
  color,
}: {
  onAdd: (label: string) => void;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-dashed px-3.5 py-1.5 text-sm transition-all hover:border-solid"
        style={{ borderColor: `${color}80`, color }}
      >
        + 添加我的爱好
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        placeholder="输入你的爱好..."
        maxLength={20}
        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-1.5 text-sm text-[#4A3728] outline-none focus:border-[#C87941] w-40"
        autoFocus
      />
      <button
        onClick={handleAdd}
        disabled={!value.trim()}
        className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-all disabled:opacity-40"
        style={{ backgroundColor: color }}
      >
        添加
      </button>
      <button
        onClick={() => { setOpen(false); setValue(''); }}
        className="text-xs text-[#8A7E6A] hover:text-[#4A3728]"
      >
        取消
      </button>
    </div>
  );
}

// ── 爱好选择阶段 ──
function HobbySelectPhase({
  selected,
  customHobbies,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  onNext,
}: {
  selected: Record<HobbyCategory, string[]>;
  customHobbies: Record<HobbyCategory, string[]>;
  onToggle: (cat: HobbyCategory, id: string) => void;
  onAddCustom: (cat: HobbyCategory, label: string) => void;
  onRemoveCustom: (cat: HobbyCategory, label: string) => void;
  onNext: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<HobbyCategory, boolean>>({
    physical: false,
    creative: false,
    cognitive: false,
  });

  const totalSelected = Object.values(selected).reduce((s, arr) => s + arr.length, 0);
  const totalCustom = Object.values(customHobbies).reduce((s, arr) => s + arr.length, 0);
  const categories: HobbyCategory[] = ['physical', 'creative', 'cognitive'];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第一步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">选择你的爱好</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          勾选你「近一个月内经常从事」的爱好，也可以在下方添加自己的爱好。以上选项仅供参考。
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-[#FAF8F3] px-4 py-2">
          <span className="text-xs text-[#8A7E6A]">已选择</span>
          <span className="text-sm font-bold text-[#C87941]">{totalSelected + totalCustom} 项</span>
        </div>

        <div className="mt-6 space-y-8">
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const catHobbies = getHobbiesByCategory(cat);
            const isExpanded = expanded[cat];
            const visible = isExpanded ? catHobbies : catHobbies.slice(0, DEFAULT_VISIBLE_COUNT);
            const catCustom = customHobbies[cat] ?? [];

            return (
              <div key={cat}>
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-sm font-bold text-[#4A3728]">{meta.label}</span>
                  <span className="text-xs text-[#8A7E6A]">（{meta.subtitle}）</span>
                  <span className="ml-auto text-xs text-[#C87941]">
                    已选 {(selected[cat] ?? []).length + catCustom.length}
                  </span>
                </div>

                {/* 预设选项 */}
                <div className="flex flex-wrap gap-2">
                  {visible.map((h) => {
                    const isSelected = (selected[cat] ?? []).includes(h.id);
                    return (
                      <button
                        key={h.id}
                        onClick={() => onToggle(cat, h.id)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                          isSelected
                            ? 'border-[#C87941] bg-[#FDF5EE] font-semibold text-[#4A3728]'
                            : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
                        }`}
                      >
                        {h.label}
                      </button>
                    );
                  })}

                  {/* 已添加的自定义爱好 */}
                  {catCustom.map((label) => (
                    <button
                      key={label}
                      onClick={() => onRemoveCustom(cat, label)}
                      className="flex items-center gap-1 rounded-full border border-[#C87941] bg-[#FDF5EE] px-3.5 py-1.5 text-sm font-semibold text-[#4A3728] transition-all"
                      title="点击移除"
                    >
                      {label}
                      <span className="text-[10px] text-[#C87941]">×</span>
                    </button>
                  ))}

                  {/* 添加自定义爱好 */}
                  <CustomHobbyInput
                    onAdd={(label) => onAddCustom(cat, label)}
                    color={meta.color}
                  />
                </div>

                {catHobbies.length > DEFAULT_VISIBLE_COUNT && (
                  <button
                    onClick={() => setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                    className="mt-2 text-xs text-[#C87941] hover:underline"
                  >
                    {isExpanded ? '收起' : `展开更多（还有 ${catHobbies.length - DEFAULT_VISIBLE_COUNT} 项）`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={totalSelected + totalCustom === 0}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          下一步：评估兴趣深度 →
        </button>
      </div>
    </div>
  );
}

// ── 兴趣深度评估阶段 ──
function DepthAssessmentPhase({
  selected,
  customHobbies,
  interestLevels,
  onSetLevel,
  onNext,
  onBack,
}: {
  selected: Record<HobbyCategory, string[]>;
  customHobbies: Record<HobbyCategory, string[]>;
  interestLevels: Record<string, InterestLevel>;
  onSetLevel: (hobbyId: string, level: InterestLevel) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  // 取所有已选爱好（预设 + 自定义）
  const allSelected = useMemo(() => {
    const result: { id: string; label: string; catLabel: string }[] = [];
    (['physical', 'creative', 'cognitive'] as HobbyCategory[]).forEach((cat) => {
      const catLabel = categoryMeta[cat].label;
      // 预设爱好
      (selected[cat] ?? []).forEach((id) => {
        const h = hobbies.find((x) => x.id === id);
        if (h) result.push({ id: h.id, label: h.label, catLabel });
      });
      // 自定义爱好
      (customHobbies[cat] ?? []).forEach((label) => {
        result.push({ id: `custom:${label}`, label, catLabel });
      });
    });
    return result;
  }, [selected, customHobbies]);

  const answeredCount = allSelected.filter((x) => interestLevels[x.id]).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第二步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">评估兴趣深度</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          对每个爱好选择最符合你状态的兴趣层级。这决定了你的「深度分」。
        </p>

        <ProgressBar current={answeredCount} total={allSelected.length} />

        <div className="mt-6 space-y-6">
          {allSelected.map(({ id, label, catLabel }) => {
            const currentLevel = interestLevels[id];
            return (
              <div key={id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-[#8A7E6A]">
                    {catLabel}
                  </span>
                  <span className="text-sm font-bold text-[#4A3728]">{label}</span>
                </div>
                <p className="mb-3 text-xs text-[#8A7E6A]">从事这个爱好时，你的主要动力和状态更接近：</p>
                <div className="space-y-2">
                  {interestLevelOptions.map((opt) => {
                    const isSelected = currentLevel === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onSetLevel(id, opt.value)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-[#C87941] bg-[#FDF5EE] shadow-sm'
                            : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50'
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            isSelected ? 'border-[#C87941] bg-[#C87941]' : 'border-[#C8B8A0] bg-white'
                          }`}
                        >
                          {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <span className={`text-sm ${isSelected ? 'font-semibold text-[#4A3728]' : 'text-[#5A5A5A]'}`}>
                            {opt.label}
                          </span>
                          <p className="mt-0.5 text-xs text-[#8A7E6A]">{opt.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
          disabled={answeredCount < allSelected.length}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          生成雷达图 →
        </button>
      </div>
    </div>
  );
}

// ── 结果报告阶段 ──
function ResultPhase({ result, interestLevels }: { result: RadarResult; interestLevels: Record<string, InterestLevel> }) {
  const weakest = getWeakestDimension(result.dimensions);
  const prescription = getPrescriptions(weakest.category);
  const diagnosis = getInterestLevelDiagnosis(interestLevels);
  const [showAllDims, setShowAllDims] = useState(false);

  return (
    <div className="space-y-8">
      {/* 报告头部 */}
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          爱好健康雷达
        </span>
        <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">你的专属兴趣雷达图</h3>
      </div>

      {/* 雷达图 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <RadarChart dimensions={result.dimensions} />
        <div className="mt-4 text-center">
          <span className="text-xs text-[#8A7E6A]">综合健康防护力</span>
          <div className="mt-1 text-3xl font-bold text-[#C87941]">{result.overallScore}<span className="text-base text-[#8A7E6A]">/10</span></div>
        </div>
      </div>

      {/* 健康画像 */}
      <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5">
        <h4 className="text-sm font-bold text-[#4A3728]">{result.profileName}</h4>
        <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{result.profileDescription}</p>
      </div>

      {/* 各维度详情（可折叠） */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white shadow-sm">
        <button
          onClick={() => setShowAllDims(!showAllDims)}
          className="flex w-full items-center justify-between p-5 text-left hover:bg-[#FAF8F3]"
        >
          <h4 className="text-sm font-bold text-[#4A3728]">各维度详细解读</h4>
          <svg
            className={`h-5 w-5 shrink-0 text-[#C87941] transition-transform ${showAllDims ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showAllDims && (
          <div className="space-y-4 border-t border-[#E8D9C2] px-5 pb-5 pt-4">
            {result.dimensions.map((d) => {
              const meta = categoryMeta[d.category];
              return (
                <div key={d.category} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span className="text-sm font-bold text-[#4A3728]">{meta.label}</span>
                      <span className="text-xs text-[#8A7E6A]">{meta.subtitle}</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: meta.color }}>{d.total}/10</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#5A5A5A]">{getDimensionInterpretation(d)}</p>
                  <div className="mt-2 flex gap-4 text-[10px] text-[#8A7E6A]">
                    <span>广度分：{d.breadthScore}（{d.hobbyCount}个爱好）</span>
                    <span>深度分：{d.depthScore.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 兴趣层级诊断 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <h4 className="text-sm font-bold text-[#4A3728]">兴趣层级诊断</h4>
        <p className="mt-2 text-sm leading-relaxed text-[#5A5A5A]">{diagnosis}</p>
      </div>

      {/* 爱好处方 */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h4 className="text-sm font-bold text-amber-800">个性化建议：{prescription.title}</h4>
        <p className="mt-1 text-xs text-amber-600">
          您当前最薄弱的维度是「{categoryMeta[weakest.category].label}」，以下建议可帮助你针对性提升：
        </p>
        <div className="mt-3 space-y-2">
          {prescription.steps.map((step, i) => (
            <div key={i} className="rounded-lg bg-white px-4 py-2 text-sm text-amber-700">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* 认知风险联动 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
        <h4 className="text-sm font-bold text-[#4A3728]">进一步了解你的大脑健康</h4>
        <p className="mt-1 text-xs text-[#8A7E6A]">
          爱好组合只是认知健康的一个维度。完成痴呆风险自测，全面了解你的大脑健康状况。
        </p>
        <Link
          href="/tools/dementia-prevention"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#C87941] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#A85E2D]"
        >
          开始痴呆风险自测
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>

      {/* 重新测评 */}
      <div className="flex justify-center">
        <Link
          href="/tools/hobby-radar"
          className="inline-block rounded-xl border border-[#C87941] bg-white px-6 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
        >
          重新测评
        </Link>
      </div>
    </div>
  );
}

// ── 主页面 ──
export default function HobbyRadarPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [selected, setSelected] = useState<Record<HobbyCategory, string[]>>({
    physical: [],
    creative: [],
    cognitive: [],
  });
  const [customHobbies, setCustomHobbies] = useState<Record<HobbyCategory, string[]>>({
    physical: [],
    creative: [],
    cognitive: [],
  });
  const [interestLevels, setInterestLevels] = useState<Record<string, InterestLevel>>({});
  const [result, setResult] = useState<RadarResult | null>(null);

  const handleToggle = (cat: HobbyCategory, id: string) => {
    setSelected((prev) => {
      const list = prev[cat] ?? [];
      const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
      return { ...prev, [cat]: next };
    });
  };

  const handleAddCustom = (cat: HobbyCategory, label: string) => {
    setCustomHobbies((prev) => {
      const list = prev[cat] ?? [];
      if (list.includes(label)) return prev;
      return { ...prev, [cat]: [...list, label] };
    });
    // 自定义爱好也自动选中
    setSelected((prev) => {
      const id = `custom:${label}`;
      const list = prev[cat] ?? [];
      if (list.includes(id)) return prev;
      return { ...prev, [cat]: [...list, id] };
    });
  };

  const handleRemoveCustom = (cat: HobbyCategory, label: string) => {
    const id = `custom:${label}`;
    setCustomHobbies((prev) => ({
      ...prev,
      [cat]: (prev[cat] ?? []).filter((l) => l !== label),
    }));
    setSelected((prev) => ({
      ...prev,
      [cat]: (prev[cat] ?? []).filter((x) => x !== id),
    }));
    setInterestLevels((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSetLevel = (hobbyId: string, level: InterestLevel) => {
    setInterestLevels((prev) => ({ ...prev, [hobbyId]: level }));
  };

  const goToDepth = () => setPhase('depth');
  const goToResult = () => {
    const r = calculateRadar(selected, interestLevels);
    setResult(r);
    setPhase('result');
  };

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#F5F0E8] pb-20">
        <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
          <div className="mx-auto flex max-w-3xl items-center justify-between">
            <Link href="/chapter/chapter-2" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
              ← 返回积极生活
            </Link>
            <h1 className="text-sm font-bold text-[#4A3728]">爱好健康雷达</h1>
            <div className="w-20" />
          </div>
        </nav>

        <main className="mx-auto max-w-2xl px-4 pt-10">
          <div className="space-y-10">
            <header className="text-center">
              <div className="mb-4 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
                Hobby Health Radar
              </div>
              <h2 className="text-3xl font-bold text-[#4A3728]">我的爱好健康雷达</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#8A7E6A]">
                了解你的爱好组合如何守护身心健康，发现盲点，获得个性化优化建议。
              </p>
            </header>

            {/* 三层防护理论 */}
            <div className="grid gap-4 sm:grid-cols-3">
              {(['physical', 'creative', 'cognitive'] as HobbyCategory[]).map((cat) => {
                const meta = categoryMeta[cat];
                return (
                  <div key={cat} className="rounded-xl border border-[#E8D9C2] bg-white p-5 text-center">
                    <div
                      className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                    >
                      {cat === 'physical' ? '🏃' : cat === 'creative' ? '🎨' : '🧠'}
                    </div>
                    <h3 className="text-base font-bold" style={{ color: meta.color }}>{meta.label}</h3>
                    <p className="mt-1 text-xs text-[#8A7E6A]">{meta.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-[#5A5A5A]">{meta.healthValue}</p>
                  </div>
                );
              })}
            </div>

            {/* 兴趣金字塔 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#4A3728]">兴趣的三个层级</h3>
              <div className="space-y-3">
                {[
                  { level: '志趣兴趣', desc: '与个人价值观绑定，最稳定的内控力', color: '#C87941' },
                  { level: '自觉兴趣', desc: '主动探索学习，有明确的进步目标', color: '#D4A76A' },
                  { level: '感官兴趣', desc: '追求即时快乐，放松和打发时间', color: '#E8D9C2' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3 text-center"
                    style={{
                      backgroundColor: `${item.color}15`,
                      border: `1px solid ${item.color}40`,
                      marginLeft: `${i * 20}px`,
                      marginRight: `${i * 20}px`,
                    }}
                  >
                    <span className="text-sm font-bold text-[#4A3728]">{item.level}</span>
                    <p className="mt-0.5 text-xs text-[#5A5A5A]">{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-[#8A7E6A]">
                兴趣层级越高，对健康的守护力越强
              </p>
            </div>

            {/* 流程说明 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#4A3728]">测评流程</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: '选择爱好', desc: '勾选你近一个月内经常从事的爱好' },
                  { step: '2', title: '评估深度', desc: '对主要爱好评估兴趣层级' },
                  { step: '3', title: '生成报告', desc: '雷达图 + 健康画像 + 个性化建议' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDF5EE] text-xs font-bold text-[#C87941]">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#4A3728]">{item.title}</p>
                      <p className="text-xs text-[#8A7E6A]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 开始按钮 */}
            <div className="text-center">
              <button
                onClick={() => setPhase('select')}
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
            参考来源：Mark Travers (2025) · 柳叶刀 2024 · 兴趣三级进化模型
          </p>
        </footer>
      </div>
    );
  }

  // ── 测评阶段 ──
  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-2" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回积极生活
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">
            {phase === 'select' ? '第一步：选择爱好' : phase === 'depth' ? '第二步：评估深度' : '健康雷达报告'}
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {phase === 'select' && (
          <HobbySelectPhase
            selected={selected}
            customHobbies={customHobbies}
            onToggle={handleToggle}
            onAddCustom={handleAddCustom}
            onRemoveCustom={handleRemoveCustom}
            onNext={goToDepth}
          />
        )}

        {phase === 'depth' && (
          <DepthAssessmentPhase
            selected={selected}
            customHobbies={customHobbies}
            interestLevels={interestLevels}
            onSetLevel={handleSetLevel}
            onNext={goToResult}
            onBack={() => setPhase('select')}
          />
        )}

        {phase === 'result' && result && (
          <ResultPhase result={result} interestLevels={interestLevels} />
        )}
      </main>
    </div>
  );
}
