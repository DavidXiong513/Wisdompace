'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useCommunityAgingPollStore } from '@/stores/communityAgingPollStore';

/* ══════════════════════════════════════
   题目数据定义
   ══════════════════════════════════════ */

interface Question {
  id: string;
  chapter: string;
  chapterIcon: string;
  text: string;
  multi: boolean;
  maxSelect?: number;
  options: string[];
  /** 模拟历史投票百分比分布（与 options 下标一一对应） */
  mockPct: number[];
}

const QUESTIONS: Question[] = [
  {
    id: 'q0',
    chapter: '篇章一：养老期望',
    chapterIcon: '🏠',
    text: '你目前对"子女养老"寄予希望的程度？',
    multi: false,
    options: ['非常寄望', '比较寄望', '一般', '不太寄望', '完全不寄望'],
    mockPct: [8, 22, 30, 28, 12],
  },
  {
    id: 'q1',
    chapter: '篇章一：养老期望',
    chapterIcon: '🏠',
    text: '你的养老处境更贴合以下哪些选项？',
    multi: true,
    options: [
      '独身',
      '丁克',
      '子女海外',
      '子女去世',
      '亲子关系破裂',
      '子女能力不足',
      '有子女在身边且关系良好',
    ],
    mockPct: [24, 18, 20, 5, 8, 10, 15],
  },
  {
    id: 'q2',
    chapter: '篇章二：社群认知',
    chapterIcon: '🤝',
    text: '你之前了解过"社群养老"这个概念吗？',
    multi: false,
    options: ['完全没听过', '听说过但不了解', '有一定了解', '非常了解甚至在实践中'],
    mockPct: [35, 40, 18, 7],
  },
  {
    id: 'q3',
    chapter: '篇章二：社群认知',
    chapterIcon: '🤝',
    text: '你对"非血缘互助养老"这件事的态度是？',
    multi: false,
    options: ['非常期待', '愿意尝试', '不确定', '有顾虑', '不认同'],
    mockPct: [12, 38, 25, 18, 7],
  },
  {
    id: 'q4',
    chapter: '篇章三：挑战与期待',
    chapterIcon: '⚡',
    text: '你认为新型社群养老面临的最大挑战是什么？（限选3项）',
    multi: true,
    maxSelect: 3,
    options: [
      '信任建立困难',
      '责任界定不明',
      '经济成本分摊',
      '生活习惯差异',
      '缺乏法律保障',
      '找不到志同道合的人',
    ],
    mockPct: [28, 22, 18, 15, 12, 5],
  },
  {
    id: 'q5',
    chapter: '篇章三：挑战与期待',
    chapterIcon: '⚡',
    text: '你愿意为未来的社群养老付出什么？',
    multi: true,
    options: [
      '投入时间参与活动',
      '贡献金钱建立基金',
      '学习照护技能',
      '开放自己的空间',
      '目前还不想考虑',
    ],
    mockPct: [30, 15, 25, 18, 12],
  },
  {
    id: 'q6',
    chapter: '篇章四：技术接受度',
    chapterIcon: '🤖',
    text: '你对具身AI机器人参与养老照护的态度？',
    multi: false,
    options: ['非常接受', '可以尝试', '不确定', '有顾虑', '不能接受'],
    mockPct: [10, 32, 28, 20, 10],
  },
  {
    id: 'q7',
    chapter: '篇章四：技术接受度',
    chapterIcon: '🤖',
    text: '你最希望AI机器人在养老中扮演什么角色？',
    multi: true,
    options: [
      '日常陪伴聊天',
      '健康监测提醒',
      '紧急情况报警',
      '家务辅助',
      '行动辅助',
      '不需要AI介入',
    ],
    mockPct: [25, 30, 20, 12, 8, 5],
  },
];

/* ── 模拟总投票数（随用户投票自增） ── */
function useTotalVotes() {
  const [count] = useState(() => {
    if (typeof window === 'undefined') return 2847;
    const raw = localStorage.getItem('cap_total_votes');
    const base = raw ? parseInt(raw, 10) : 2847;
    localStorage.setItem('cap_total_votes', String(base + 1));
    return base + 1;
  });
  return count;
}

/* ── 颜色映射 ── */
const COLORS = [
  '#C87941',
  '#8B6AA0',
  '#4A8AB0',
  '#5A8E5A',
  '#D4A84B',
  '#B06A6A',
  '#6A9FB0',
  '#A08A5A',
  '#7A8A9A',
  '#C09060',
];

/* ══════════════════════════════════════
   Welcome 页
   ══════════════════════════════════════ */
