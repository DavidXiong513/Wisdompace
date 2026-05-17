'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useTestStore } from '@/stores/testStore';
import { useSaveAssessment } from '@/lib/hooks/useAssessments';
import { useAuthStore } from '@/stores/authStore';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  loadAllMBTIData,
  getPageQuestions,
  getTotalPages,
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
  const [resultTab, setResultTab] = useState<
    'bestPerformance' | 'characteristics' | 'othersView' | 'growthAreas'
  >('bestPerformance');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const { currentPage, answers, setAnswer, setCurrentPage, resetTest, answeredCount } =
    useTestStore();

  const user = useAuthStore(s => s.user);
  const saveAssessment = useSaveAssessment();

  // 加载数据
  useEffect(() => {
    loadAllMBTIData()
      .then(({ questions, scoringRules, personalityTypes }) => {
        setQuestions(questions);
        setScoringRules(scoringRules);
        setPersonalityTypes(personalityTypes);
        setLoading(false);
      })
      .catch(err => {
        console.error('[MBTI] Failed to load test data:', err);
        setLoading(false);
      });
  }, []);

  // 如果有已有答案，自动跳到答题页
  const totalPages = useMemo(() => getTotalPages(questions.length), [questions.length]);
  const pageQuestions = useMemo(
    () => getPageQuestions(questions, currentPage),
    [questions, currentPage]
  );
  const effectivePhase =
    !loading && Object.keys(answers).length > 0 && phase === 'welcome' ? 'testing' : phase;

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

    // 已登录用户：保存测评结果到云端
    if (user) {
      setSaveStatus('saving');
      saveAssessment.mutate(
        {
          type: 'mbti',
          result: {
            type: testResult.type,
            typeName: testResult.typeName,
            scores: testResult.scores,
            dominant: testResult.typeData.dominant,
            auxiliary: testResult.typeData.auxiliary,
            tertiary: testResult.typeData.tertiary,
            inferior: testResult.typeData.inferior,
            answeredAt: new Date().toISOString(),
          },
        },
        {
          onSuccess: () => setSaveStatus('saved'),
          onError: () => setSaveStatus('error'),
        }
      );
    }
  }, [answers, scoringRules, personalityTypes, user, saveAssessment]);

  const handleRestart = useCallback(() => {
    resetTest();
    setResult(null);
    setPhase('welcome');
  }, [resetTest]);

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--color-bg-page)' }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <p className="text-stone-500">正在加载测试题库...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link
            href="/chapter/chapter-1"
            className="flex items-center gap-1 text-sm text-stone-500 transition-colors hover:text-amber-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            返回章节
          </Link>
          <h1 className="text-sm font-medium text-stone-700">MBTI 性格测试</h1>
          <div className="flex items-center gap-4">
            <LanguageSwitcher className="text-stone-400" />
            <span className="text-xs text-stone-400">93 题</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {effectivePhase === 'welcome' && <WelcomePhase onStart={handleStartTest} />}
        {effectivePhase === 'testing' && (
          <TestingPhase
            questions={pageQuestions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalQuestions={questions.length}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            onSubmit={handleSubmit}
            isLastPage={currentPage === totalPages - 1}
            answeredCount={answeredCount()}
          />
        )}
        {effectivePhase === 'result' && result && (
          <ResultPhase
            result={result}
            resultTab={resultTab}
            onTabChange={setResultTab}
            onRestart={handleRestart}
            saveStatus={saveStatus}
            isLoggedIn={!!user}
          />
        )}
      </main>
    </div>
  );
}

// ── 欢迎页 ────────────────────────────────────────────────────────────────────

