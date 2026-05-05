'use no memo';

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useEmotionalAssessmentStore } from '@/stores/emotionalAssessmentStore';
import { EMOTION_QUESTIONS, TENSION_QUESTIONS } from '@/data/emotional-assessment/bank';

interface Props {
  type: 'emotion' | 'tension';
}

const OPTIONS = [
  { value: 1, label: '偶或无' },
  { value: 2, label: '有时' },
  { value: 3, label: '经常' },
  { value: 4, label: '持续' },
];

export function QuestionFlow({ type }: Props) {
  const store = useEmotionalAssessmentStore();
  const questions = type === 'emotion' ? EMOTION_QUESTIONS : TENSION_QUESTIONS;
  const currentAnswers = type === 'emotion' ? store.answers.emotion : store.answers.tension;
  const total = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  // 防止连击：正在过渡时锁定点击
  const transitioning = useRef(false);

  const currentQuestion = questions[currentIndex];
  // 进度：当前是第几题（1-based），让进度条从 ~5% 到 100%
  const progress = ((currentIndex + 1) / total) * 100;
  const title = type === 'emotion' ? '第一部分：情绪自评' : '第二部分：紧张自评';

  const goToNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // 本部分最后1题 → 切换到下一个 step
      if (type === 'emotion') {
        store.setStep('tension');
      } else {
        store.setStep('life_events');
      }
    }
  }, [currentIndex, total, type, store]);

  const handleSelect = useCallback(
    (value: number) => {
      // 防连击：正在过渡中则忽略
      if (transitioning.current) return;

      // 如果是最后一题，立即跳转，不延迟
      const isLastQuestion = currentIndex === total - 1;

      // 先存答案
      if (type === 'emotion') {
        store.setEmotionAnswer(currentQuestion.id, value);
      } else {
        store.setTensionAnswer(currentQuestion.id, value);
      }

      if (isLastQuestion) {
        // 最后一题立即跳转，避免延迟感
        goToNext();
        return;
      }

      // 锁定 + 短暂延迟后跳转（150ms 更跟手）
      transitioning.current = true;
      setTimeout(() => {
        goToNext();
        // 解锁（比动画稍晚一点，防止动画中再点）
        setTimeout(() => {
          transitioning.current = false;
        }, 200);
      }, 150);
    },
    [type, store, currentQuestion, goToNext, currentIndex, total],
  );

  const handlePrev = () => {
    if (currentIndex > 0 && !transitioning.current) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // 当前选项是否已被选中（用于高亮）
  const selectedValue = currentAnswers[currentQuestion.id] ?? null;

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[#E8D9C2] bg-white p-6 shadow-sm sm:p-8">
      {/* 顶部标题与进度 */}
      <div className="mb-8">
        <h3 className="mb-2 text-sm font-semibold text-[#8A7E6A]">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0E8DC]">
            <div
              className="h-full bg-[#C87941] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-[#C87941]">
            {currentIndex + 1} / {total}
          </span>
        </div>
      </div>

      {/* 题干展示区 */}
      <div className="animate-in fade-in duration-200">
        <div className="mb-10 min-h-[120px] rounded-xl bg-[#FAFAF8] p-6 text-center shadow-inner flex items-center justify-center border border-[#E8D9C2]/30">
          <h2 className="text-xl font-bold leading-relaxed text-[#4A3728]">
            {currentQuestion.content}
          </h2>
        </div>

        {/* 选项区 */}
        <div className="space-y-3">
          {OPTIONS.map((opt) => {
            const isSelected = selectedValue === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                disabled={transitioning.current}
                className={`w-full rounded-xl border p-4 text-center text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941] shadow-sm scale-[1.01]'
                    : 'border-[#E8D9C2] bg-white text-[#6A6256] hover:bg-[#FAFAF8] hover:border-[#C87941]/50 active:scale-[0.98]'
                } ${transitioning.current ? 'opacity-60 pointer-events-none' : ''}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 || transitioning.current}
          className={`text-sm font-medium transition-colors ${
            currentIndex === 0
              ? 'text-transparent cursor-default'
              : 'text-[#8A7E6A] hover:text-[#C87941]'
          } ${transitioning.current ? 'pointer-events-none opacity-50' : ''}`}
        >
          ← 上一题
        </button>

        {currentIndex === total - 1 && (
          <button
            onClick={() => {
              // 最后一题，手动触发跳转到下一部分
              if (type === 'emotion') {
                store.setStep('tension');
              } else {
                store.setStep('life_events');
              }
            }}
            className="rounded-full bg-[#C87941] px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D]"
          >
            {type === 'emotion' ? '完成情绪部分 →' : '完成紧张部分 →'}
          </button>
        )}

        {currentIndex !== total - 1 && (
          <span className="text-xs text-[#8A7E6A]/50">请基于最近一周的感受</span>
        )}
      </div>
    </div>
  );
}