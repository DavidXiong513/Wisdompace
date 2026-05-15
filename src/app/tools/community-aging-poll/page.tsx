'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePersistHydrated } from '@/lib/hooks/usePersistHydrated';
import { useCommunityAgingPollStore } from '@/stores/communityAgingPollStore';

/* ── 匿名 session ID ── */
function useSessionId(): string {
  const [sid] = useState(() => {
    if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000000';
    const key = 'cap_session_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    return id;
  });
  return sid;
}

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
}

const QUESTIONS: Question[] = [
  {
    id: 'q0',
    chapter: '\u7BC7\u7AE0\u4E00\uFF1A\u517B\u8001\u671F\u671B',
    chapterIcon: '\u{1F3E0}',
    text: '\u4F60\u76EE\u524D\u5BF9\u201C\u5B50\u5973\u517B\u8001\u201D\u5BC4\u4E88\u5E0C\u671B\u7684\u7A0B\u5EA6\uFF1F',
    multi: false,
    options: [
      '\u975E\u5E38\u5BC4\u671B',
      '\u6BD4\u8F83\u5BC4\u671B',
      '\u4E00\u822C',
      '\u4E0D\u592A\u5BC4\u671B',
      '\u5B8C\u5168\u4E0D\u5BC4\u671B',
    ],
  },
  {
    id: 'q1',
    chapter: '\u7BC7\u7AE0\u4E00\uFF1A\u517B\u8001\u671F\u671B',
    chapterIcon: '\u{1F3E0}',
    text: '\u4F60\u7684\u517B\u8001\u5904\u5883\u66F4\u8D34\u5408\u4EE5\u4E0B\u54EA\u4E9B\u9009\u9879\uFF1F',
    multi: true,
    options: [
      '\u72EC\u8EAB',
      '\u4E01\u514B',
      '\u5B50\u5973\u6D77\u5916',
      '\u5B50\u5973\u53BB\u4E16',
      '\u4EB2\u5B50\u5173\u7CFB\u7834\u88C2',
      '\u5B50\u5973\u80FD\u529B\u4E0D\u8DB3',
      '\u6709\u5B50\u5973\u5728\u8EAB\u8FB9\u4E14\u5173\u7CFB\u826F\u597D',
    ],
  },
  {
    id: 'q2',
    chapter: '\u7BC7\u7AE0\u4E8C\uFF1A\u793E\u7FA4\u8BA4\u77E5',
    chapterIcon: '\u{1F91D}',
    text: '\u4F60\u4E4B\u524D\u4E86\u89E3\u8FC7\u201C\u793E\u7FA4\u517B\u8001\u201D\u8FD9\u4E2A\u6982\u5FF5\u5417\uFF1F',
    multi: false,
    options: [
      '\u5B8C\u5168\u6CA1\u542C\u8FC7',
      '\u542C\u8BF4\u8FC7\u4F46\u4E0D\u4E86\u89E3',
      '\u6709\u4E00\u5B9A\u4E86\u89E3',
      '\u975E\u5E38\u4E86\u89E3\u751A\u81F3\u5728\u5B9E\u8DF5\u4E2D',
    ],
  },
  {
    id: 'q3',
    chapter: '\u7BC7\u7AE0\u4E8C\uFF1A\u793E\u7FA4\u8BA4\u77E5',
    chapterIcon: '\u{1F91D}',
    text: '\u4F60\u5BF9\u201C\u975E\u8840\u7F18\u4E92\u52A9\u517B\u8001\u201D\u8FD9\u4EF6\u4E8B\u7684\u6001\u5EA6\u662F\uFF1F',
    multi: false,
    options: [
      '\u975E\u5E38\u671F\u5F85',
      '\u613F\u610F\u5C1D\u8BD5',
      '\u4E0D\u786E\u5B9A',
      '\u6709\u987E\u8651',
      '\u4E0D\u8BA4\u540C',
    ],
  },
  {
    id: 'q4',
    chapter: '\u7BC7\u7AE0\u4E09\uFF1A\u6311\u6218\u4E0E\u671F\u5F85',
    chapterIcon: '\u26A1',
    text: '\u4F60\u8BA4\u4E3A\u65B0\u578B\u793E\u7FA4\u517B\u8001\u9762\u4E34\u7684\u6700\u5927\u6311\u6218\u662F\u4EC0\u4E48\uFF1F\uFF08\u9650\u90093\u9879\uFF09',
    multi: true,
    maxSelect: 3,
    options: [
      '\u4FE1\u4EFB\u5EFA\u7ACB\u56F0\u96BE',
      '\u8D23\u4EFB\u754C\u5B9A\u4E0D\u660E',
      '\u7ECF\u6D4E\u6210\u672C\u5206\u644A',
      '\u751F\u6D3B\u4E60\u60EF\u5DEE\u5F02',
      '\u7F3A\u4E4F\u6CD5\u5F8B\u4FDD\u969C',
      '\u627E\u4E0D\u5230\u5FD7\u540C\u9053\u5408\u7684\u4EBA',
    ],
  },
  {
    id: 'q5',
    chapter: '\u7BC7\u7AE0\u4E09\uFF1A\u6311\u6218\u4E0E\u671F\u5F85',
    chapterIcon: '\u26A1',
    text: '\u4F60\u613F\u610F\u4E3A\u672A\u6765\u7684\u793E\u7FA4\u517B\u8001\u4ED8\u51FA\u4EC0\u4E48\uFF1F',
    multi: true,
    options: [
      '\u6295\u5165\u65F6\u95F4\u53C2\u4E0E\u6D3B\u52A8',
      '\u8D21\u732E\u91D1\u94B1\u5EFA\u7ACB\u57FA\u91D1',
      '\u5B66\u4E60\u7167\u62A4\u6280\u80FD',
      '\u5F00\u653E\u81EA\u5DF1\u7684\u7A7A\u95F4',
      '\u76EE\u524D\u8FD8\u4E0D\u60F3\u8003\u8651',
    ],
  },
  {
    id: 'q6',
    chapter: '\u7BC7\u7AE0\u56DB\uFF1A\u6280\u672F\u63A5\u53D7\u5EA6',
    chapterIcon: '\u{1F916}',
    text: '\u4F60\u5BF9\u5177\u8EABAI\u673A\u5668\u4EBA\u53C2\u4E0E\u517B\u8001\u7167\u62A4\u7684\u6001\u5EA6\uFF1F',
    multi: false,
    options: [
      '\u975E\u5E38\u63A5\u53D7',
      '\u53EF\u4EE5\u5C1D\u8BD5',
      '\u4E0D\u786E\u5B9A',
      '\u6709\u987E\u8651',
      '\u4E0D\u80FD\u63A5\u53D7',
    ],
  },
  {
    id: 'q7',
    chapter: '\u7BC7\u7AE0\u56DB\uFF1A\u6280\u672F\u63A5\u53D7\u5EA6',
    chapterIcon: '\u{1F916}',
    text: '\u4F60\u6700\u5E0C\u671BAI\u673A\u5668\u4EBA\u5728\u517B\u8001\u4E2D\u626E\u6F14\u4EC0\u4E48\u89D2\u8272\uFF1F',
    multi: true,
    options: [
      '\u65E5\u5E38\u966A\u4F34\u804A\u5929',
      '\u5065\u5EB7\u76D1\u6D4B\u63D0\u9192',
      '\u7D27\u6025\u60C5\u51B5\u62A5\u8B66',
      '\u5BB6\u52A1\u8F85\u52A9',
      '\u884C\u52A8\u8F85\u52A9',
      '\u4E0D\u9700\u8981AI\u4ECB\u5165',
    ],
  },
];

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
}: {
  aggregates: Record<string, { label: string; count: number; pct: number }[]>;
  totalVotes: number;
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

  // 1) Check if session already voted + fetch aggregates
  const init = useCallback(async () => {
    setLoading(true);
    try {
      const [aggRes, voteRes] = await Promise.all([
        fetch(`/api/poll/aggregates?tool_id=community-aging-poll`),
        fetch(`/api/poll/vote-check?session_id=${sessionId}&tool_id=community-aging-poll`),
      ]);
      const aggData = await aggRes.json();
      const voteData = await voteRes.json();

      if (aggData.data) {
        const grouped: Record<string, { label: string; count: number; pct: number }[]> = {};
        for (const row of aggData.data.aggregates) {
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
        setTotalVotes(aggData.data.total_votes || 0);
      }

      if (voteData.exists && voteData.data) {
        setAlreadyVoted(true);
        store.setStep('report');
        store.setAnswers(voteData.data.answers);
      }
    } catch (err) {
      console.error('Init error:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (hydrated) init();
  }, [hydrated, init]);

  // 2) Submit vote to Supabase
  const submitVote = useCallback(async () => {
    setSubmitting(true);
    const score = calcScore(store.answers);
    try {
      const res = await fetch('/api/poll/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_id: 'community-aging-poll',
          session_id: sessionId,
          answers: store.answers,
          readiness_score: score,
        }),
      });
      if (res.ok) {
        store.setSynced(true);
        store.setStep('report');
      } else if (res.status === 409) {
        // Already voted, just go to report
        store.setSynced(true);
        store.setStep('report');
      } else {
        console.error('Vote submit failed');
        // Still allow going to report even if sync fails
        store.setStep('report');
      }
    } catch (err) {
      console.error('Vote error:', err);
      store.setStep('report');
    } finally {
      setSubmitting(false);
    }
  }, [sessionId, store]);

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

      {isReporting && <ReportView aggregates={aggregates} totalVotes={totalVotes} />}
    </div>
  );
}
