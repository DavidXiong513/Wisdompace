'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useCommunityAgingPollStore } from '@/stores/communityAgingPollStore';
import {
  POLL_QUESTIONS as QUESTIONS,
  type PollQuestion as Question,
} from '@/data/community-aging-poll/questions';
import { formatVoteDate } from '@/lib/poll-format';
import { usePollSessionId as useSessionId } from '@/lib/poll-client';

/* ══════════════════════════════════════
   题目数据见 @/data/community-aging-poll/questions
   ══════════════════════════════════════ */



/* ── 工具函数 ── */
function calcScore(answers: Record<number, string | string[]>): number {
  let s = 50;
  const q0 = answers[0] as string | undefined;
  if (q0 === '完全不寄望') s += 15;
  else if (q0 === '不太寄望') s += 10;
  else if (q0 === '一般') s += 5;

  const q3 = answers[3] as string | undefined;
  if (q3 === '非常期待') s += 15;
  else if (q3 === '愿意尝试') s += 10;

  const q2 = answers[2] as string | undefined;
  if (q2 === '非常了解甚至在实践中') s += 10;
  else if (q2 === '有一定了解') s += 5;

  const q5 = answers[5] as string[] | undefined;
  if (q5) s += Math.min(q5.length * 5, 15);
  if (q5?.includes('目前还不想考虑')) s -= 10;

  const q6 = answers[6] as string | undefined;
  if (q6 === '非常接受') s += 10;
  else if (q6 === '可以尝试') s += 5;

  return Math.max(0, Math.min(100, s));
}

/* ══════════════════════════════════════
   Welcome
   ══════════════════════════════════════ */
