'use client';

import React from 'react';

/* 居家养老还是去养老院 · 共用 UI 小组件（报告 A / 报告 B 两套流程共用） */

export function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-all ${
        active
          ? 'border-[#C87941] bg-[#FDF5EE] font-semibold text-[#4A3728]'
          : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50'
      }`}
    >
      {children}
    </button>
  );
}

export function StepBadge({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FDF5EE] text-[11px] font-bold text-[#C87941]">
        {index}
      </span>
      <span className="text-[11px] font-bold tracking-[0.18em] text-[#C87941] uppercase">{title}</span>
    </div>
  );
}

export function Nav({
  onBack,
  onNext,
  nextLabel = '下一步',
  backLabel = '← 上一步',
  nextDisabled,
  hint,
}: {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            {backLabel}
          </button>
        )}
      </div>
      <div className="flex flex-col items-stretch gap-2 sm:items-end">
        {hint && <span className="text-[12px] text-[#A8927A]">{hint}</span>}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className={`rounded-full px-7 py-3 text-sm font-bold transition-all ${
            nextDisabled
              ? 'cursor-not-allowed bg-[#E8D9C2] text-white'
              : 'bg-[#C87941] text-white hover:bg-[#A85E2D]'
          }`}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}

/** 顶部四段进度条 */
export function StepProgress({
  labels,
  current,
  note,
}: {
  labels: string[];
  current: number;
  note?: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        {labels.map((label, i) => {
          const active = current === i;
          const done = current > i;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`h-1 flex-1 rounded-full ${
                  active ? 'bg-[#C87941]' : done ? 'bg-[#E0B182]' : 'bg-[#E8D9C2]'
                }`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] text-[#A8927A]">
        <span className="tracking-[0.14em]">
          第 {Math.min(current + 1, labels.length)} 步 / 共 {labels.length} 步 ·{' '}
          {labels[Math.min(current, labels.length - 1)]}
        </span>
        {note && <span>{note}</span>}
      </div>
    </>
  );
}
