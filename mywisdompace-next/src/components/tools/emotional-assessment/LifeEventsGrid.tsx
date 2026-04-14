'use client';

import React, { useMemo } from 'react';
import { useEmotionalAssessmentStore } from '@/stores/emotionalAssessmentStore';
import { LIFE_EVENTS } from '@/data/emotional-assessment/bank';

export function LifeEventsGrid() {
  const store = useEmotionalAssessmentStore();
  const selectedEvents = store.answers.lifeEvents;

  // 按照 category 分组
  const categories = useMemo(() => {
    const map = new Map<string, typeof LIFE_EVENTS>();
    LIFE_EVENTS.forEach((event) => {
      const cat = map.get(event.category) || [];
      cat.push(event);
      map.set(event.category, cat);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#E8D9C2] bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-8 border-b border-[#E8D9C2]/30 pb-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-[#4A3728]">
          第三部分：生活压力事件回顾
        </h2>
        <p className="text-sm leading-relaxed text-[#8A7E6A]">
          请仔细回顾并勾选你在 <strong>过去一年内</strong> 实际经历过的事件。
          <br />（若未经历，无需勾选；选好后点击最下方按钮提交）
        </p>
      </div>

      <div className="space-y-8 animate-in fade-in duration-500">
        {categories.map(([catName, events]) => (
          <div key={catName} className="rounded-xl border border-[#F0E8DC] bg-[#FAFAF8] p-5">
            <h3 className="mb-4 flex items-center text-sm font-bold text-[#C87941]">
              <span className="mr-2 rounded bg-[#FDF5EE] px-2 py-1 text-xs">
                {events.length} 项
              </span>
              {catName}
            </h3>
            
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {events.map((event) => {
                const isSelected = selectedEvents.includes(event.id);
                return (
                  <button
                    key={event.id}
                    onClick={() => store.toggleLifeEvent(event.id)}
                    className={`flex items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                      isSelected
                        ? 'border-[#C87941] bg-[#FDF5EE] text-[#4A3728] shadow-sm'
                        : 'border-transparent bg-white text-[#6A6256] hover:border-[#E8D9C2]'
                    }`}
                  >
                    <span className="flex-1 pr-2 leading-tight">
                      {event.content}
                    </span>
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                        isSelected
                          ? 'border-[#C87941] bg-[#C87941]'
                          : 'border-[#D8CDB8] bg-[#FAFAF8]'
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 mt-10 rounded-2xl bg-white/90 p-4 backdrop-blur-md border border-[#E8D9C2]/50 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="mb-4 flex items-center justify-between px-2 text-sm">
          <span className="text-[#8A7E6A]">已选择</span>
          <span className="font-bold text-[#C87941]">{selectedEvents.length} 项</span>
        </div>
        <button
          onClick={() => store.calculateAndSetResult()}
          className="w-full rounded-xl bg-[#4A3728] py-4 text-center text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
        >
          生成综合评估报告 →
        </button>
      </div>
    </div>
  );
}