function WelcomePhase({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-12 text-center">
      {/* 标题区 */}
      <div className="mb-8">
        <div className="mb-4 text-5xl">🧩</div>
        <h2 className="font-cn-serif mb-3 text-3xl text-stone-800">MBTI 性格测试</h2>
        <p className="text-base leading-relaxed text-stone-500">
          迈尔斯-布里格斯类型指标（Myers-Briggs Type Indicator）
          <br />
          帮助你了解自己获取能量、接收信息、做决定和生活方式的偏好
        </p>
      </div>

      {/* 信息卡片 */}
      <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm">
        <h3 className="mb-4 font-medium text-stone-700">📋 测试说明</h3>
        <ul className="space-y-3 text-sm text-stone-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-600">●</span>
            <span>
              共 <strong>93 题</strong>，分为情景题与词语配对两部分
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-600">●</span>
            <span>每题选 A 或 B，选择更符合你直觉的那个</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-600">●</span>
            <span>没有对错之分，请根据第一反应作答</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-amber-600">●</span>
            <span>
              预计用时 <strong>15–20 分钟</strong>，进度自动保存
            </span>
          </li>
        </ul>
      </div>

      {/* 四维度简介 */}
      <div className="mb-8 grid grid-cols-2 gap-3">
        {[
          { left: '外向 E', right: '内向 I', desc: '能量方向' },
          { left: '感觉 S', right: '直觉 N', desc: '信息获取' },
          { left: '思考 T', right: '情感 F', desc: '决策方式' },
          { left: '判断 J', right: '知觉 P', desc: '生活态度' },
        ].map(dim => (
          <div key={dim.left} className="rounded-xl border border-stone-200 bg-white p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-amber-700">{dim.left}</span>
              <span className="text-stone-300">—</span>
              <span className="text-stone-600">{dim.right}</span>
            </div>
            <p className="mt-1 text-xs text-stone-400">{dim.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="rounded-full bg-amber-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
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
  onAnswer: (questionId: number, answer: 'A' | 'B') => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isLastPage: boolean;
  answeredCount: number;
}

function TestingPhase({
  questions,
  currentPage,
  totalPages,
  totalQuestions,
  answers,
  onAnswer,
  onNext,
  onPrev,
  onSubmit,
  isLastPage,
  answeredCount,
}: TestingPhaseProps) {
  const progressPct = Math.round((answeredCount / totalQuestions) * 100);
  const currentSection = questions[0]?.section ?? 'part1';
  const sectionInfo = SECTION_INFO[currentSection];

  return (
    <div>
      {/* 进度条区 */}
      <div className="mb-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            {sectionInfo?.title} · {sectionInfo?.range}
          </span>
          <span className="text-xs font-medium text-stone-500">
            已答 {answeredCount}/{totalQuestions}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            第 {currentPage + 1}/{totalPages} 页
          </span>
          <span className="text-xs font-medium text-amber-600">{progressPct}%</span>
        </div>
      </div>

      {/* 题目列表 */}
      <div className="mb-6 space-y-3">
        {questions.map(q => {
          const selected = answers[q.id];
          return (
            <div
              key={q.id}
              className={`rounded-xl border bg-white transition-colors ${
                selected ? 'border-amber-300 bg-amber-50/30' : 'border-stone-200'
              }`}
            >
              {/* 题号 */}
              <div className="px-5 pt-4 pb-1">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  {q.id}
                </span>
              </div>

              {/* 题目文本 */}
              <p className="px-5 pb-3 text-[15px] leading-relaxed text-stone-700">{q.question}</p>

              {/* 选项 */}
              <div className="space-y-2 px-5 pb-4">
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
          className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← 上一页
        </button>

        {isLastPage ? (
          <button
            onClick={onSubmit}
            disabled={answeredCount < totalQuestions}
            className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            查看结果 ({answeredCount}/{totalQuestions})
          </button>
        ) : (
          <button
            onClick={onNext}
            className="rounded-full bg-amber-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
          >
            下一页 →
          </button>
        )}
      </div>

      {/* 页码点 */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              const store = useTestStore.getState();
              store.setCurrentPage(i);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`h-2 w-2 rounded-full transition-all ${
              i === currentPage
                ? 'w-6 bg-amber-500'
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
      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
        selected
          ? 'border-amber-400 bg-amber-50 shadow-sm'
          : 'border-stone-200 hover:border-amber-200 hover:bg-amber-50/50'
      }`}
    >
      <span
        className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          selected ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-500'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm leading-relaxed ${selected ? 'font-medium text-amber-800' : 'text-stone-600'}`}
      >
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
  saveStatus,
  isLoggedIn,
}: {
  result: TestResult;
  resultTab: 'bestPerformance' | 'characteristics' | 'othersView' | 'growthAreas';
  onTabChange: (tab: typeof resultTab) => void;
  onRestart: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  isLoggedIn: boolean;
}) {
  const pairs = getDimensionPairs(result.scores);

  return (
    <div>
      {/* 大字类型展示 */}
      <div className="py-8 text-center">
        <div className="mb-4 inline-block rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 px-8 py-6 text-white shadow-lg">
          <div className="font-cn-serif mb-1 text-5xl font-bold tracking-widest">{result.type}</div>
          <div className="text-sm text-amber-100">{result.typeName}</div>
        </div>

        {/* 云端保存状态 */}
        {isLoggedIn ? (
          <div className="mt-2 text-xs">
            {saveStatus === 'saving' && <span className="text-stone-400">正在保存结果到云端…</span>}
            {saveStatus === 'saved' && <span className="text-green-600">✓ 结果已保存到云端</span>}
            {saveStatus === 'error' && <span className="text-red-500">保存失败，请检查网络</span>}
          </div>
        ) : (
          <div className="mt-2 text-xs text-stone-400">登录后可保存测评结果，随时查看历史记录</div>
        )}
      </div>

      {/* 维度柱状图 */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-medium text-stone-500">维度分布</h3>
        <div className="space-y-4">
          {pairs.map(pair => {
            const total = pair.left.score + pair.right.score;
            const leftPct = total > 0 ? Math.round((pair.left.score / total) * 100) : 50;
            const rightPct = 100 - leftPct;
            const isLeftDominant = pair.left.score >= pair.right.score;

            return (
              <div key={pair.left.letter}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span
                    className={`font-medium ${isLeftDominant ? 'text-amber-700' : 'text-stone-400'}`}
                  >
                    {pair.left.letter} · {pair.left.name}
                    <span className="ml-1 text-xs">({pair.left.score})</span>
                  </span>
                  <span
                    className={`font-medium ${!isLeftDominant ? 'text-amber-700' : 'text-stone-400'}`}
                  >
                    {pair.right.letter} · {pair.right.name}
                    <span className="ml-1 text-xs">({pair.right.score})</span>
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-stone-100">
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
      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-stone-500">认知功能栈</h3>
        <div className="flex items-center justify-center gap-4 text-sm">
          {[
            {
              label: '主导',
              value: result.typeData.dominant,
              color: 'text-amber-700 bg-amber-100',
            },
            {
              label: '辅助',
              value: result.typeData.auxiliary,
              color: 'text-amber-600 bg-amber-50',
            },
            {
              label: '第三',
              value: result.typeData.tertiary,
              color: 'text-stone-500 bg-stone-100',
            },
            { label: '劣势', value: result.typeData.inferior, color: 'text-stone-400 bg-stone-50' },
          ].map(fn => (
            <div key={fn.label} className="text-center">
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${fn.color} mb-1 text-base font-medium`}
              >
                {fn.value}
              </div>
              <div className="text-xs text-stone-400">{fn.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 详细描述 Tab */}
      <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex gap-1 border-b border-stone-100">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                resultTab === tab.key
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-line text-stone-600">
          {result.typeData[resultTab]}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="mt-6 mb-8 flex items-center justify-center gap-4">
        <button
          onClick={onRestart}
          className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
        >
          重新测试
        </button>
        <Link
          href="/chapter/chapter-1"
          className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-700"
        >
          返回章节
        </Link>
      </div>
    </div>
  );
}
