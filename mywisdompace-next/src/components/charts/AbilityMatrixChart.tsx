'use client';

/**
 * AbilityMatrixChart.tsx
 *
 * 能力四象限图（2×2 矩阵）。
 * X 轴：擅长度（低 → 高）
 * Y 轴：喜欢度（低 → 高）
 *
 * 四个象限：
 * - 优势区（擅长+喜欢）：值得深耕的能力
 * - 潜力区（不擅+喜欢）：有热情，可培养
 * - 储备区（擅长+不喜欢）：需要调整心态或寻找更好的使用方式
 * - 放弃区（不擅+不喜欢）：暂时放下
 */
import type { AbilityReport, Ability } from '@/types/ability';

// ── 常量 ───────────────────────────────────────────────────────────────────

/** 四象限颜色（填充 + 边框） */
const QUADRANT_STYLES = {
  strength: {
    label: '优势区',
    desc:  '擅长 × 喜欢 — 值得持续深耕的核心竞争力',
    bg:    'rgba(201,161,90,0.12)',
    border:'#C9A15A',
    text:  '#8A6A3A',
  },
  potential: {
    label: '潜力区',
    desc:  '喜欢 × 不太擅长 — 有热情，值得培养的能力',
    bg:    'rgba(107,142,35,0.10)',
    border:'#6B8E23',
    text:  '#4A6B1A',
  },
  reserve: {
    label: '储备区',
    desc:  '擅长 × 不太喜欢 — 必要时可启用，注意调整心态',
    bg:    'rgba(180,100,50,0.10)',
    border:'#B46432',
    text:  '#8A4820',
  },
  abandon: {
    label: '放弃区',
    desc:  '不擅长 × 不喜欢 — 暂时放下，交给别人',
    bg:    'rgba(100,100,100,0.08)',
    border:'#AAAAAA',
    text:  '#888888',
  },
} as const;

type QuadrantKey = keyof typeof QUADRANT_STYLES;

// ── 工具 ────────────────────────────────────────────────────────────────────

// ── Props ───────────────────────────────────────────────────────────────────

export interface AbilityMatrixChartProps {
  report: AbilityReport;
  /** 最多在每个象限内显示多少个能力标签（默认 8） */
  maxPerQuadrant?: number;
  className?: string;
}

// ── 组件 ────────────────────────────────────────────────────────────────────

export function AbilityMatrixChart({
  report,
  maxPerQuadrant = 8,
  className = '',
}: AbilityMatrixChartProps) {
  const { strengthDetail, potentialDetail, reserveDetail, abandonDetail } = report;

  // 收集每个象限的能力列表
  type Cell = { abilities: Ability[] };
  const cells: Record<QuadrantKey, Cell> = {
    strength:  { abilities: [...strengthDetail.hh, ...strengthDetail.hm, ...strengthDetail.mh, ...strengthDetail.mm] },
    potential: { abilities: [...potentialDetail.l4, ...potentialDetail.l3, ...potentialDetail.n4, ...potentialDetail.n3] },
    reserve:   { abilities: [...reserveDetail.h2, ...reserveDetail.h1, ...reserveDetail.m2, ...reserveDetail.m1] },
    abandon:   { abilities: [...abandonDetail.ll, ...abandonDetail.ln, ...abandonDetail.nl, ...abandonDetail.nn] },
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 轴标签 */}
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2">
        {/* 左上角留空 */}
        <div />
        {/* X 轴标签 */}
        <div className="col-start-2 col-end-3 text-center">
          <span className="text-xs text-[#8A7A6A]">← 擅长度低</span>
        </div>
        <div className="col-start-3 text-center">
          <span className="text-xs text-[#8A7A6A]">擅长度高 →</span>
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-2">
        {/* Y 轴标签（两行） */}
        <div className="flex flex-col justify-center gap-2">
          <div className="flex h-[80px] items-center">
            <span className="text-xs text-[#8A7A6A]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              喜欢度高 ↑
            </span>
          </div>
          <div className="flex h-[80px] items-center">
            <span className="text-xs text-[#8A7A6A]" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
              ↓ 喜欢度低
            </span>
          </div>
        </div>

        {/* 四个象限格子 */}
        {(['abandon', 'potential', 'reserve', 'strength'] as QuadrantKey[]).map((key) => {
          const { label, bg, border, text } = QUADRANT_STYLES[key];
          const { abilities } = cells[key];
          const displayAbilities = abilities.slice(0, maxPerQuadrant);
          const overflow = abilities.length - maxPerQuadrant;

          return (
            <div
              key={key}
              className="flex h-[80px] flex-col rounded-xl p-2 transition-colors"
              style={{ backgroundColor: bg, border: `1px solid ${border}` }}
            >
              <p className="text-xs font-semibold" style={{ color: text }}>
                {label}
              </p>
              <p className="mt-0.5 flex flex-wrap gap-1 overflow-hidden">
                {displayAbilities.map((a) => (
                  <span
                    key={a.id}
                    className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] leading-none"
                    style={{ color: text, borderColor: `${border}60` }}
                  >
                    {a.name}
                  </span>
                ))}
                {overflow > 0 && (
                  <span className="text-[10px] leading-none opacity-60" style={{ color: text }}>
                    +{overflow}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      {/* 底部说明 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-[#FAF8F3] p-3">
        {(Object.entries(QUADRANT_STYLES) as [QuadrantKey, (typeof QUADRANT_STYLES)[QuadrantKey]][]).map(
          ([key, s]) => (
            <div key={key} className="flex items-start gap-2">
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.border }}
              />
              <div>
                <span className="text-xs font-semibold" style={{ color: s.text }}>
                  {s.label}
                </span>
                <p className="mt-0.5 text-[10px] leading-relaxed text-[#8A7A6A]">{s.desc}</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
