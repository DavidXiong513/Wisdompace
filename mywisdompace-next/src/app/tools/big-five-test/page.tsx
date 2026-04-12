'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  loadAllBigFiveData,
  getPageQuestions,
  getTotalPages,
  DIMENSION_ORDER,
  DIMENSION_INFO,
  DIMENSION_COLORS,
  SCALE_LABELS,
  generateTestResult,
} from '@/lib/big-five-data';
import type {
  BigFiveQuestion,
  DimensionInterpretation,
  BigFiveTestResult,
  BigFiveDimensionKey,
} from '@/types/big-five';

// ── 阶段状态 ──────────────────────────────────────────────────────────────

type Phase = 'welcome' | 'testing' | 'result';

// ── 持久化答案 ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'big-five-answers';
const STORAGE_PAGE_KEY = 'big-five-page';

function loadSavedAnswers(): Record<number, number> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveAnswers(answers: Record<number, number>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  } catch { /* ignore */ }
}

function loadSavedPage(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const saved = localStorage.getItem(STORAGE_PAGE_KEY);
    return saved ? parseInt(saved, 10) : 1;
  } catch {
    return 1;
  }
}

function savePage(page: number) {
  try {
    localStorage.setItem(STORAGE_PAGE_KEY, String(page));
  } catch { /* ignore */ }
}

function clearSaved() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_PAGE_KEY);
  } catch { /* ignore */ }
}

// ── 主页面 ────────────────────────────────────────────────────────────────

