'use client';

import React from 'react';
import { scenarios } from '@/data/three-questions/bank';

interface Props {
  onSelect: (scenarioId: string) => void;
}

export function ScenarioSelector({ onSelect }: Props) {
  // 按分类对场景进行分组
  const categories = ["生活", "交易", "学业", "关系", "职业", "精神"];
  
  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const categoryScenarios = scenarios.filter(s => s.category === category);
        if (categoryScenarios.length === 0) return null;

        return (
          <section key={category} className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#B8A888]">
              <span className="h-px w-4 bg-[#E8D9C2]" />
              {category}领域
            </h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryScenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white p-5 text-left transition-all hover:border-[#C87941] hover:shadow-[0_8px_20px_rgba(200,121,65,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FDF5EE] text-xl group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#4A3728] group-hover:text-[#C87941]">
                        {s.name}
                      </h4>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-[#8A7E6A] line-clamp-2">
                        {s.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end text-[10px] font-bold uppercase tracking-wider text-[#C87941] opacity-0 group-hover:opacity-100 transition-opacity">
                    开启深思 →
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
