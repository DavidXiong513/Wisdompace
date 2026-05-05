'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { LifeClockResult } from '@/types/life-clock';

interface Props {
  result: LifeClockResult;
}

function useColumnsPerRow() {
  const [cols, setCols] = useState(36);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setCols(12);
      else if (w < 768) setCols(18);
      else setCols(36);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return cols;
}

export function LifeMonthGrid({ result }: Props) {
  const MONTHS_PER_ROW = useColumnsPerRow();

  const gridData = useMemo(() => {
    const total = result.totalMonths;
    const past = result.pastMonths;
    const rowCount = Math.ceil(total / MONTHS_PER_ROW);
    
    const rows = [];
    for (let r = 0; rowCount > r; r++) {
      const months = [];
      for (let m = 0; MONTHS_PER_ROW > m; m++) {
        const index = r * MONTHS_PER_ROW + m;
        if (index >= total) break;
        
        let status: 'past' | 'current' | 'future' = 'future';
        if (index < past) status = 'past';
        else if (index === past) status = 'current';
        
        months.push({ index, status });
      }
      rows.push({ rowIndex: r, months });
    }
    return rows;
  }, [result.totalMonths, result.pastMonths]);

  return (
    <div className="rounded-2xl border-2 border-[#C9A15A]/20 bg-white p-4 shadow-[0_8px_30px_rgb(201,161,90,0.08)] sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9A15A]">生命月度全景图</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[1px] bg-[#8B7355]" />
            <span className="text-[9px] font-bold text-[#8B7355]">已走过</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[1px] bg-[#FAF3E0] border border-[#C9A15A]/20" />
            <span className="text-[9px] font-bold text-[#C9A15A]">尚余晖</span>
          </div>
        </div>
      </div>

      {/* 全局视图容器，不再使用内部滚动 */}
      <div className="w-full overflow-hidden">
        <div className="flex flex-col gap-[2px]">
          {gridData.map((row) => (
            <div key={row.rowIndex} className="flex items-center gap-2">
              <span className="w-5 text-right text-[7px] font-bold text-[#C9A15A]/50 tabular-nums leading-none">
                {Math.floor(row.rowIndex * MONTHS_PER_ROW / 12)}
              </span>
              <div className="flex flex-1 gap-[1.5px]">
                {row.months.map((m) => (
                  <div
                    key={m.index}
                    className={`aspect-square flex-1 rounded-[0.5px] transition-all duration-1000 ${
                      m.status === 'past' 
                        ? 'bg-[#8B7355] opacity-70' 
                        : m.status === 'current' 
                          ? 'bg-[#D97706] animate-pulse scale-150 z-10 shadow-[0_0_6px_rgba(217,119,6,0.5)]' 
                          : 'bg-[#FAF3E0] border-[0.5px] border-[#C9A15A]/10'
                    }`}
                  />
                ))}
                {row.months.length < MONTHS_PER_ROW && 
                  Array.from({ length: MONTHS_PER_ROW - row.months.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square flex-1" />
                  ))
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] leading-relaxed text-[#8B7355] font-medium italic">
        每一行代表生命中波澜壮阔的三年。这些闪烁的微光，是你正热烈燃烧的此刻。
      </p>
    </div>
  );
}
