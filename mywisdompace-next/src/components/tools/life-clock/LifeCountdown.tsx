'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LifeClockResult } from '@/types/life-clock';

interface Props {
  result: LifeClockResult;
}

const TimeUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center group">
    <div className="relative">
      <div className="absolute -inset-2 bg-[#C9A15A]/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative text-3xl font-bold tabular-nums text-[#B45309] sm:text-4xl lg:text-5xl">
        {String(value).padStart(2, '0')}
      </div>
    </div>
    <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C9A15A] mt-2">
      {label}
    </div>
  </div>
);

export function LifeCountdown({ result }: Props) {
  const [now, setNow] = useState(new Date());
  const [endTime, setEndTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // 计算预计的死亡时间：当前时间 + 剩余年数对应的毫秒数
      // 这样更准确，不依赖于可能不精确的 birthDate
      const remainingMs = result.remainingYears * 365.25 * 24 * 60 * 60 * 1000;
      setEndTime(new Date(Date.now() + remainingMs));
    }, 0);
    return () => clearTimeout(timer);
  }, [result.remainingYears]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeLeft = useMemo(() => {
    if (!endTime) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor((diff / (1000 * 60 * 60 * 24)) % 30);
    const months = Math.floor((diff / (1000 * 60 * 60 * 24 * 30.44)) % 12);
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));

    return { years, months, days, hours, minutes, seconds };
  }, [endTime, now]);

  return (
    <div className="rounded-2xl border-2 border-[#C9A15A]/20 bg-white p-8 shadow-[0_8px_30px_rgb(201,161,90,0.08)] sm:p-10">
      <div className="mb-8 flex items-center justify-center gap-3">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#C9A15A]" />
        <p className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#C9A15A]">
          生命余晖剩余刻度
        </p>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#C9A15A]" />
      </div>
      
      <div className="grid grid-cols-3 gap-y-10 sm:grid-cols-6">
        <TimeUnit value={timeLeft.years} label="年" />
        <TimeUnit value={timeLeft.months} label="月" />
        <TimeUnit value={timeLeft.days} label="日" />
        <TimeUnit value={timeLeft.hours} label="时" />
        <TimeUnit value={timeLeft.minutes} label="分" />
        <TimeUnit value={timeLeft.seconds} label="秒" />
      </div>

      <div className="mt-10 border-t border-[#C9A15A]/10 pt-8 text-center">
        <p className="text-sm font-medium text-[#8A7E6A]">
          预计总寿命：<span className="text-lg font-bold text-[#B45309]">{result.expectedLifespan}</span> 岁
        </p>
      </div>
    </div>
  );
}
