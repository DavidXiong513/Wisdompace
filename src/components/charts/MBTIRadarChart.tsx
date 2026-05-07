'use client';

/**
 * MBTIRadarChart.tsx
 *
 * 雷达图，展示 MBTI 四极维度得分。
 * 接收 { E, I, S, N, T, F, J, P } 原始分数（各0-100），
 * 转换为极坐标角度后以连续曲线展示。
 */
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { DimensionScores } from '@/types/mbti';

// ── 常量 ───────────────────────────────────────────────────────────────────

/** 四极维度对 */
const POLES = [
  { key: 'energy',      label: '外向/内向',      a: 'E' as const, b: 'I' as const },
  { key: 'information', label: '感觉/直觉',       a: 'S' as const, b: 'N' as const },
  { key: 'decision',   label: '思考/情感',       a: 'T' as const, b: 'F' as const },
  { key: 'structure', label: '判断/感知',       a: 'J' as const, b: 'P' as const },
] as const;

const WARM_FILL_A = 'rgba(201,161,90,0.25)';
const WARM_STROKE = '#C9A15A';
const GRID_COLOR  = '#E8D9C2';
const TEXT_COLOR  = '#5D4A3A';

// ── Props ───────────────────────────────────────────────────────────────────

export interface MBTIRadarChartProps {
  scores: DimensionScores;
  height?: number;
}

// ── 工具函数 ────────────────────────────────────────────────────────────────

function poleToAngle(scoreA: number, scoreB: number): number {
  const total = scoreA + scoreB;
  if (total === 0) return 90;
  return (scoreA / total) * 180;
}

// ── 组件 ────────────────────────────────────────────────────────────────────

export function MBTIRadarChart({ scores, height = 300 }: MBTIRadarChartProps) {
  const data = POLES.map((pole) => {
    const rawA = scores[pole.a];
    const rawB = scores[pole.b];
    return {
      dimension:  pole.key,
      label:      pole.label,
      angle:      poleToAngle(rawA, rawB),
      rawA,
      rawB,
    } as const;
  });

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={data}>
          <PolarGrid stroke={GRID_COLOR} />
          <PolarAngleAxis
            dataKey="dimension"
            tickFormatter={(key) => {
              const idx = POLES.findIndex((p) => p.key === key);
              return idx !== -1 ? POLES[idx].label : key;
            }}
            tick={{ fill: TEXT_COLOR, fontSize: 12, fontWeight: 600 }}
            tickLine={false}
          />
          <PolarRadiusAxis angle={90} domain={[0, 180]} tick={false} axisLine={false} />
          <Radar
            name="MBTI"
            dataKey="angle"
            stroke={WARM_STROKE}
            fill={WARM_FILL_A}
            fillOpacity={0.35}
            strokeWidth={2}
            dot={{ r: 4, fill: WARM_STROKE, strokeWidth: 0 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as (typeof data)[0];
              return (
                <div className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 shadow-md">
                  <p className="text-xs font-semibold text-[#3D2B1F]">{d.label}</p>
                  <p className="mt-1 text-xs text-[#5D4A3A]">
                    第一字母：<strong>{d.rawA}</strong> &nbsp; 第二字母：<strong>{d.rawB}</strong>
                  </p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
