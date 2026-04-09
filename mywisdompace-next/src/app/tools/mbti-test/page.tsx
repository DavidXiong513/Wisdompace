'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTestStore } from '@/stores/testStore';
import {
  loadAllMBTIData,
  getPageQuestions,
  getTotalPages,
  QUESTIONS_PER_PAGE,
  SECTION_INFO,
  generateTestResult,
  getDimensionPairs,
} from '@/lib/mbti-data';
import type { MBTIQuestion, ScoringRule, PersonalityTypeData, TestResult } from '@/types/mbti';

// ── 阶段状态 ──────────────────────────────────────────────────────────────────

type Phase = 'welcome' | 'testing' | 'result';

// ── 主页面 ────────────────────────────────────────────────────────────────────

export default function MBTITestPage() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [questions, setQuestions] = useState<MBTIQuestion[]>([]);
  const [scoringRules, setScoringRules] = useState<ScoringRule[]>([]);
  const [personalityTypes, setPersonalityTypes] = useState<PersonalityTypeData[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultTab, setResultTab] = useState<'bestPerformance' | 'characteristics' | 'othersView' | 'growthAreas'>('bestPerformance');

  const {
    currentPage,
    answers,
    setAnswer,
    setCurrentPage,
    resetTest,
    answeredCount,
    isPageComplete,
  } = useTestStore();

  // 加载数据
  useEffect(() => {
    loadAllMBTIData().then(({ questions, scoringRules, personalityTypes }) => {
      setQuestions(questions);
      setScoringRules(scoringRules);
      setPersonalityTypes(personalityTypes);
      setLoading(false);
    });
  }, []);

  // 如果有已有答案，自动跳到答题页
  useEffect(() => {
    if (!loading && Object.keys(answers).length > 0 && phase === 'welcome') {
      setPhase('testing');
    }
  }, [loading, answers, phase]);

  const totalPages = useMemo(() => getTotalPages(questions.length), [questions.length]);
  const pageQuestions = useMemo(() => getPageQuestions(questions, currentPage), [questions, currentPage]);

  const handleStartTest = useCallback(() => {
    resetTest();
    setPhase('testing');
  }, [resetTest]);

  const handleAnswer = useCallback(
    (questionId: number, answer: 'A' | 'B') => {
      setAnswer(questionId, answer);
    },
    [setAnswer]
  );

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages, setCurrentPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, setCurrentPage]);

  const handleSubmit = useCallback(() => {
    const testResult = generateTestResult(answers, scoringRules, personalityTypes);
    setResult(testResult);
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [answers, scoringRules, personalityTypes]);

  const handleRestart = useCallback(() => {
    resetTest();
    setResult(null);
    setPhase('welcome');
  }, [resetTest]);

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500">正在加载测试题库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/chapter/chapter-1"
            className="text-stone-500 hover:text-amber-700 transition-colors flex items-center gap-1 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            返回章节
          </Link>
          <h1 className="text-sm font-medium text-stone-700">MBTI 性格测试</h1>
          <span className="text-xs text-stone-400">93 题</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {phase === 'welcome' && <WelcomePhase onStart={handleStartTest} />}
        {phase === 'testing' && (
          <TestingPhase
            questions={pageQuestions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalQuestions={questions.length}
            answers={answers}
            allQuestions={questions}
            onAnswer={handleAnswer}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            onSubmit={handleSubmit}
            isLastPage={currentPage === totalPages - 1}
            isPageComplete={isPageComplete(currentPage, QUESTIONS_PER_PAGE)}
            answeredCount={answeredCount()}
          />
        )}
        {phase === 'result' && result && (
          <ResultPhase
            result={result}
            resultTab={resultTab}
            onTabChange={setResultTab}
            onRestart={handleRestart}
          />
        )}
      </main>
    </div>
  );
}

// ── 欢迎页 ────────────────────────────────────────────────────────────────────

