'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCommunityAgingPollStore } from '@/stores/communityAgingPollStore';
import { formatVoteDate, formatRelativeTime } from '@/lib/poll-format';
import { POLL_TOOL_ID, usePollSessionId } from '@/lib/poll-client';

interface HistoryRow {
  id: string;
  created_at: string;
  readiness_score: number;
  answers: Record<string, string | string[]>;
}

interface HistoryResponse {
  data?: HistoryRow[];
  scope?: 'account' | 'anonymous';
  email?: string | null;
  error?: string;
}

function scoreLabel(score: number): string {
  if (score >= 80) return '养老先锋';
  if (score >= 60) return '积极准备者';
  if (score >= 40) return '观望者';
  return '养老小白';
}

export default function PollHistoryPage() {
  const router = useRouter();
  const store = useCommunityAgingPollStore();
  const sessionId = usePollSessionId();

  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [scope, setScope] = useState<'account' | 'anonymous'>('anonymous');
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/poll/history?tool_id=${POLL_TOOL_ID}&session_id=${sessionId}`
      );
      const json = (await res.json()) as HistoryResponse;

      if (!res.ok) {
        setError(json.error ?? '读取失败，请稍后重试');
        return;
      }
      setRows(json.data ?? []);
      setScope(json.scope ?? 'anonymous');
      setEmail(json.email ?? null);
    } catch {
      setError('网络异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 用历史答案重新打开当时的报告 */
  const openReport = (row: HistoryRow) => {
    // 存储层的 key 是数字题号，接口返回的是字符串 key，这里转一次
    const numeric: Record<number, string | string[]> = {};
    for (const [k, v] of Object.entries(row.answers ?? {})) {
      const idx = Number(k);
      if (!Number.isNaN(idx)) numeric[idx] = v;
    }
    store.setAnswers(numeric);
    store.setSynced(true);
    store.setStep('report');
    router.push('/tools/community-aging-poll');
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-16">
      <header className="border-b border-[#E8E4DD] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/tools/community-aging-poll"
            className="text-sm font-medium text-[#8A7E6A] transition hover:text-[#C87941]"
          >
            ← 返回投票
          </Link>
          <span className="text-sm font-bold text-[#4A3728]">我的投票记录</span>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        <div className="rounded-xl border border-[#E8D9C2] bg-white px-5 py-4">
          <p className="text-sm font-bold text-[#4A3728]">
            {scope === 'account' ? '已按账号记录' : '当前为本机匿名记录'}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">
            {scope === 'account'
              ? `登录账号${email ? `（${email}）` : ''}下的投票会跨设备保留。`
              : '未登录时，记录绑定在当前浏览器；换设备或清理缓存后无法找回。登录后再投票即可跨设备保留。'}
          </p>
          {scope !== 'account' && (
            <Link
              href="/login"
              className="mt-3 inline-block text-xs font-bold text-[#C87941] transition hover:underline"
            >
              去登录 →
            </Link>
          )}
        </div>

        {loading && (
          <div className="mt-10 text-center text-sm text-[#8A7E6A]">加载中...</div>
        )}

        {!loading && error && (
          <div className="mt-10 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="mt-10 rounded-xl border border-dashed border-[#D0C8B8] bg-white px-6 py-12 text-center">
            <p className="text-sm font-bold text-[#4A3728]">还没有投票记录</p>
            <p className="mt-2 text-xs text-[#8A7E6A]">
              8 个问题，约 3 分钟，投完就能在这里看到时间线。
            </p>
            <Link
              href="/tools/community-aging-poll"
              className="mt-5 inline-block rounded-full bg-[#C87941] px-6 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D]"
            >
              去投票
            </Link>
          </div>
        )}

        {!loading && !error && rows.length > 0 && (
          <ul className="mt-6 space-y-3">
            {rows.map(row => {
              const answered = Object.keys(row.answers ?? {}).length;
              return (
                <li
                  key={row.id}
                  className="rounded-xl border border-[#E8D9C2] bg-white px-5 py-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#4A3728]">
                        {formatVoteDate(row.created_at)}
                      </p>
                      <p className="mt-1 text-xs text-[#8A7E6A]">
                        {formatRelativeTime(row.created_at)} · 已答 {answered} / 8 题
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-[#C87941]">
                        {row.readiness_score}
                        <span className="text-xs font-medium text-[#8A7E6A]"> 分</span>
                      </p>
                      <p className="text-xs text-[#8A7E6A]">
                        {scoreLabel(row.readiness_score)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openReport(row)}
                    className="mt-3 text-xs font-bold text-[#C87941] transition hover:underline"
                  >
                    查看当时的报告 →
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
