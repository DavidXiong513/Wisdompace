'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  responsibilities,
  categoryMeta,
  DEFAULT_VISIBLE_COUNT,
  getResponsibilitiesByCategory,
  urgencyOptions,
  importanceOptions,
  quadrantDefs,
  getQuadrant,
  type ResponsibilityCategory,
  type UrgencyLevel,
  type ImportanceLevel,
  type Quadrant,
} from '@/data/responsibility-list/responsibilityData';
import { generateReport, type ReportData, type HandoverInfo } from '@/data/responsibility-list/calculation';

// ── 阶段类型 ──
type Phase = 'select' | 'rate' | 'handover' | 'report';

// ── 自定义责任输入 ──
function CustomInput({
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
        + 添加我的责任
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
        placeholder="输入一项责任..."
        maxLength={30}
        className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-1.5 text-sm text-[#4A3728] outline-none focus:border-[#C87941] w-44"
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

// ── 进度条 ──
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#E8D9C2]">
        <div
          className="h-full rounded-full bg-[#C87941] transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="shrink-0 text-xs font-medium text-[#8A7E6A]">{current}/{total}</span>
    </div>
  );
}

// ── 四象限矩阵 SVG ──
function QuadrantMatrix({ items }: { items: ReportData['ratedItems'] }) {
  const size = 280;
  const pad = 40;
  const inner = size - pad * 2;
  const half = inner / 2;
  const quadrants: { q: Quadrant; x: number; y: number }[] = [
    { q: 'do-first', x: pad + half / 2, y: pad + half / 2 },
    { q: 'schedule', x: pad + half + half / 2, y: pad + half / 2 },
    { q: 'delegate', x: pad + half / 2, y: pad + half + half / 2 },
    { q: 'eliminate', x: pad + half + half / 2, y: pad + half + half / 2 },
  ];

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[300px]">
      {/* 背景四格 */}
      <rect x={pad} y={pad} width={half} height={half} fill="#FEF2F2" rx="4" />
      <rect x={pad + half} y={pad} width={half} height={half} fill="#EFF6FF" rx="4" />
      <rect x={pad} y={pad + half} width={half} height={half} fill="#FFFBEB" rx="4" />
      <rect x={pad + half} y={pad + half} width={half} height={half} fill="#F3F4F6" rx="4" />

      {/* 轴线 */}
      <line x1={pad + half} y1={pad} x2={pad + half} y2={pad + inner} stroke="#E8D9C2" strokeWidth="1" />
      <line x1={pad} y1={pad + half} x2={pad + inner} y2={pad + half} stroke="#E8D9C2" strokeWidth="1" />

      {/* 轴标签 */}
      <text x={pad + half} y={pad - 8} textAnchor="middle" className="text-[9px] font-bold" fill="#8A7E6A">重要</text>
      <text x={pad + half} y={pad + inner + 16} textAnchor="middle" className="text-[9px] font-bold" fill="#8A7E6A">不重要</text>
      <text x={pad - 8} y={pad + half} textAnchor="middle" className="text-[9px] font-bold" fill="#8A7E6A" transform={`rotate(-90, ${pad - 8}, ${pad + half})`}>紧急</text>
      <text x={pad + inner + 16} y={pad + half} textAnchor="middle" className="text-[9px] font-bold" fill="#8A7E6A" transform={`rotate(90, ${pad + inner + 16}, ${pad + half})`}>不紧急</text>

      {/* 象限计数 */}
      {quadrants.map(({ q, x, y }) => {
        const count = items.filter((i) => i.quadrant === q).length;
        const def = quadrantDefs[q];
        return (
          <g key={q}>
            <circle cx={x} cy={y} r="16" fill={def.color} opacity="0.15" />
            <text x={x} y={y + 4} textAnchor="middle" className="text-[12px] font-bold" fill={def.color}>
              {count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── 阶段一：责任选择 ──
function SelectPhase({
  selected,
  customItems,
  customCategories,
  onToggle,
  onAddCustom,
  onRemoveCustom,
  onNext,
}: {
  selected: string[];
  customItems: string[];
  customCategories: Record<string, ResponsibilityCategory>;
  onToggle: (id: string) => void;
  onAddCustom: (cat: ResponsibilityCategory, label: string) => void;
  onRemoveCustom: (id: string) => void;
  onNext: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const categories: ResponsibilityCategory[] = ['work', 'family', 'grandparent', 'social', 'self'];

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第一步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">梳理你的责任</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          勾选你目前承担的责任，也可以在每个分类下添加自己的责任项。这些选项仅供参考。
        </p>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-[#FAF8F3] px-4 py-2">
          <span className="text-xs text-[#8A7E6A]">已选择</span>
          <span className="text-sm font-bold text-[#C87941]">{selected.length} 项</span>
        </div>

        <div className="mt-6 space-y-8">
          {categories.map((cat) => {
            const meta = categoryMeta[cat];
            const catItems = getResponsibilitiesByCategory(cat);
            const isExpanded = expanded[cat];
            const visible = isExpanded ? catItems : catItems.slice(0, DEFAULT_VISIBLE_COUNT);
            const catCustom = customItems.filter((id) => customCategories[id] === cat);

            return (
              <div key={cat}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-sm font-bold text-[#4A3728]">{meta.label}</span>
                  <span className="text-xs text-[#8A7E6A]">（{meta.subtitle}）</span>
                  <span className="ml-auto text-xs text-[#C87941]">
                    已选 {selected.filter((id) => {
                      const isPreset = responsibilities.find((r) => r.id === id && r.category === cat);
                      const isCustom = customCategories[id] === cat;
                      return isPreset || isCustom;
                    }).length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {visible.map((r) => {
                    const isSelected = selected.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        onClick={() => onToggle(r.id)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                          isSelected
                            ? 'border-[#C87941] bg-[#FDF5EE] font-semibold text-[#4A3728]'
                            : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
                        }`}
                      >
                        {r.label}
                      </button>
                    );
                  })}

                  {catCustom.map((id) => (
                    <button
                      key={id}
                      onClick={() => onRemoveCustom(id)}
                      className="flex items-center gap-1 rounded-full border border-[#C87941] bg-[#FDF5EE] px-3.5 py-1.5 text-sm font-semibold text-[#4A3728] transition-all"
                      title="点击移除"
                    >
                      {id.replace('custom:', '')}
                      <span className="text-[10px] text-[#C87941]">×</span>
                    </button>
                  ))}

                  <CustomInput
                    onAdd={(label) => onAddCustom(cat, label)}
                    color={meta.color}
                  />
                </div>

                {catItems.length > DEFAULT_VISIBLE_COUNT && (
                  <button
                    onClick={() => setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }))}
                    className="mt-2 text-xs text-[#C87941] hover:underline"
                  >
                    {isExpanded ? '收起' : `展开更多（还有 ${catItems.length - DEFAULT_VISIBLE_COUNT} 项）`}
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
          disabled={selected.length === 0}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          下一步：评估优先级 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段二：紧急重要度评估 ──
function RatePhase({
  selected,
  labels,
  ratings,
  onRate,
  onNext,
  onBack,
}: {
  selected: string[];
  labels: Record<string, string>;
  ratings: Record<string, { urgency: UrgencyLevel; importance: ImportanceLevel }>;
  onRate: (id: string, urgency: UrgencyLevel, importance: ImportanceLevel) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const ratedCount = selected.filter((id) => ratings[id]).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第二步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">评估优先级</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          对每项责任评估紧急度和重要度，帮助你理清轻重缓急。
        </p>

        <ProgressBar current={ratedCount} total={selected.length} />

        <div className="mt-6 space-y-5">
          {selected.map((id) => {
            const label = labels[id] ?? id;
            const current = ratings[id];
            return (
              <div key={id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <p className="mb-3 text-sm font-bold text-[#4A3728]">{label}</p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {/* 紧急度 */}
                  <div className="col-span-2 sm:col-span-2">
                    <p className="mb-1.5 text-xs text-[#8A7E6A]">紧急程度</p>
                    <div className="flex gap-2">
                      {urgencyOptions.map((opt) => {
                        const isActive = current?.urgency === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => onRate(id, opt.value, current?.importance ?? 'important')}
                            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              isActive
                                ? 'border-[#C87941] bg-[#FDF5EE] text-[#4A3728]'
                                : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 重要度 */}
                  <div className="col-span-2 sm:col-span-2">
                    <p className="mb-1.5 text-xs text-[#8A7E6A]">重要程度</p>
                    <div className="flex gap-2">
                      {importanceOptions.map((opt) => {
                        const isActive = current?.importance === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => onRate(id, current?.urgency ?? 'urgent', opt.value)}
                            className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                              isActive
                                ? 'border-[#C87941] bg-[#FDF5EE] text-[#4A3728]'
                                : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {current && (
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: quadrantDefs[getQuadrant(current.urgency, current.importance)].color }}
                    >
                      {quadrantDefs[getQuadrant(current.urgency, current.importance)].label}
                    </span>
                  </div>
                )}
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
          disabled={ratedCount < selected.length}
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
        >
          下一步：交接思考 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段三：交接思考 ──
function HandoverPhase({
  selected,
  labels,
  handovers,
  onUpdate,
  onNext,
  onBack,
}: {
  selected: string[];
  labels: Record<string, string>;
  handovers: Record<string, HandoverInfo>;
  onUpdate: (id: string, field: keyof HandoverInfo, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const filledCount = selected.filter(
    (id) => handovers[id]?.successor || handovers[id]?.notes
  ).length;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          第三步
        </span>
        <h3 className="mt-2 text-lg font-bold text-[#4A3728]">交接思考</h3>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          如果你无法继续承担这些责任，谁来接替？需要交代什么关键信息？不必每项都填，先从最重要的开始。
        </p>

        <ProgressBar current={filledCount} total={selected.length} />

        <div className="mt-6 space-y-5">
          {selected.map((id) => {
            const label = labels[id] ?? id;
            const hw = handovers[id] ?? { successor: '', notes: '' };
            return (
              <div key={id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-4">
                <p className="mb-3 text-sm font-bold text-[#4A3728]">{label}</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs text-[#8A7E6A]">如果无法继续，谁可以接替？</label>
                    <input
                      type="text"
                      value={hw.successor}
                      onChange={(e) => onUpdate(id, 'successor', e.target.value)}
                      placeholder="例如：配偶、长子、合伙人..."
                      className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-[#8A7E6A]">交接时需要交代的关键信息</label>
                    <textarea
                      value={hw.notes}
                      onChange={(e) => onUpdate(id, 'notes', e.target.value)}
                      placeholder="例如：银行账户信息、合同存放位置、联系人电话..."
                      rows={2}
                      className="w-full rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941] resize-none"
                    />
                  </div>
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
          className="rounded-xl bg-[#C87941] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#A85E2D]"
        >
          生成责任清单报告 →
        </button>
      </div>
    </div>
  );
}

// ── 阶段四：报告 ──
function ReportPhase({ report }: { report: ReportData }) {
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <span className="inline-block rounded-full bg-[#FDF5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          责任清单报告
        </span>
        <h3 className="mt-3 text-2xl font-bold text-[#4A3728]">我的人生责任清单</h3>
        <p className="mt-2 text-sm text-[#8A7E6A]">
          共梳理 {report.ratedItems.length} 项责任
        </p>
      </div>

      {/* 四象限矩阵 */}
      <div className="rounded-xl border border-[#E8D9C2] bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-[#4A3728]">优先级矩阵</h4>
        <QuadrantMatrix items={report.ratedItems} />
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['do-first', 'schedule', 'delegate', 'eliminate'] as Quadrant[]).map((q) => {
            const def = quadrantDefs[q];
            const count = report.quadrantSummary.find((s) => s.quadrant === q)?.count ?? 0;
            return (
              <div key={q} className="rounded-lg p-2 text-center" style={{ backgroundColor: `${def.color}10` }}>
                <div className="text-lg font-bold" style={{ color: def.color }}>{count}</div>
                <div className="text-[10px] font-medium" style={{ color: def.color }}>{def.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 分类汇总 */}
      {report.categorySummary.filter((s) => s.count > 0).map((catSum) => {
        const meta = categoryMeta[catSum.category];
        return (
          <div key={catSum.category} className="rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{meta.icon}</span>
              <h4 className="text-sm font-bold text-[#4A3728]">{meta.label}</h4>
              <span className="rounded-full bg-[#F5F0E8] px-2 py-0.5 text-[10px] font-medium text-[#8A7E6A]">
                {catSum.count} 项
              </span>
            </div>
            <div className="space-y-2">
              {catSum.items.map((item) => {
                const hw = report.handovers[item.id];
                const qDef = quadrantDefs[item.quadrant];
                return (
                  <div key={item.id} className="rounded-lg border border-[#E8D9C2] bg-[#FAF8F3] p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: qDef.color }}
                      >
                        {qDef.label}
                      </span>
                      <span className="text-sm font-semibold text-[#4A3728]">{item.label}</span>
                    </div>
                    {hw && (hw.successor || hw.notes) && (
                      <div className="mt-2 space-y-1 text-xs text-[#5A5A5A]">
                        {hw.successor && <p>接替人：{hw.successor}</p>}
                        {hw.notes && <p>交接信息：{hw.notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 核心提示 */}
      <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5 text-center">
        <p className="text-sm font-medium leading-relaxed text-[#4A3728]">
          这份清单不是终点，而是一个起点。定期回顾和更新，让每一份责任都有着落。
        </p>
      </div>

      {/* 重新测评 */}
      <div className="flex justify-center">
        <Link
          href="/tools/responsibility-list"
          className="inline-block rounded-xl border border-[#C87941] bg-white px-6 py-3 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
        >
          重新梳理
        </Link>
      </div>
    </div>
  );
}

// ── 主页面 ──
export default function ResponsibilityListPage() {
  const [phase, setPhase] = useState<Phase>('select');
  const [selected, setSelected] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<Record<string, ResponsibilityCategory>>({});
  const [ratings, setRatings] = useState<Record<string, { urgency: UrgencyLevel; importance: ImportanceLevel }>>({});
  const [handovers, setHandovers] = useState<Record<string, HandoverInfo>>({});
  const [report, setReport] = useState<ReportData | null>(null);

  // 构建 id→label 映射
  const labels = useMemo(() => {
    const map: Record<string, string> = {};
    responsibilities.forEach((r) => { map[r.id] = r.label; });
    customItems.forEach((id) => { map[id] = id.replace('custom:', ''); });
    return map;
  }, [customItems]);

  // 构建 id→category 映射
  const categories = useMemo(() => {
    const map: Record<string, ResponsibilityCategory> = {};
    responsibilities.forEach((r) => { map[r.id] = r.category; });
    Object.assign(map, customCategories);
    return map;
  }, [customCategories]);

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAddCustom = (cat: ResponsibilityCategory, label: string) => {
    const id = `custom:${label}`;
    if (customItems.includes(id)) return;
    setCustomItems((prev) => [...prev, id]);
    setCustomCategories((prev) => ({ ...prev, [id]: cat }));
    setSelected((prev) => [...prev, id]);
  };

  const handleRemoveCustom = (id: string) => {
    setCustomItems((prev) => prev.filter((x) => x !== id));
    setCustomCategories((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setSelected((prev) => prev.filter((x) => x !== id));
    setRatings((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setHandovers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleRate = (id: string, urgency: UrgencyLevel, importance: ImportanceLevel) => {
    setRatings((prev) => ({ ...prev, [id]: { urgency, importance } }));
  };

  const handleHandoverUpdate = (id: string, field: keyof HandoverInfo, value: string) => {
    setHandovers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value, successor: prev[id]?.successor ?? '', notes: prev[id]?.notes ?? '' },
    }));
  };

  const goToRate = () => setPhase('rate');
  const goToHandover = () => setPhase('handover');
  const goToReport = () => {
    const r = generateReport(selected, labels, categories, ratings, handovers);
    setReport(r);
    setPhase('report');
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-3" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回清楚交代
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">
            {phase === 'select' ? '责任清单' : phase === 'rate' ? '评估优先级' : phase === 'handover' ? '交接思考' : '责任清单报告'}
          </h1>
          <div className="w-20" />
        </div>
      </nav>

      {phase === 'select' && (
        <main className="mx-auto max-w-2xl px-4 pt-8">
          <SelectPhase
            selected={selected}
            customItems={customItems}
            customCategories={customCategories}
            onToggle={handleToggle}
            onAddCustom={handleAddCustom}
            onRemoveCustom={handleRemoveCustom}
            onNext={goToRate}
          />
        </main>
      )}

      {phase === 'rate' && (
        <main className="mx-auto max-w-2xl px-4 pt-8">
          <RatePhase
            selected={selected}
            labels={labels}
            ratings={ratings}
            onRate={handleRate}
            onNext={goToHandover}
            onBack={() => setPhase('select')}
          />
        </main>
      )}

      {phase === 'handover' && (
        <main className="mx-auto max-w-2xl px-4 pt-8">
          <HandoverPhase
            selected={selected}
            labels={labels}
            handovers={handovers}
            onUpdate={handleHandoverUpdate}
            onNext={goToReport}
            onBack={() => setPhase('rate')}
          />
        </main>
      )}

      {phase === 'report' && report && (
        <main className="mx-auto max-w-2xl px-4 pt-8">
          <ReportPhase report={report} />
        </main>
      )}
    </div>
  );
}
