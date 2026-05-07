'use client';

import React from 'react';
import Link from 'next/link';
import { useEmotionalAssessmentStore } from '@/stores/emotionalAssessmentStore';

export function ResultReport() {
  const store = useEmotionalAssessmentStore();
  const { result } = store;

  if (!result) return null;

  return (
    <div className="mx-auto max-w-2xl animate-in fade-in zoom-in-95 duration-700">
      <div className="overflow-hidden rounded-2xl border border-[#E8D9C2] bg-white shadow-lg">
        {/* Header Header */}
        <div className="bg-gradient-to-br from-[#4A3728] to-[#2A1F16] p-8 text-center text-white">
          <div className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#E8D9C2]">
            Comprehensive Assessment
          </div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight">心理情绪压力评估报告</h2>
          <p className="text-sm font-medium text-white/70">
            您的综合评估状态：<span className="text-[#C87941]">等级 {result.comprehensiveLevel}</span>
          </p>
        </div>

        <div className="p-6 sm:p-10 space-y-10">
          {/* Main Verdict */}
          <div className="rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-6 text-center">
            <h3 className="mb-4 text-2xl font-bold text-[#C87941]">{result.comprehensiveName}</h3>
            <p className="text-sm leading-relaxed text-[#6A6256]">{result.suggestion}</p>
          </div>

          {/* Sub Modules Breakdown */}
          <div>
            <h4 className="mb-6 flex items-center text-sm font-bold tracking-wider text-[#8A7E6A] uppercase">
              <div className="mr-3 h-px flex-1 bg-[#E8D9C2]" />
              三维剖析
              <div className="ml-3 h-px flex-1 bg-[#E8D9C2]" />
            </h4>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* 情绪 */}
              <div className="rounded-xl border border-[#F0E8DC] bg-[#FAFAF8] p-5 text-center transition-all hover:border-[#C87941]/30">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#B8A888]">情绪状态</div>
                <div className="mb-1 text-2xl font-bold text-[#4A3728]">{result.emotion.standardScore}<span className="text-xs font-normal text-[#8A7E6A] ml-1">分</span></div>
                <div className="inline-block rounded-full bg-white px-2 py-0.5 text-xs font-medium text-[#C87941] shadow-sm">
                  {result.emotion.levelName}
                </div>
              </div>
              
              {/* 紧张 */}
              <div className="rounded-xl border border-[#F0E8DC] bg-[#FAFAF8] p-5 text-center transition-all hover:border-[#C87941]/30">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#B8A888]">紧张状态</div>
                <div className="mb-1 text-2xl font-bold text-[#4A3728]">{result.tension.standardScore}<span className="text-xs font-normal text-[#8A7E6A] ml-1">分</span></div>
                <div className="inline-block rounded-full bg-white px-2 py-0.5 text-xs font-medium text-[#C87941] shadow-sm">
                  {result.tension.levelName}
                </div>
              </div>

              {/* 压力 */}
              <div className="rounded-xl border border-[#F0E8DC] bg-[#FAFAF8] p-5 text-center transition-all hover:border-[#C87941]/30">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#B8A888]">生活压力</div>
                <div className="mb-1 text-2xl font-bold text-[#4A3728]">{result.lifeEvents.lcuTotal}<span className="text-xs font-normal text-[#8A7E6A] ml-1">LCU</span></div>
                <div className="inline-block rounded-full bg-white px-2 py-0.5 text-xs font-medium text-[#C87941] shadow-sm">
                  {result.lifeEvents.levelName}
                </div>
              </div>
            </div>
          </div>

          {/* Warnings Section */}
          {result.warnings && result.warnings.length > 0 && (
            <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-5">
              <h4 className="mb-3 text-sm font-bold text-red-800/70">⚠️ 特殊关注提醒</h4>
              <ul className="space-y-2 text-sm text-red-900/70">
                {result.warnings.map((warn, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 mt-0.5 text-xs">•</span>
                    <span className="leading-relaxed">{warn}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E8D9C2]/30 bg-[#FAFAF8] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => store.reset()}
              className="flex-1 rounded-xl border border-[#E8D9C2] bg-white py-3.5 text-sm font-semibold text-[#8A7E6A] shadow-sm transition-all hover:bg-[#F5F0E8]"
            >
              重新测评
            </button>
            <Link
              href="/chapter/chapter-2#emotional-check"
              className="flex-1 rounded-xl bg-[#C87941] py-3.5 text-center text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
            >
              返回：压力与调节 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}