export default function BigFiveTestPage() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [questions, setQuestions] = useState<BigFiveQuestion[]>([]);
  const [interpretations, setInterpretations] = useState<Record<string, DimensionInterpretation>>({});
  const [result, setResult] = useState<BigFiveTestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [activeDimTab, setActiveDimTab] = useState<BigFiveDimensionKey>('extraversion');

  // 加载数据
  useEffect(() => {
    loadAllBigFiveData().then(({ questions, interpretations }) => {
      setQuestions(questions);
      setInterpretations(interpretations);
      // 尝试恢复进度
      const savedAnswers = loadSavedAnswers();
      const savedPage = loadSavedPage();
      if (Object.keys(savedAnswers).length > 0) {
        setAnswers(savedAnswers);
        setCurrentPage(savedPage);
      }
      setLoading(false);
    });
  }, []);

  // 保存答案
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      saveAnswers(answers);
      savePage(currentPage);
    }
  }, [answers, currentPage]);

  const totalPages = useMemo(() => getTotalPages(questions.length), [questions]);
  const pageQuestions = useMemo(() => getPageQuestions(questions, currentPage), [questions, currentPage]);
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);

  // 选择答案
  const handleSelect = useCallback((questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // 当前页是否全部作答
  const isPageComplete = useMemo(
    () => pageQuestions.every((q) => answers[q.id] !== undefined),
    [pageQuestions, answers],
  );

  // 下一页
  const goNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // 完成所有题目，生成结果
      const r = generateTestResult(answers, questions, interpretations);
      setResult(r);
      setPhase('result');
      clearSaved();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages, answers, questions, interpretations]);

  // 上一页
  const goPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // 开始测试
  const startTest = useCallback(() => {
    setPhase('testing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // 重新测试
  const resetTest = useCallback(() => {
    setAnswers({});
    setCurrentPage(1);
    setResult(null);
    setPhase('welcome');
    clearSaved();
  }, []);

  // 退出确认
  const handleBack = useCallback(() => {
    if (phase === 'testing') {
      if (answeredCount > 0) {
        const confirmed = window.confirm('你已经有答题进度了，确定要退出吗？进度会自动保存。');
        if (!confirmed) return;
      }
    }
    window.history.back();
  }, [phase, answeredCount]);

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="text-[#8A7E6A]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 border-b border-[#E8E4DD] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-[#8A7E6A] transition-colors hover:text-[#4A3728]"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-sm font-semibold text-[#4A3728]">大五人格测试</h1>
          <div className="w-12" />
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pb-20 pt-6">
        {phase === 'welcome' && (
          <WelcomePhase onStart={startTest} hasProgress={answeredCount > 0} savedPage={loadSavedPage()} />
        )}
        {phase === 'testing' && (
          <TestingPhase
            currentPage={currentPage}
            totalPages={totalPages}
            pageQuestions={pageQuestions}
            answers={answers}
            answeredCount={answeredCount}
            totalQuestions={questions.length}
            isPageComplete={isPageComplete}
            onSelect={handleSelect}
            onNext={goNextPage}
            onPrev={goPrevPage}
          />
        )}
        {phase === 'result' && result && (
          <ResultPhase
            result={result}
            onReset={resetTest}
            activeTab={activeDimTab}
            onTabChange={setActiveDimTab}
          />
        )}
      </main>
    </div>
  );
}

// ── 欢迎页 ──────────────────────────────────────────────────────────────────

function WelcomePhase({
  onStart,
  hasProgress,
  savedPage,
}: {
  onStart: () => void;
  hasProgress: boolean;
  savedPage: number;
}) {
  return (
    <div className="space-y-6">
      {/* 标题区 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-8 shadow-sm">
        <div className="mb-4 text-center text-5xl">⭐</div>
        <h2 className="mb-2 text-center text-2xl font-bold text-[#2F2A24]">大五人格测试</h2>
        <p className="mb-1 text-center text-sm text-[#8A7E6A]">Big Five Personality Test</p>
        <p className="mt-4 text-center text-[#6A6256] leading-relaxed">
          基于经典大五人格理论，通过 60 道题目全面评估你的人格特征。
          没有对错之分，请根据自己的真实感受作答。
        </p>
      </div>

      {/* 五维度简介 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-[#4A3728]">五大维度</h3>
        <div className="space-y-3">
          {DIMENSION_ORDER.map((key) => {
            const info = DIMENSION_INFO[key];
            const colors = DIMENSION_COLORS[key];
            return (
              <div key={key} className="flex items-start gap-3 rounded-xl p-3 transition-colors" style={{ backgroundColor: colors.light }}>
                <span className="text-xl">{info.icon}</span>
                <div>
                  <div className="font-semibold text-[#2F2A24]">{info.name}</div>
                  <div className="text-sm text-[#6A6256]">{info.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 测试信息 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-[#C9A15A]">60</div>
            <div className="text-xs text-[#8A7E6A]">道题目</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#C9A15A]">5</div>
            <div className="text-xs text-[#8A7E6A]">个维度</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#C9A15A]">15</div>
            <div className="text-xs text-[#8A7E6A]">分钟</div>
          </div>
        </div>
      </div>

      {/* 开始按钮 */}
      <button
        onClick={onStart}
        className="w-full rounded-xl bg-[#C9A15A] py-4 text-lg font-semibold text-white shadow-md transition-all hover:bg-[#B58A3A] hover:shadow-lg active:scale-[0.98]"
      >
        {hasProgress ? `继续测试（第 ${savedPage} 页）` : '开始测试'}
      </button>
      {hasProgress && (
        <button
          onClick={() => {
            localStorage.removeItem('big-five-answers');
            localStorage.removeItem('big-five-page');
            window.location.reload();
          }}
          className="w-full py-2 text-sm text-[#8A7E6A] hover:text-[#4A3728]"
        >
          清除进度，重新开始
        </button>
      )}
    </div>
  );
}

// ── 答题页 ──────────────────────────────────────────────────────────────────

function TestingPhase({
  currentPage,
  totalPages,
  pageQuestions,
  answers,
  answeredCount,
  totalQuestions,
  isPageComplete,
  onSelect,
  onNext,
  onPrev,
}: {
  currentPage: number;
  totalPages: number;
  pageQuestions: BigFiveQuestion[];
  answers: Record<number, number>;
  answeredCount: number;
  totalQuestions: number;
  isPageComplete: boolean;
  onSelect: (qId: number, value: number) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <div className="space-y-6">
      {/* 进度条 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-[#8A7E6A]">完成进度</span>
          <span className="font-semibold text-[#C9A15A]">{answeredCount}/{totalQuestions}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#F0EBE0]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C9A15A] to-[#D4A574] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* 页码导航点 */}
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => {
            const p = i + 1;
            const isActive = p === currentPage;
            return (
              <button
                key={p}
                onClick={() => {
                  // 允许跳转到已答过的页或当前页
                  // 简化：不限制
                }}
                className={`h-2.5 rounded-full transition-all ${
                  isActive
                    ? 'w-6 bg-[#C9A15A]'
                    : 'w-2.5 bg-[#E0D8C8]'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 题目列表 */}
      <div className="space-y-4">
        {pageQuestions.map((q) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} className="rounded-2xl border border-[#E8E4DD] bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F8F2E6] text-xs font-semibold text-[#C9A15A]">
                  {q.id}
                </span>
                <p className="text-[#2F2A24] leading-relaxed">{q.text}</p>
              </div>
              <div className="ml-10 flex gap-1.5">
                {SCALE_LABELS.map((label, idx) => {
                  const value = idx + 1;
                  const isSelected = selected === value;
                  return (
                    <button
                      key={value}
                      onClick={() => onSelect(q.id, value)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-[#C9A15A] bg-[#C9A15A] text-white shadow-sm'
                          : 'border-[#E8E4DD] bg-[#FAF8F3] text-[#6A6256] hover:border-[#C9A15A] hover:bg-[#F8F2E6]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 翻页按钮 */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={onPrev}
          disabled={currentPage === 1}
          className="rounded-xl border border-[#E8E4DD] bg-white px-6 py-3 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← 上一页
        </button>
        <span className="text-sm text-[#8A7E6A]">
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={onNext}
          disabled={!isPageComplete}
          className="rounded-xl bg-[#C9A15A] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#B58A3A] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {currentPage === totalPages ? '查看结果 →' : '下一页 →'}
        </button>
      </div>
    </div>
  );
}

// ── 结果页 ──────────────────────────────────────────────────────────────────

function ResultPhase({
  result,
  onReset,
  activeTab,
  onTabChange,
}: {
  result: BigFiveTestResult;
  onReset: () => void;
  activeTab: BigFiveDimensionKey;
  onTabChange: (key: BigFiveDimensionKey) => void;
}) {
  const activeScore = result.dimensionScores.find((d) => d.key === activeTab)!;
  const activeColor = DIMENSION_COLORS[activeTab];

  return (
    <div className="space-y-6">
      {/* 结果标题 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-8 shadow-sm text-center">
        <div className="mb-2 text-4xl">⭐</div>
        <h2 className="text-2xl font-bold text-[#2F2A24]">你的大五人格画像</h2>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          测试完成于 {new Date(result.completedAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 五维度总览柱状图 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-lg font-semibold text-[#4A3728]">五维度得分</h3>
        <div className="space-y-4">
          {result.dimensionScores.map((dim) => {
            const colors = DIMENSION_COLORS[dim.key];
            return (
              <button
                key={dim.key}
                onClick={() => onTabChange(dim.key)}
                className={`w-full rounded-xl p-4 text-left transition-all ${
                  activeTab === dim.key
                    ? 'shadow-md'
                    : 'hover:bg-[#FAF8F3]'
                }`}
                style={activeTab === dim.key ? { backgroundColor: colors.light, outline: `2px solid ${colors.main}`, outlineOffset: '-2px' } : {}}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{DIMENSION_INFO[dim.key].icon}</span>
                    <span className="font-semibold text-[#2F2A24]">{dim.name}</span>
                    <span className="text-xs text-[#8A7E6A]">{dim.name_en}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold" style={{ color: colors.main }}>{dim.percentage}%</span>
                    <span className="ml-1 text-xs text-[#8A7E6A]">{dim.label}</span>
                  </div>
                </div>
                {/* 进度条 */}
                <div className="h-3 overflow-hidden rounded-full bg-[#F0EBE0]">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${dim.percentage}%`, backgroundColor: colors.main }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前维度详情 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-2xl">{DIMENSION_INFO[activeTab].icon}</span>
          <div>
            <h3 className="text-xl font-bold text-[#2F2A24]">{activeScore.name}</h3>
            <p className="text-sm text-[#8A7E6A]">{activeScore.name_en} · {activeScore.label}</p>
          </div>
        </div>

        {/* 得分 */}
        <div className="mb-4 rounded-xl p-4" style={{ backgroundColor: activeColor.light }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6A6256]">原始得分</span>
            <span className="font-bold" style={{ color: activeColor.dark }}>
              {activeScore.rawScore} / {activeScore.maxScore}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm text-[#6A6256]">百分位</span>
            <span className="font-bold" style={{ color: activeColor.dark }}>
              {activeScore.percentage}%
            </span>
          </div>
        </div>

        {/* 特征标签 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {activeScore.traits.map((trait) => (
            <span
              key={trait}
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: activeColor.light, color: activeColor.dark }}
            >
              {trait}
            </span>
          ))}
        </div>

        {/* 详细描述 */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-semibold text-[#4A3728]">📖 维度解读</h4>
            <p className="text-sm leading-relaxed text-[#6A6256]">{activeScore.description}</p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-[#4A3728]">💡 成长建议</h4>
            <p className="text-sm leading-relaxed text-[#6A6256]">{activeScore.advice}</p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-[#4A3728]">💼 职业方向</h4>
            <p className="text-sm leading-relaxed text-[#6A6256]">{activeScore.career}</p>
          </div>
        </div>
      </div>

      {/* 整体画像 */}
      {result.matchedProfiles.length > 0 && (
        <div className="rounded-2xl border border-[#E8E4DD] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-[#4A3728]">🎭 你的综合画像</h3>
          <div className="space-y-3">
            {result.matchedProfiles.map((profile, idx) => (
              <div key={idx} className="rounded-xl bg-[#F8F2E6] p-4">
                <div className="mb-1 font-semibold text-[#C9A15A]">{profile.name}</div>
                <p className="text-sm leading-relaxed text-[#6A6256]">{profile.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 温馨提示 */}
      <div className="rounded-2xl border border-[#E8E4DD] bg-[#FAF8F3] p-5 shadow-sm">
        <p className="text-xs leading-relaxed text-[#8A7E6A]">
          💡 提示：大五人格测试结果仅供参考，反映的是你在当前阶段的人格倾向。
          人格具有相对稳定性，但也会随成长而变化。如有需要，建议结合专业心理咨询进行更深入的探索。
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 rounded-xl border border-[#E8E4DD] bg-white py-3 text-sm font-medium text-[#6A6256] transition-all hover:bg-[#FAF8F3]"
        >
          重新测试
        </button>
        <Link
          href="/chapter/chapter-1"
          className="flex-1 rounded-xl bg-[#C9A15A] py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#B58A3A]"
        >
          返回章节
        </Link>
      </div>
    </div>
  );
}
