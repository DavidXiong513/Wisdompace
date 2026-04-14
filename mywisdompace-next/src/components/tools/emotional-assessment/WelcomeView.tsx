'use client';

import React from 'react';
import { useEmotionalAssessmentStore } from '@/stores/emotionalAssessmentStore';

export function WelcomeView() {
  const setStep = useEmotionalAssessmentStore((state) => state.setStep);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-[#E8D9C2] bg-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#FDF5EE] p-4 text-3xl">
            🌱
          </div>
        </div>

        <h2 className="mb-4 text-center text-2xl font-bold text-[#4A3728]">
          心理情绪压力自测
        </h2>
        
        <p className="mb-6 text-center text-sm leading-relaxed text-[#8A7E6A]">
          本工具结合情绪感受、身体紧张感以及生活压力事件，
          为你提供一个三维立体的近期心理状态横断面参考。
        </p>

        <div className="mb-8 space-y-4 rounded-xl bg-[#FDF5EE] p-5 text-sm text-[#6A6256]">
          <h3 className="font-semibold text-[#C87941]">测评说明：</h3>
          <ul className="list-disc space-y-2 pl-5">
            <li>包含 <strong>20道情绪题</strong>、<strong>20道紧张题</strong> 及 <strong>生活事件清单</strong>。</li>
            <li>预计耗时约 <strong>5-8 分钟</strong>。</li>
            <li>请根据你 <strong>最近一周</strong> 的实际感受作答，凭第一直觉选择。</li>
            <li>所有数据仅保存在你的浏览器本地，随时可清除。</li>
          </ul>
        </div>

        <div className="mb-8 rounded-xl border border-[#E8D9C2] bg-[#FAFAF8] p-4 text-xs text-[#8A7E6A]">
          <strong className="text-[#4A3728]">免责声明：</strong>
          本工具仅供自我了解与心理状态参考，不具备任何医疗诊断效力。如症状持续或严重影响生活，请及时寻求专业医疗机构帮助。
        </div>

        <button
          onClick={() => setStep('emotion')}
          className="w-full rounded-xl bg-[#C87941] py-4 text-center text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
        >
          我已了解，开始测评 →
        </button>
      </div>
    </div>
  );
}