'use client';

import React, { useState } from 'react';
import { useLifeClockStore } from '@/stores/lifeClockStore';

// ==================== 子组件：滑动条 ==================== //
function LevelSlider({ 
  label, 
  value, 
  onChange 
}: { 
  label: string; 
  value: number; 
  onChange: (v: number) => void 
}) {
  const labels: Record<number, string> = { 1: '极差', 2: '较差', 3: '一般', 4: '良好', 5: '极佳' };
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-[#4A3728]">{label}</span>
        <span className="text-xs font-bold text-[#C87941]">{labels[value]}</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8D9C2] accent-[#C87941]"
      />
      <div className="mt-1 flex justify-between px-1 text-[10px] text-[#8A7E6A]">
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
    </div>
  );
}

// ==================== 主表单组件 ==================== //
export function LifeClockForm() {
  const { input, updateInput, updateBadHabits, calculate } = useLifeClockStore();
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[#E8D9C2] bg-white p-6 shadow-sm sm:p-8">
      {/* 进度指示 */}
      <div className="mb-8 flex justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`h-1.5 flex-1 rounded-full mx-1 transition-all ${step >= i ? 'bg-[#C87941]' : 'bg-[#F0E8DC]'}`} 
          />
        ))}
      </div>

      {/* 第一步：基础数据 */}
      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="mb-6 text-xl font-bold text-[#4A3728]">基础生命档案</h3>
          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#8A7E6A]">出生日期</label>
              <input 
                type="date" 
                value={input.birthDate}
                onChange={(e) => updateInput({ birthDate: e.target.value })}
                className="w-full rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] px-4 py-3 text-sm focus:border-[#C87941] outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#8A7E6A]">身高 (cm)</label>
                <input 
                  type="number" 
                  value={input.height}
                  onChange={(e) => updateInput({ height: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] px-4 py-3 text-sm focus:border-[#C87941] outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#8A7E6A]">体重 (kg)</label>
                <input 
                  type="number" 
                  value={input.weight}
                  onChange={(e) => updateInput({ weight: parseInt(e.target.value) || 0 })}
                  className="w-full rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] px-4 py-3 text-sm focus:border-[#C87941] outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 第二步：健康背景 */}
      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="mb-6 text-xl font-bold text-[#4A3728]">家族健康背景</h3>
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-medium text-[#4A3728]">家族长辈寿命预期</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 1, label: '偏短 (<70)' },
                  { id: 2, label: '一般 (70-80)' },
                  { id: 3, label: '较长 (80-90)' },
                  { id: 4, label: '长寿 (90+)' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateInput({ lifespanExpectancy: opt.id })}
                    className={`rounded-xl border p-3 text-center text-sm transition-all ${input.lifespanExpectancy === opt.id ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941] font-bold' : 'border-[#E8D9C2] text-[#8A7E6A]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-3 block text-sm font-medium text-[#4A3728]">是否存在重大遗传病史？</label>
              <div className="flex gap-3">
                {[{ id: 1, label: '有' }, { id: 2, label: '无' }].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateInput({ hereditaryDisease: opt.id })}
                    className={`flex-1 rounded-xl border py-3 text-center text-sm transition-all ${input.hereditaryDisease === opt.id ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941] font-bold' : 'border-[#E8D9C2] text-[#8A7E6A]'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 第三步：生活方式 */}
      {step === 3 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="mb-6 text-xl font-bold text-[#4A3728]">生活质量评估</h3>
          <LevelSlider label="作息规律程度" value={input.workRestLevel} onChange={(v) => updateInput({ workRestLevel: v })} />
          <LevelSlider label="饮食营养均衡" value={input.dietLevel} onChange={(v) => updateInput({ dietLevel: v })} />
          <LevelSlider label="情绪心理状态" value={input.emotionLevel} onChange={(v) => updateInput({ emotionLevel: v })} />
          
          <div className="mt-4">
            <label className="mb-3 block text-sm font-medium text-[#4A3728]">每周运动频率</label>
            <select 
              value={input.exerciseIndex}
              onChange={(e) => updateInput({ exerciseIndex: parseInt(e.target.value) })}
              className="w-full rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] px-4 py-3 text-sm outline-none"
            >
              <option value={0}>基本没有运动习惯</option>
              <option value={1}>每周 1-2 次</option>
              <option value={2}>每周 3-5 次</option>
              <option value={3}>每周 150分钟以上规律运动</option>
            </select>
          </div>
        </div>
      )}

      {/* 第四步：行为习惯 */}
      {step === 4 && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h3 className="mb-6 text-xl font-bold text-[#4A3728]">行为习惯与心态</h3>
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-[#4A3728]">是否存在以下习惯？</label>
            <div className="space-y-2">
              {[
                { id: 'stayUpLate', label: '经常熬夜' },
                { id: 'smoking', label: '长期吸烟' },
                { id: 'drinking', label: '习惯性饮酒' },
                { id: 'none', label: '以上皆无' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => updateBadHabits(opt.id as keyof typeof input.badHabits, !input.badHabits[opt.id as keyof typeof input.badHabits])}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${input.badHabits[opt.id as keyof typeof input.badHabits] ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941]' : 'border-[#E8D9C2] text-[#8A7E6A]'}`}
                >
                  <span>{opt.label}</span>
                  <div className={`h-4 w-4 rounded-full border-2 ${input.badHabits[opt.id as keyof typeof input.badHabits] ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D8CDB8]'}`} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-[#4A3728]">当前的生命态度</label>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs text-[#8A7E6A]">焦虑忧虑</span>
              <span className="text-xs text-[#8A7E6A]">积极乐观</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={input.psychologicalState === 2 ? 1 : 5} // 简单映射：2(忧虑)为1, 1(乐观)为5
              onChange={(e) => {
                const val = parseInt(e.target.value);
                updateInput({ psychologicalState: val <= 2 ? 2 : 1 });
              }}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#E8D9C2] accent-[#C87941]"
            />
            <div className="mt-4 rounded-lg bg-[#FDF5EE] p-3 text-center text-xs text-[#C87941]">
              {input.psychologicalState === 1 ? '✨ 保持积极的心态有助于延长生命余晖' : '💡 试着寻找生活中的微光，焦虑会悄悄偷走时间'}
            </div>
          </div>
        </div>
      )}

      {/* 底部导航按钮 */}
      <div className="mt-10 flex gap-3">
        {step > 1 && (
          <button 
            onClick={prevStep}
            className="flex-1 rounded-xl border border-[#E8D9C2] py-3.5 text-sm font-semibold text-[#8A7E6A] transition-colors hover:bg-[#F5F0E8]"
          >
            上一步
          </button>
        )}
        <button 
          onClick={step === 4 ? calculate : nextStep}
          className="flex-[2] rounded-xl bg-[#C87941] py-3.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
        >
          {step === 4 ? '开启生命余光 →' : '下一步'}
        </button>
      </div>
    </div>
  );
}
