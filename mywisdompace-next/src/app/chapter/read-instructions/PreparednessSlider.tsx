"use client";

import { useMemo, useState } from "react";

export default function PreparednessSlider() {
  const [value, setValue] = useState(0);
  const marks = useMemo(() => Array.from({ length: 11 }, (_, index) => index), []);
  const progress = `${(value / 10) * 100}%`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-[#4A3728]">
          你的生死预备现状
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E8E4DD] bg-white px-3 py-1 text-[13px] font-semibold text-[#4A3728]">
          当前：{value}/10
        </span>
      </div>

      <div className="relative h-8">
        <div className="absolute inset-x-[-0.25rem] top-1/2 h-2 -translate-y-1/2 -translate-x-3 rounded-full bg-[#E8E4DD]">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-[#E8C872] via-[#C7A96A] to-[#8B7355]"
            style={{ width: progress }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-label="生死预备程度"
          className="absolute inset-x-[-0.25rem] inset-y-0 z-10 h-8 w-auto -translate-x-3 cursor-pointer appearance-none bg-transparent accent-[#8B7355] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C7A96A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F3]"
        />
      </div>

      <div className="relative -mx-1 h-8 -translate-x-3 px-0 text-[11px] text-[#8B7355]">
        {marks.map((mark) => {
          const left = `${(mark / 10) * 100}%`;
          const translateClass =
            mark === 0
              ? "translate-x-0"
              : mark === 10
              ? "-translate-x-full"
              : "-translate-x-1/2";

          return (
            <div
              key={mark}
              className={`absolute top-0 flex flex-col items-center ${translateClass}`}
              style={{ left }}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  mark <= value ? "bg-[#8B7355]" : "bg-[#D6C9B7]"
                }`}
              />
              <span className="mt-1">{mark}</span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-[#6A6256] sm:flex-row sm:items-center sm:justify-between">
        <span>0（表示一点都没有思考过）</span>
        <span>10（表示已经完全准备妥当）</span>
      </div>
    </div>
  );
}