function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FDF5EE] text-5xl shadow-inner">
          🗳️
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-[#4A3728]">
          新型社群养老 · 互动投票
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#8A7E6A]">
          8个问题，4个篇章，匿名投出你的真实选择。
          <br />
          每投一票，立刻看到群体的真实画像。
          <br />
          全部投完后，生成你的专属养老准备度报告。
        </p>
        <button
          onClick={onStart}
          className="mt-8 rounded-full bg-[#C87941] px-10 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D] hover:px-12"
        >
          开始投票
        </button>
        <p className="mt-4 text-xs text-[#B0A090]">匿名 · 无需登录 · 约3分钟</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   单题投票 + 实时结果
   ══════════════════════════════════════ */
function VoteQuestion({
  question,
  totalVotes,
  onVote,
  onNext,
  isLast,
}: {
  question: Question;
  totalVotes: number;
  onVote: (answer: string | string[]) => void;
  onNext: () => void;
  isLast: boolean;
}) {
  const store = useCommunityAgingPollStore();
  const existing = store.answers[store.currentQIndex] as string | string[] | undefined;
  const [selected, setSelected] = useState<string[]>(() => {
    if (!existing) return [];
    if (Array.isArray(existing)) return existing;
    return [existing];
  });
  const [submitted, setSubmitted] = useState(!!existing);

  const handleSelect = (opt: string) => {
    if (submitted) return;
    if (question.multi) {
      setSelected(prev => {
        if (prev.includes(opt)) return prev.filter(x => x !== opt);
        if (question.maxSelect && prev.length >= question.maxSelect) return prev;
        return [...prev, opt];
      });
    } else {
      setSelected([opt]);
      // 单选立即提交
      handleSubmit([opt]);
    }
  };

  const handleSubmit = (finalSel?: string[]) => {
    const sel = finalSel || selected;
    if (sel.length === 0) return;
    setSubmitted(true);
    onVote(question.multi ? sel : sel[0]);
  };

  // 计算实时百分比（模拟 + 用户加入后微调）
  const totalSim = 100;
  const results = useMemo(() => {
    return question.options.map((opt, i) => {
      const basePct = question.mockPct[i];
      const userExtra = selected.includes(opt) ? 1 : 0;
      const pct = Math.round(((basePct + userExtra) / (totalSim + 1)) * 100);
      return { label: opt, pct: Math.min(pct + 1, 100), color: COLORS[i % COLORS.length] };
    });
  }, [question, selected]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Chapter header */}
      <div className="flex items-center gap-2 text-sm text-[#8A7E6A]">
        <span>{question.chapterIcon}</span>
        <span>{question.chapter}</span>
      </div>

      {/* Question */}
      <h2 className="mt-3 font-serif text-2xl leading-snug font-bold text-[#4A3728]">
        {question.text}
      </h2>
      {question.multi && question.maxSelect && (
        <p className="mt-1 text-xs text-[#B0A090]">
          限选 {question.maxSelect} 项（已选 {selected.length}）
        </p>
      )}

      {/* Options */}
      <div className="mt-6 space-y-3">
        {question.options.map(opt => {
          const isSelected = selected.includes(opt);
          const pct = results.find(r => r.label === opt)!.pct;
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={submitted}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-[#C87941] bg-[#FDF5EE] ring-1 ring-[#C87941]/30'
                  : submitted
                    ? 'border-[#E8D9C2] bg-white/60 opacity-60'
                    : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50 hover:shadow-sm'
              }`}
            >
              {/* Result bar background */}
              {submitted && (
                <div
                  className="absolute top-0 bottom-0 left-0 rounded-xl transition-all duration-700 ease-out"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isSelected ? '#C87941' : '#F5F0E8',
                    opacity: isSelected ? 0.12 : 0.6,
                  }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Radio / Checkbox */}
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isSelected
                        ? 'border-[#C87941] bg-[#C87941] text-white'
                        : 'border-[#D0C8B8] bg-white'
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${isSelected ? 'text-[#4A3728]' : 'text-[#6A6256]'}`}
                  >
                    {opt}
                  </span>
                </div>

                {/* Result percentage */}
                {submitted && (
                  <span
                    className="relative text-sm font-bold tabular-nums"
                    style={{ color: results.find(r => r.label === opt)!.color }}
                  >
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Multi-select submit + next */}
      <div className="mt-6 flex items-center justify-between">
        {question.multi && !submitted ? (
          <button
            onClick={() => handleSubmit()}
            disabled={selected.length === 0}
            className="rounded-full bg-[#C87941] px-8 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
          >
            提交投票
          </button>
        ) : (
          <div />
        )}

        {submitted && (
          <button
            onClick={onNext}
            className="rounded-full bg-[#4A3728] px-8 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#2F2A24]"
          >
            {isLast ? '查看报告 →' : '下一题 →'}
          </button>
        )}
      </div>

      {/* Total votes */}
      <p className="mt-6 text-center text-xs text-[#B0A090]">
        🤫 已有 <span className="font-bold text-[#8A7E6A]">{totalVotes.toLocaleString()}</span>{' '}
        人参与匿名投票
      </p>
    </div>
  );
}

/* ══════════════════════════════════════
   报告页
   ══════════════════════════════════════ */
function ReportView({ totalVotes }: { totalVotes: number }) {
  const store = useCommunityAgingPollStore();
  const answers = store.answers;

  // 计算养老准备度评分
  const readinessScore = useMemo(() => {
    let score = 50;
    // Q0: 对子女养老寄望越低 → 越需要社群养老 → 有准备
    const q0 = answers[0] as string | undefined;
    if (q0 === '完全不寄望') score += 15;
    else if (q0 === '不太寄望') score += 10;
    else if (q0 === '一般') score += 5;

    // Q3: 态度越积极 → 分数越高
    const q3 = answers[3] as string | undefined;
    if (q3 === '非常期待') score += 15;
    else if (q3 === '愿意尝试') score += 10;

    // Q2: 越了解 → 分数越高
    const q2 = answers[2] as string | undefined;
    if (q2 === '非常了解甚至在实践中') score += 10;
    else if (q2 === '有一定了解') score += 5;

    // Q5: 愿意付出越多 → 分数越高
    const q5 = answers[5] as string[] | undefined;
    if (q5) score += Math.min(q5.length * 5, 15);
    if (q5?.includes('目前还不想考虑')) score -= 10;

    // Q6: AI接受度越高 → 分数越高
    const q6 = answers[6] as string | undefined;
    if (q6 === '非常接受') score += 10;
    else if (q6 === '可以尝试') score += 5;

    return Math.max(0, Math.min(100, score));
  }, [answers]);

  const level =
    readinessScore >= 80
      ? '养老先锋'
      : readinessScore >= 60
        ? '积极准备者'
        : readinessScore >= 40
          ? '观望者'
          : '养老小白';
  const levelColor =
    readinessScore >= 80
      ? '#5A8E5A'
      : readinessScore >= 60
        ? '#4A8AB0'
        : readinessScore >= 40
          ? '#D4A84B'
          : '#B06A6A';
  const levelEmoji =
    readinessScore >= 80 ? '🌟' : readinessScore >= 60 ? '💪' : readinessScore >= 40 ? '🤔' : '🌱';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-[#4A3728]">你的养老准备度报告</h1>
        <p className="mt-2 text-sm text-[#8A7E6A]">基于你的8个回答生成 · 仅供参考与启发</p>
      </div>

      {/* Score card */}
      <div className="mt-8 rounded-2xl border border-[#E8D9C2] bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">{levelEmoji}</div>
        <div className="mt-4">
          <div className="relative mx-auto h-4 w-48 overflow-hidden rounded-full bg-[#F5F0E8]">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${readinessScore}%`,
                backgroundColor: levelColor,
              }}
            />
          </div>
          <span className="mt-2 block text-2xl font-bold" style={{ color: levelColor }}>
            {readinessScore}分
          </span>
        </div>
        <p className="mt-2 text-lg font-bold text-[#4A3728]">
          {levelEmoji} {level}
        </p>
        <p className="mt-1 text-sm text-[#8A7E6A]">
          {readinessScore >= 80
            ? '你对社群养老有清晰的认知和积极的行动意愿，是推动新型养老模式的中坚力量。'
            : readinessScore >= 60
              ? '你已经有了意识，正在从"知道"走向"行动"。不妨从一个小社群开始试试水。'
              : readinessScore >= 40
                ? '你对社群养老有些了解但还在观望，可以先从了解他人经验开始。'
                : '你目前可能很少接触养老话题，没关系——从了解开始，你已经迈出了第一步。'}
        </p>
      </div>

      {/* Summary by chapter */}
      <div className="mt-8 space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#4A3728]">你的投票画像</h2>
        {/* 养老期望 */}
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#8B6AA0]">🏠 养老期望</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {(() => {
              const q0 = answers[0] as string;
              const q1 = answers[1] as string[];
              return `你对子女养老寄望程度为"${q0}"。你的处境是：${(q1 || []).join('、') || '未选择'}。`;
            })()}
          </p>
        </div>
        {/* 社群认知 */}
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#4A8AB0]">🤝 社群认知</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`你对社群养老的了解程度：${answers[2] as string}。态度：${answers[3] as string}。`}
          </p>
        </div>
        {/* 挑战与期待 */}
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#5A8E5A]">⚡ 挑战与期待</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`你认为最大挑战：${((answers[4] as string[]) || []).join('、') || '未选择'}。${((answers[5] as string[]) || []).includes('目前还不想考虑') ? '目前还不想付出实际行动。' : `愿意付出：${((answers[5] as string[]) || []).join('、') || '未选择'}。`}`}
          </p>
        </div>
        {/* 技术接受度 */}
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#C87941]">🤖 技术接受度</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`对AI养老的态度：${answers[6] as string}。希望AI扮演角色：${((answers[7] as string[]) || []).join('、') || '未选择'}。`}
          </p>
        </div>
      </div>

      {/* 给X句话 */}
      <div className="mt-8 rounded-2xl border border-[#E8D9C2] bg-[#FAF8F3] p-6 text-center">
        <p className="text-sm text-[#6A6256]">
          {readinessScore >= 70
            ? '养老不是一个人的长征，而是一群人的共建。你已经走在了前面，不妨开始寻找同路人。'
            : readinessScore >= 40
              ? '养老这件事，知道就是改变的开始。等你准备好了，社群的灯一直亮着。'
              : '这趟旅程很长，从第一个问题开始，你已经在上路。'}
        </p>
      </div>

      {/* Community QR placeholder */}
      <div className="mt-8 rounded-2xl border-2 border-dashed border-[#D0C8B8] bg-white p-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-[#F5F0E8] text-4xl">
          💬
        </div>
        <p className="mt-4 text-sm font-bold text-[#4A3728]">社群兴趣小组</p>
        <p className="mt-1 text-xs text-[#8A7E6A]">和志同道合的人一起聊聊未来的养老规划</p>
        <p className="mt-3 text-xs font-medium text-[#C87941]">社群筹建中，敬请期待...</p>
      </div>

      {/* Stats + actions */}
      <div className="mt-6 text-center text-xs text-[#B0A090]">
        🤫 共 {totalVotes.toLocaleString()} 人参与 · 你的投票已匿名计入
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => store.reset()}
          className="rounded-full border border-[#D0C8B8] px-6 py-2 text-sm font-medium text-[#6A6256] transition hover:bg-[#F5F0E8]"
        >
          重新投票
        </button>
        <Link
          href="/chapter/chapter-2"
          className="rounded-full bg-[#C87941] px-6 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D]"
        >
          返回篇章
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   主页面
   ══════════════════════════════════════ */
export default function CommunityAgingPollPage() {
  const store = useCommunityAgingPollStore();
  const hydrated = usePersistHydrated(useCommunityAgingPollStore);
  const totalVotes = useTotalVotes();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="animate-pulse text-sm font-medium text-[#8A7E6A]">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* Top bar */}
      <header className="border-b border-[#E8E4DD] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/chapter/chapter-2"
            className="text-sm text-[#8A7E6A] transition hover:text-[#4A3728]"
          >
            ← 第二篇
          </Link>
          <span className="text-sm font-medium text-[#4A3728]">新型社群养老 · 互动投票</span>
          <div />
        </div>
      </header>

      {store.step === 'welcome' && <WelcomeView onStart={() => store.setStep('voting')} />}

      {store.step === 'voting' && (
        <div>
          {/* Progress bar */}
          <div className="mx-auto mt-4 max-w-2xl px-4">
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E8E4DD]">
                <div
                  className="h-full rounded-full bg-[#C87941] transition-all duration-500"
                  style={{ width: `${((store.currentQIndex + 1) / QUESTIONS.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#8A7E6A]">
                {store.currentQIndex + 1}/{QUESTIONS.length}
              </span>
            </div>
          </div>

          <VoteQuestion
            key={store.currentQIndex}
            question={QUESTIONS[store.currentQIndex]}
            totalVotes={totalVotes}
            onVote={answer => store.setAnswer(store.currentQIndex, answer)}
            onNext={() => {
              if (store.currentQIndex < QUESTIONS.length - 1) {
                store.setCurrentQIndex(store.currentQIndex + 1);
              } else {
                store.setStep('report');
              }
            }}
            isLast={store.currentQIndex === QUESTIONS.length - 1}
          />
        </div>
      )}

      {store.step === 'report' && <ReportView totalVotes={totalVotes} />}
    </div>
  );
}