function WelcomeView({ onStart, loading }: { onStart: () => void; loading: boolean }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#FDF5EE] text-5xl shadow-inner">
          {'\u{1F5F3}'}\uFE0F
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-[#4A3728]">
          新型社群养老 · 互动投票
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#8A7E6A]">
          8个问题，4个篇章，匿名投出你的真实选择。
          <br />
          全部投完后，生成你的专属养老准备度报告。
          <br />
          你的投票将匿名计入真实数据。
        </p>
        <button
          onClick={onStart}
          disabled={loading}
          className="mt-8 rounded-full bg-[#C87941] px-10 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D] hover:px-12 disabled:opacity-50"
        >
          {loading ? '加载中...' : '开始投票'}
        </button>
        <p className="mt-4 text-xs text-[#B0A090]">匿名 无登录 约3分钟</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   单题投票
   ══════════════════════════════════════ */
function VoteQuestion({
  question,
  onVote,
  onNext,
  isLast,
  submitting,
  nextLabel,
}: {
  question: Question;
  onVote: (answer: string | string[]) => void;
  onNext: () => void;
  isLast: boolean;
  submitting: boolean;
  nextLabel: string;
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
    if (submitted || submitting) return;
    if (question.multi) {
      setSelected(prev => {
        if (prev.includes(opt)) return prev.filter(x => x !== opt);
        if (question.maxSelect && prev.length >= question.maxSelect) return prev;
        return [...prev, opt];
      });
    } else {
      setSelected([opt]);
      handleSubmit([opt]);
    }
  };

  const handleSubmit = (finalSel?: string[]) => {
    const sel = finalSel || selected;
    if (sel.length === 0) return;
    setSubmitted(true);
    onVote(question.multi ? sel : sel[0]);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center gap-2 text-sm text-[#8A7E6A]">
        <span>{question.chapterIcon}</span>
        <span>{question.chapter}</span>
      </div>
      <h2 className="mt-3 font-serif text-2xl leading-snug font-bold text-[#4A3728]">
        {question.text}
      </h2>
      {question.multi && question.maxSelect && (
        <p className="mt-1 text-xs text-[#B0A090]">
          限选 {question.maxSelect} 项（已选 {selected.length}）
        </p>
      )}
      <div className="mt-6 space-y-3">
        {question.options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={submitted || submitting}
              className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-[#C87941] bg-[#FDF5EE] ring-1 ring-[#C87941]/30'
                  : submitted
                    ? 'border-[#E8D9C2] bg-white/60 opacity-60'
                    : 'border-[#E8D9C2] bg-white hover:border-[#C87941]/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? 'border-[#C87941] bg-[#C87941] text-white'
                      : 'border-[#D0C8B8] bg-white'
                  }`}
                >
                  {isSelected && (
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {submitted && isSelected && (
                  <span className="ml-auto text-xs font-medium text-[#C87941]">已选择</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-between">
        {question.multi && !submitted ? (
          <button
            onClick={() => handleSubmit()}
            disabled={selected.length === 0 || submitting}
            className="rounded-full bg-[#C87941] px-8 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? '提交中...' : '提交投票'}
          </button>
        ) : (
          <div />
        )}
        {submitted && (
          <button
            onClick={onNext}
            disabled={submitting}
            className="rounded-full bg-[#4A3728] px-8 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#2F2A24]"
          >
            {submitting ? '同步中...' : nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   报告页
   ══════════════════════════════════════ */
function ReportView({
  aggregates,
  totalVotes,
  votedAt,
}: {
  aggregates: Record<string, { label: string; count: number; pct: number }[]>;
  totalVotes: number;
  votedAt: string | null;
}) {
  const store = useCommunityAgingPollStore();
  const answers = store.answers;
  const readinessScore = useMemo(() => calcScore(answers), [answers]);

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
    readinessScore >= 80
      ? '\u{1F31F}'
      : readinessScore >= 60
        ? '\u{1F4AA}'
        : readinessScore >= 40
          ? '\u{1F914}'
          : '\u{1F331}';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-[#4A3728]">你的养老准备度报告</h1>
        <p className="mt-2 text-sm text-[#8A7E6A]">基于你的8个回答生成 · 已匿名计入真实数据</p>
      </div>

      {/* Score */}
      <div className="mt-8 rounded-2xl border border-[#E8D9C2] bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">{levelEmoji}</div>
        <div className="mt-4">
          <div className="relative mx-auto h-4 w-48 overflow-hidden rounded-full bg-[#F5F0E8]">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${readinessScore}%`, backgroundColor: levelColor }}
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
            ? '你对社群养老有清晰的认知和积极的行动意愿。'
            : readinessScore >= 60
              ? '你已经有了意识，正在从"知道"走向"行动"。'
              : readinessScore >= 40
                ? '你有些了解但还在观望，可以从了解他人经验开始。'
                : '没关系，从了解开始，你已经迈出了第一步。'}
        </p>
      </div>

      {/* Aggregates section */}
      <div className="mt-8">
        <h2 className="font-serif text-xl font-bold text-[#4A3728]">投票结果 · 真实数据</h2>
        <p className="mt-1 text-xs text-[#B0A090]">{totalVotes.toLocaleString()} 人已参与</p>
        {[0, 2, 3, 4, 5, 6, 7]
          .filter(i => aggregates[i])
          .map(qi => (
            <div key={qi} className="mt-4 rounded-xl border border-[#E8D9C2] bg-white p-5">
              <p className="text-sm font-medium text-[#4A3728]">{QUESTIONS[qi].text}</p>
              <div className="mt-3 space-y-2">
                {aggregates[qi].map(item => {
                  const maxPct = Math.max(...aggregates[qi].map(x => x.pct));
                  const isMax = item.pct === maxPct && maxPct > 0;
                  return (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-28 shrink-0 truncate text-xs text-[#6A6256]">
                        {item.label}
                      </span>
                      <div className="h-5 flex-1 overflow-hidden rounded-full bg-[#F5F0E8]">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${item.pct}%`,
                            backgroundColor: isMax ? '#C87941' : '#D0C8B8',
                          }}
                        />
                      </div>
                      <span className="w-14 text-right text-xs font-bold text-[#6A6256] tabular-nums">
                        {item.pct}%
                      </span>
                      <span className="w-10 text-right text-[10px] text-[#B0A090]">
                        {item.count}票
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>

      {/* User's own answers */}
      <div className="mt-8 space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#4A3728]">你的投票画像</h2>
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#8B6AA0]">{'\u{1F3E0}'} 养老期望</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`你对子女养老寄望程度为"${answers[0] as string}"。你的处境是：${((answers[1] as string[]) || []).join('、') || '未选择'}。`}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#4A8AB0]">{'\u{1F91D}'} 社群认知</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`你对社群养老的了解程度：${answers[2] as string}。态度：${answers[3] as string}。`}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#5A8E5A]">{'\u26A1'} 挑战与期待</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`你认为最大挑战：${((answers[4] as string[]) || []).join('、') || '未选择'}。${
              ((answers[5] as string[]) || []).includes('目前还不想考虑')
                ? '目前还不想付出实际行动。'
                : `愿意付出：${((answers[5] as string[]) || []).join('、') || '未选择'}。`
            }`}
          </p>
        </div>
        <div className="rounded-xl border border-[#E8D9C2] bg-white p-5">
          <p className="text-sm font-bold text-[#C87941]">{'\u{1F916}'} 技术接受度</p>
          <p className="mt-1 text-sm text-[#6A6256]">
            {`对AI养老的态度：${answers[6] as string}。希望AI扮演角色：${((answers[7] as string[]) || []).join('、') || '未选择'}。`}
          </p>
        </div>
      </div>

      {/* Community QR + actions */}
      <div className="mt-8 rounded-2xl border-2 border-dashed border-[#D0C8B8] bg-white p-8 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-xl bg-[#F5F0E8] text-4xl">
          {'\u{1F4AC}'}
        </div>
        <p className="mt-4 text-sm font-bold text-[#4A3728]">社群兴趣小组</p>
        <p className="mt-1 text-xs text-[#8A7E6A]">和志同道合的人一起聊聊未来的养老规划</p>
        <p className="mt-3 text-xs font-medium text-[#C87941]">社群筹建中，敬请期待</p>
      </div>

      {/* 投票留痕 */}
      <div className="mt-8 rounded-xl border border-[#E8D9C2] bg-white px-5 py-4 text-center">
        {votedAt ? (
          <>
            <p className="text-sm text-[#5A4A3A]">
              你于{' '}
              <span className="font-bold text-[#C87941]">
                {formatVoteDate(votedAt)}
              </span>{' '}
              参加过这次投票
            </p>
            <p className="mt-1 text-xs text-[#8A7E6A]">
              当前共 {totalVotes} 人参与 · 投票记录仅自己可见
            </p>
          </>
        ) : (
          <p className="text-sm text-[#8A7E6A]">
            本次投票未成功同步到服务器，仅保存在本机
          </p>
        )}
        <Link
          href="/tools/community-aging-poll/history"
          className="mt-3 inline-block text-xs font-bold text-[#C87941] transition hover:underline"
        >
          查看我的投票记录 →
        </Link>
      </div>

      <div className="mt-6 flex justify-center gap-4">
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
  const sessionId = useSessionId();

  const [submitting, setSubmitting] = useState(false);
  const [aggregates, setAggregates] = useState<
    Record<string, { label: string; count: number; pct: number }[]>
  >({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [votedAt, setVotedAt] = useState<string | null>(null);

  // 拉取聚合数据（首次进入与被动的重新投票后都可复用）
  const loadAggregates = useCallback(async () => {
    try {
      const res = await fetch('/api/poll/aggregates?tool_id=community-aging-poll');
      const json = (await res.json()) as {
        data?: {
          aggregates: { question_index: number; option_label: string; count: number }[];
          total_votes: number;
        };
      };
      if (!json.data) return;

      const grouped: Record<string, { label: string; count: number; pct: number }[]> = {};
      for (const row of json.data.aggregates) {
        const qi = String(row.question_index);
        if (!grouped[qi]) grouped[qi] = [];
        grouped[qi].push({ label: row.option_label, count: row.count, pct: 0 });
      }
      // Calculate percentages
      for (const qi of Object.keys(grouped)) {
        const total = grouped[qi].reduce((s, x) => s + x.count, 0);
        grouped[qi] = grouped[qi].map(x => ({
          ...x,
          pct: total > 0 ? Math.round((x.count / total) * 100) : 0,
        }));
      }
      setAggregates(grouped);
      setTotalVotes(json.data.total_votes || 0);
    } catch (err) {
      console.error('Load aggregates error:', err);
    }
  }, []);

  // 1) Check if session already voted + fetch aggregates
  const init = useCallback(async () => {
    setLoading(true);
    try {
      const voteRes = await fetch(
        `/api/poll/vote-check?session_id=${sessionId}&tool_id=community-aging-poll`
      );
      const voteData = await voteRes.json();
      await loadAggregates();

      if (voteData.exists && voteData.data) {
        setAlreadyVoted(true);
        setVotedAt(voteData.data.created_at ?? null);
        // 用 getState 取 action，而不是闭包里的 store：
        // store 每次 setState 都是新引用，放进依赖会让 init 反复重建 → effect 无限重跑
        const { setStep, setAnswers } = useCommunityAgingPollStore.getState();
        setStep('report');
        setAnswers(voteData.data.answers);
      }
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId, loadAggregates]);

  // 初始化只跑一次，避免任何依赖抖动导致重复请求
  const initRef = React.useRef(false);
  useEffect(() => {
    if (!hydrated || initRef.current) return;
    initRef.current = true;
    void init();
  }, [hydrated, init]);

  // 2) Submit vote to Supabase
  const submitVote = useCallback(async () => {
    setSubmitting(true);
    const storeState = useCommunityAgingPollStore.getState();
    const score = calcScore(storeState.answers);
    try {
      const res = await fetch('/api/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: 'community-aging-poll',
          session_id: sessionId,
          answers: storeState.answers,
          readiness_score: score,
        }),
      });
      if (res.ok) {
        storeState.setSynced(true);
        setVotedAt(new Date().toISOString());
        storeState.setStep('report');
        void loadAggregates();
      } else if (res.status === 409) {
        // 已投过票：回查一次拿到真实时间，别让页面显示“未同步”
        storeState.setSynced(true);
        try {
          const vr = await fetch(
            `/api/poll/vote-check?session_id=${sessionId}&tool_id=community-aging-poll`
          );
          const vd = await vr.json();
          if (vd.exists && vd.data?.created_at) setVotedAt(vd.data.created_at);
        } catch {
          // 拿不到时间就不显示，不影响进入报告
        }
        storeState.setStep('report');
      } else {
        console.error('Vote submit failed');
        // Still allow going to report even if sync fails
        storeState.setStep('report');
      }
    } catch (err) {
      console.error('Vote error:', err);
      useCommunityAgingPollStore.getState().setStep('report');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, loadAggregates]);

  // 3) Handle completing all questions
  const handleAllComplete = useCallback(() => {
    submitVote();
  }, [submitVote]);

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F0E8]">
        <div className="animate-pulse text-sm font-medium text-[#8A7E6A]">加载中...</div>
      </div>
    );
  }

  const isReporting =
    store.step === 'report' || (store.step === 'voting' && store.currentQIndex >= QUESTIONS.length);

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <header className="border-b border-[#E8E4DD] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/chapter/chapter-2"
            className="text-sm text-[#8A7E6A] transition hover:text-[#4A3728]"
          >
            {'\u2190'} 第二篇
          </Link>
          <span className="text-sm font-medium text-[#4A3728]">新型社群养老 互动投票</span>
          <div />
        </div>
      </header>

      {store.step === 'welcome' && !alreadyVoted && (
        <WelcomeView onStart={() => store.setStep('voting')} loading={false} />
      )}

      {store.step === 'voting' && !alreadyVoted && (
        <div>
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
            onVote={answer => store.setAnswer(store.currentQIndex, answer)}
            onNext={() => {
              if (store.currentQIndex < QUESTIONS.length - 1) {
                store.setCurrentQIndex(store.currentQIndex + 1);
              } else {
                handleAllComplete();
              }
            }}
            isLast={store.currentQIndex === QUESTIONS.length - 1}
            submitting={submitting}
            nextLabel={
              store.currentQIndex === QUESTIONS.length - 1
                ? submitting
                  ? '同步中...'
                  : '查看报告 →'
                : '下一题 →'
            }
          />
        </div>
      )}

      {isReporting && (
        <ReportView
          aggregates={aggregates}
          totalVotes={totalVotes}
          votedAt={votedAt}
        />
      )}
    </div>
  );
}