function WelcomePhase({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      {/* 标题区 */}
      <div className="mb-8">
        <div className="text-5xl mb-4">🧩</div>
        <h2 className="font-cn-serif text-3xl text-stone-800 mb-3">MBTI 性格测试</h2>
        <p className="text-stone-500 text-base leading-relaxed">
          迈尔斯-布里格斯类型指标（Myers-Briggs Type Indicator）
          <br />
          帮助你了解自己获取能量、接收信息、做决定和生活方式的偏好
        </p>
      </div>

      {/* 信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8 text-left">
        <h3 className="text-stone-700 font-medium mb-4">📋 测试说明</h3>
        <ul className="space-y-3 text-sm text-stone-600">
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">●</span>
            <span>共 <strong>93 题</strong>，分为情景题与词语配对两部分</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">●</span>
            <span>每题选 A 或 B，选择更符合你直觉的那个</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">●</span>
            <span>没有对错之分，请根据第一反应作答</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-600 mt-0.5">●</span>
            <span>预计用时 <strong>15–20 分钟</strong>，进度自动保存</span>
          </li>
        </ul>
      </div>

      {/* 四维度简介 */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { left: '外向 E', right: '内向 I', desc: '能量方向' },
          { left: '感觉 S', right: '直觉 N', desc: '信息获取' },
          { left: '思考 T', right: '情感 F', desc: '决策方式' },
          { left: '判断 J', right: '知觉 P', desc: '生活态度' },
        ].map((dim) => (
          <div key={dim.left} className="bg-white rounded-xl border border-stone-200 p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-amber-700">{dim.left}</span>
              <span className="text-stone-300">—</span>
              <span className="text-stone-600">{dim.right}</span>
            </div>
            <p className="text-xs text-stone-400 mt-1">{dim.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-base font-medium transition-colors shadow-sm"
      >
        开始测试
      </button>
    </div>
  );
}

// ── 答题页 ────────────────────────────────────────────────────────────────────

interface TestingPhaseProps {
  questions: MBTIQuestion[];
  currentPage: number;
  totalPages: number;
  totalQuestions: number;
  answers: Record<number, 'A' | 'B'>;
  allQuestions: MBTIQuestion[];
  onAnswer: (questionId: number, answer: 'A' | 'B') => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLastPage: boolean;
  isPageComplete: boolean;
  answeredCount: number;
}

function TestingPhase({
  questions,
  currentPage,
  totalPages,
  totalQuestions,
  answers,
  allQuestions,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  isLastPage,
  isPageComplete,
  answeredCount,
}: TestingPhaseProps) {
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const currentSection = questions[0]?.section ?? 'part1';
  const sectionInfo = SECTION_INFO[currentSection];

  return (
    <div>
      {/* 进度条区 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-stone-400">{sectionInfo?.title} · {sectionInfo?.range}</span>
          <span className="text-xs text-stone-500 font-medium">已答 {answeredCount}/{totalQuestions}</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-stone-400">第 {currentPage + 1}/{totalPages} 页</span>
          <span className="text-xs text-amber-600 font-medium">{progressPct}%</span>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-3 mb-6">
        {questions.map((q) => {
          const selected = answers[q.id];
          return (
            <div
              key={q.id}
              className={`bg-white rounded-xl border transition-colors ${
                selected ? 'border-amber-300 bg-amber-50/30' : 'border-stone-200'
              }`}
            >
              {/* 题号 */}
              <div className="px-5 pt-4 pb-1">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                  {q.id}
                </span>
              </div>

              {/* 题目文本 */}
              <p className="px-5 pb-3 text-stone-700 text-[15px] leading-relaxed">
                {q.question}
              </p>

              {/* 选项 */}
              <div className="px-5 pb-4 space-y-2">
                <OptionButton
                  label="A"
                  text={q.options.A}
                  selected={selected === 'A'}
                  onClick={() => onAnswer(q.id, 'A')}
                />
                <OptionButton
                  label="B"
                  text={q.options.B}
                  selected={selected === 'B'}
                  onClick={() => onAnswer(q.id, 'B')}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 翻页按钮 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentPage === 0}
          className="px-5 py-2.5 rounded-full border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← 上一页
        </button>

        {isLastPage ? (
          <button
            onClick={onSubmit}
            disabled={answeredCount < totalQuestions}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            查看结果 ({answeredCount}/{totalQuestions})
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-medium transition-colors"
          >
            下一页 →
          </button>
        )}
      </div>

      {/* 页码点 */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              const store = useTestStore.getState();
              store.setCurrentPage(i);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentPage
                ? 'bg-amber-500 w-6'
                : i < currentPage
                ? 'bg-amber-300'
                : 'bg-stone-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ── 选项按钮 ──────────────────────────────────────────────────────────────────

function OptionButton({
  label,
  text,
  selected,
  onClick,
}: {
  label: 'A' | 'B';
  text: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-lg border transition-all ${
        selected
          ? 'border-amber-400 bg-amber-50 shadow-sm'
          : 'border-stone-200 hover:border-amber-200 hover:bg-amber-50/50'
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 mt-0.5 ${
          selected ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
        }`}
      >
        {label}
      </span>
      <span className={`text-sm leading-relaxed ${selected ? 'text-amber-800 font-medium' : 'text-stone-600'}`}>
        {text}
      </span>
    </button>
  );
}

// ── 结果页 ────────────────────────────────────────────────────────────────────

const TAB_CONFIG = [
  { key: 'bestPerformance' as const, label: '最佳表现' },
  { key: 'characteristics' as const, label: '核心特征' },
  { key: 'othersView' as const, label: '他人评价' },
  { key: 'growthAreas' as const, label: '成长建议' },
];

function ResultPhase({
  result,
  resultTab,
  onTabChange,
  onRestart,
}: {
  result: TestResult;
  resultTab: 'bestPerformance' | 'characteristics' | 'othersView' | 'growthAreas';
  onTabChange: (tab: typeof resultTab) => void;
  onRestart: () => void;
}) {
  const pairs = getDimensionPairs(result.scores);

  return (
    <div>
      {/* 大字类型展示 */}
      <div className="text-center py-8">
        <div className="inline-block bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-2xl px-8 py-6 mb-4 shadow-lg">
          <div className="font-cn-serif text-5xl font-bold tracking-widest mb-1">
            {result.type}
          </div>
          <div className="text-amber-100 text-sm">
            {result.typeName}
          </div>
        </div>
      </div>

      {/* 维度柱状图 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 mb-6">
        <h3 className="text-sm font-medium text-stone-500 mb-4">维度分布</h3>
        <div className="space-y-4">
          {pairs.map((pair) => {
            const total = pair.left.score + pair.right.score;
            const leftPct = total > 0 ? Math.round((pair.left.score / total) * 100) : 50;
            const rightPct = 100 - leftPct;
            const isLeftDominant = pair.left.score >= pair.right.score;

            return (
              <div key={pair.left.letter}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className={`font-medium ${isLeftDominant ? 'text-amber-700' : 'text-stone-400'}`}>
                    {pair.left.letter} · {pair.left.name}
                    <span className="ml-1 text-xs">({pair.left.score})</span>
                  </span>
                  <span className={`font-medium ${!isLeftDominant ? 'text-amber-700' : 'text-stone-400'}`}>
                    {pair.right.letter} · {pair.right.name}
                    <span className="ml-1 text-xs">({pair.right.score})</span>
                  </span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden bg-stone-100">
                  <div
                    className={`rounded-l-full transition-all duration-500 ${
                      isLeftDominant ? 'bg-amber-500' : 'bg-stone-300'
                    }`}
                    style={{ width: `${leftPct}%` }}
                  />
                  <div
                    className={`rounded-r-full transition-all duration-500 ${
                      !isLeftDominant ? 'bg-amber-500' : 'bg-stone-300'
                    }`}
                    style={{ width: `${rightPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 功能栈 */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 mb-6">
        <h3 className="text-sm font-medium text-stone-500 mb-3">认知功能栈</h3>
        <div className="flex items-center justify-center gap-4 text-sm">
          {[
            { label: '主导', value: result.typeData.dominant, color: 'text-amber-700 bg-amber-100' },
            { label: '辅助', value: result.typeData.auxiliary, color: 'text-amber-600 bg-amber-50' },
            { label: '第三', value: result.typeData.tertiary, color: 'text-stone-500 bg-stone-100' },
            { label: '劣势', value: result.typeData.inferior, color: 'text-stone-400 bg-stone-50' },
          ].map((fn) => (
            <div key={fn.label} className="text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${fn.color} font-medium text-base mb-1`}>
                {fn.value}
              </div>
              <div className="text-xs text-stone-400">{fn.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 详细描述 Tab */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 mb-6">
        <div className="flex gap-1 mb-4 border-b border-stone-100">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                resultTab === tab.key
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">
          {result.typeData[resultTab]}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-center gap-4 mt-6 mb-8">
        <button
          onClick={onRestart}
          className="px-6 py-2.5 rounded-full border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
        >
          重新测试
        </button>
        <Link
          href="/chapter/chapter-1"
          className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-sm font-medium transition-colors"
        >
          返回章节
        </Link>
      </div>
    </div>
  );
}
