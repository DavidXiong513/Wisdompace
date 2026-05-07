'use client';

/**
 * BigFiveBarChart.tsx
 *
 * 水平柱状图，展示大五人格五维度百分位得分。
 * 每维度 0-100% 百分位，附加等级标签。
 */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { BigFiveTestResult, BigFiveDimensionKey } from '@/types/big-five';

// ── 常量 ───────────────────────────────────────────────────────────────────

const DIMENSION_LABELS: Record<BigFiveDimensionKey, string> = {
  extraversion:      '外向性',
  openness:          '开放性',
  agreeableness:     '亲和性',
  conscientiousness:  '尽责性',
  neuroticism:       '神经质',
};

const GRID_COLOR = '#E8D9C2';
const TEXT_COLOR = '#5D4A3A';

/** 等级颜色 */
function getLevelColor(level: string): string {
  switch (level) {
    case '极高': return '#8B6AA0'; // 紫色
    case '高':  return '#C9A15A'; // 金色
    case '中':  return '#D4C5A9'; // 暖灰
    case '低':  return '#E8C8A0'; // 浅暖
    case '极低': return '#F0D8B0';
    default:    return '#D4C5A9';
  }
}

// ── Props ───────────────────────────────────────────────────────────────────

export interface BigFiveBarChartProps {
  result: BigFiveTestResult;
  /** 是否显示常模参考线（50%线），默认 true */
  showReferenceLine?: boolean;
  /** 自定义高度，默认 300 */
  height?: number;
}

// ── 组件 ────────────────────────────────────────────────────────────────────

export function BigFiveBarChart({
  result,
  showReferenceLine = true,
  height = 300,
}: BigFiveBarChartProps) {
  const chartData = result.dimensionScores.map((d) => ({
    key:          d.key,
    label:        DIMENSION_LABELS[d.key] ?? d.key,
    percentage:   d.percentage,
    level:        d.level,
    description:  d.description,
  }));

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
          barCategoryGap="25%"
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke={GRID_COLOR} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: TEXT_COLOR }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 13, fill: TEXT_COLOR, fontWeight: 600 }}
            width={68}
          />
          <Tooltip
            cursor={{ fill: 'rgba(201,161,90,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as (typeof chartData)[0];
              return (
                <div className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 shadow-md">
                  <p className="text-xs font-semibold text-[#3D2B1F]">{d.label}</p>
                  <p className="mt-1 text-xs text-[#5D4A3A]">
                    百分位：<strong>{d.percentage}%</strong> &nbsp; 等级：<strong>{d.level}</strong>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#7A6A52]">{d.description}</p>
                </div>
              );
            }}
          />
          {showReferenceLine && (
            <ReferenceLine x={50} stroke={GRID_COLOR} strokeDasharray="4 4" />
          )}
          <Bar dataKey="percentage" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={getLevelColor(entry.level)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 等级图例 */}
      <div className="mt-3 flex flex-wrap gap-3">
        {['极高', '高', '中', '低', '极低'].map((lvl) => (
          <div key={lvl} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: getLevelColor(lvl) }}
            />
            <span className="text-xs text-[#7A6A52]">{lvl}</span>
          </div>
        ))}
        {showReferenceLine && (
          <div className="flex items-center gap-1.5">
            <span className="h-px w-4 border-t-2 border-dashed border-[#D4C5A9]" />
            <span className="text-xs text-[#7A6A52]">常模中位线 50%</span>
          </div>
        )}
      </div>
    </div>
  );
}
