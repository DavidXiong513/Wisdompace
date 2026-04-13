'use client';

import React, { useState, useMemo } from 'react';
import { Scenario, Answer } from '@/types/three-questions';

interface Props {
  scenario: Scenario;
  initialAnswers: Answer[];
  onUpdate: (questionId: string, score: number) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function QuestionFlow({ scenario, initialAnswers, onUpdate, onComplete, onCancel }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = scenario.questions[currentIndex];
  const totalQuestions = scenario.questions.length;

  const currentAnswer = useMemo(() => 
    initialAnswers.find(a => a.questionId === currentQuestion.id)?.score || 0
  , [initialAnswers, currentQuestion]);

  const handleScore = (score: number) => {
    onUpdate(currentQuestion.id, score);
    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const isLast = currentIndex === totalQuestions - 1;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="mx-auto max-w-2xl">
      {/* 顶部状态 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={onCancel} 
            className="flex items-center gap-1.5 text-xs font-bold text-[#8A7E6A] transition-colors hover:text-[#C87941]"
          >
            <span className="text-lg">↩</span> 返回场景选择
          </button>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#C87941]">
            深度追问：{currentQuestion.dimension.replace('维度', '')}
          </div>
          <div className="text-xs font-medium text-[#8A7E6A]">
            {currentIndex + 1} / {totalQuestions}
          </div>
        </div>
        <div className="h-1 w-full rounded-full bg-[#F0E8DC]">
          <div 
            className="h-full rounded-full bg-[#C87941] transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 问题卡片 */}
      <div key={currentQuestion.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl border border-[#E8D9C2] bg-white p-8 shadow-sm sm:p-12">
        <h3 className="text-center text-xl font-bold leading-relaxed text-[#4A3728] sm:text-2xl">
          {currentQuestion.text}
        </h3>

        <div className="mt-12 flex flex-col gap-3">
          {[
            { score: 5, label: '完全符合 / 非常认同' },
            { score: 4, label: '比较符合' },
            { score: 3, label: '一般 / 不确定' },
            { score: 2, label: '不太符合' },
            { score: 1, label: '完全不符合 / 坚决反对' },
          ].map((opt) => (
            <button
              key={opt.score}
              onClick={() => handleScore(opt.score)}
              className={`group flex items-center justify-between rounded-2xl border px-6 py-4 transition-all ${
                currentAnswer === opt.score 
                  ? 'border-[#C87941] bg-[#FDF5EE] text-[#C87941]' 
                  : 'border-[#E8D9C2] bg-[#FAFAF8] text-[#8A7E6A] hover:border-[#C87941] hover:bg-white'
              }`}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <div className={`h-5 w-5 rounded-full border-2 transition-all ${
                currentAnswer === opt.score ? 'border-[#C87941] bg-[#C87941]' : 'border-[#D8CDB8] group-hover:border-[#C87941]'
              }`} />
            </button>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="text-sm font-bold text-[#8A7E6A] disabled:opacity-30 hover:text-[#4A3728]"
          >
            ← 上一题
          </button>
          
          {isLast && currentAnswer > 0 && (
            <button
              onClick={onComplete}
              className="rounded-full bg-[#4A3728] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-black"
            >
              查看决策分析结果 →
            </button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs leading-relaxed text-[#B8A888]">
        三思清单不提供标准答案，它只是一面映照内心的镜子。<br />
        请诚实地面对每一个追问。
      </p>
    </div>
  );
}
