'use client';

import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { DecisionResult } from '@/types/three-questions';

interface Props {
  result: DecisionResult;
  onReset: () => void;
}

export function DecisionReport({ result, onReset }: Props) {
  // 准备雷达图数据
  const chartData = result.dimensionScores.map(ds => ({
    subject: ds.dimension,
    value: ds.percentage,
    fullMark: 100,
  }));

  const getRiskColor = (level: string) => {
    if (level === 'high') return 'text-red-600 bg-red-50 border-red-100';
    if (level === 'medium') return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  };

  const getRiskLabel = (level: string) => {
    if (level === 'high') return '高风险 / 需极其慎重';
    if (level === 'medium') return '中等风险 / 仍有疑虑';
    return '低风险 / 决策共识度高';
  };

  const handleExportMarkdown = () => {
    const content = `
# 三思清单 · 决策评估报告
日期: ${new Date().toLocaleDateString()}

## 1. 核心评估: ${result.overallScore} / 100
**风险判定**: ${getRiskLabel(result.riskLevel)}

## 2. 深度建议
${result.suggestion}

## 3. 维度拆解
${result.dimensionScores.map(ds => `- **${ds.dimension}**: ${ds.percentage}% (达成率)`).join('\n')}

---
*人生没有标准答案，三思清单仅作为你深度自省的脚手架。*
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `决策评估报告-${new Date().getTime()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 space-y-8">
      {/* 核心分数与雷达图卡片 */}
      <div className="rounded-3xl border-2 border-[#C9A15A]/20 bg-white p-6 shadow-[0_8px_30px_rgb(201,161,90,0.08)] sm:p-10">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-around">
          {/* 左侧分数 */}
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-[#FDF5EE] border-4 border-[#C9A15A]/10 shadow-inner">
              <span className="text-5xl font-bold text-[#B45309]">{result.overallScore}</span>
            </div>
            <h2 className="text-lg font-bold text-[#4A3728]">决策共识指数</h2>
            <div className={`mt-4 inline-block rounded-full border px-4 py-1 text-[10px] font-bold uppercase tracking-wider ${getRiskColor(result.riskLevel)}`}>
              {getRiskLabel(result.riskLevel)}
            </div>
          </div>

          {/* 右侧雷达图 */}
          <div className="h-64 w-full max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="#E8D9C2" />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#8A7E6A', fontSize: 10, fontWeight: 600 }} 
                />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#C9A15A"
                  fill="#C9A15A"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-[#FDF5EE]/50 p-6 border border-[#F0E8DC]">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#B45309]">深度解析</h3>
          <p className="text-sm leading-relaxed text-[#6A6256] whitespace-pre-line">
            {result.suggestion}
          </p>
        </div>
      </div>

      {/* 维度进度条 (作为雷达图的补充说明) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {result.dimensionScores.map((ds) => (
          <div key={ds.dimension} className="rounded-2xl border border-[#E8D9C2] bg-white p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A7E6A] mb-3">
              {ds.dimension}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[#4A3728]">{ds.percentage}%</span>
              <span className="text-[10px] text-[#B8A888]">达成率</span>
            </div>
            <div className="mt-3 h-1.5 w-full rounded-full bg-[#F0E8DC] overflow-hidden">
              <div 
                className="h-full bg-[#C9A15A] transition-all duration-1000" 
                style={{ width: `${ds.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 底部动作 */}
      <div className="grid gap-3 pt-4 sm:grid-cols-2">
        <button 
          onClick={handleExportMarkdown}
          className="w-full rounded-xl border border-[#E8D9C2] bg-white py-4 text-sm font-semibold text-[#8A7E6A] transition-all hover:bg-[#F5F0E8] flex items-center justify-center gap-2"
        >
          <span>📄</span> 导出决策书 (.md)
        </button>
        <button 
          onClick={() => window.print()}
          className="w-full rounded-xl bg-[#4A3728] py-4 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
        >
          <span>🖨️</span> 保存报告 (.pdf)
        </button>
        <button 
          onClick={onReset}
          className="sm:col-span-2 w-full rounded-xl py-3 text-xs font-medium text-[#B8A888] transition-colors hover:text-[#8A7E6A]"
        >
          重新开始决策深思
        </button>
      </div>
    </div>
  );
}
