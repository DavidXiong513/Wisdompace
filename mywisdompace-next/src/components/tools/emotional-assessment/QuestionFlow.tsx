'use client';

import React, { useState, useEffect } from 'react';
import { useEmotionalAssessmentStore } from '@/stores/emotionalAssessmentStore';
import { EmotionTensionQuestion } from '@/types/emotional-assessment';
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
  const [animateKey, setAnimateKey] = useState(0);

  // Initialize progress if already answered partially
  useEffect(() => {
    const answeredCount = Object.keys(currentAnswers).length;
    if (answeredCount > 0 && answeredCount < total) {
      // Find the first unanswered question
      for (let i = 0; i < total; i++) {
        if (!currentAnswers[questions[i].id]) {
          setCurrentIndex(i);
          break;
        }
      }
    } else if (answeredCount === total) {
      setCurrentIndex(total - 1);
    }
  }, [currentAnswers, questions, total]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / total) * 100;
  const title = type === 'emotion' ? '第一部分：情绪自评' : '第二部分：紧张自评';

  const handleSelect = (value: number) => {
    if (type === 'emotion') {
      store.setEmotionAnswer(currentQuestion.id, value);
    } else {
      store.setTensionAnswer(currentQuestion.id, value);
    }

    if (currentIndex < total - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setAnimateKey((prev) => prev + 1); // trigger animation
      }, 300);
    } else {
      // Completed this section
      setTimeout(() => {
        if (type === 'emotion') {
          store.setStep('tension');
        } else {
          store.setStep('life_events');
        }
      }, 500);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setAnimateKey((prev) => prev + 1);
    }
  };

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-[#E8D9C2] bg-white p-6 shadow-sm sm:p-8">
      {/* 顶部标题与进度 */}
      <div className="mb-8">
        <h3 className="mb-2 text-sm font-semibold text-[#8A7E6A]">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F0E8DC]">
            <div
              className="h-full bg-[#C87941] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#C87941]">
            {currentIndex + 1} / {total}
          </span>
        </div>
      </div>

      {/* 题干展示区 */}
      <div key={animateKey} className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="mb-10 min-h-[120px] rounded-xl bg-[#FAFAF8] p-6 text-center shadow-inner flex items-center justify-center border border-[#E8D9C2]/30">
          <h2 className="text-xl font-bold leading-relaxed text-[#4A3728]">
            {currentQuestion.content}
          </h2>
        </div>

        {/* 选项区 */}
        <div className="space-y-3">
          {OPTIONS.map((opt) => {
            const isSelected = currentAnswers[currentQuestion.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full rounded-xl border p-4 text-center text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941] shadow-sm'
                    : 'border-[#E8D9C2] bg-white text-[#6A6256] hover:bg-[#FAFAF8] hover:border-[#C87941]/50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`text-sm font-medium ${
            currentIndex === 0 ? 'text-transparent cursor-default' : 'text-[#8A7E6A] hover:text-[#C87941]'
          }`}
        >
          ← 上一题
        </button>
        <span className="text-xs text-[#8A7E6A]/50">请基于最近一周的感受</span>
      </div>
    </div>
  );
}