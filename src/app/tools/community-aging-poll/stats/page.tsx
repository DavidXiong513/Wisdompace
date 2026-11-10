import React from 'react';
import Link from 'next/link';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createPollServiceClient } from '@/lib/poll-server';
import { POLL_QUESTIONS } from '@/data/community-aging-poll/questions';

/**
 * 投票统计（服务端渲染）
 * 访问要求：登录用户；若配置了 POLL_ADMIN_EMAILS，则只允许名单内邮箱。
 */

export const dynamic = 'force-dynamic';

const TOOL_ID = 'community-aging-poll';
const TREND_DAYS = 14;

interface AggregateRow {
  question_index: number;
  option_label: string;
  count: number;
}

interface VoteRow {
  created_at: string;
  readiness_score: number;
}

/** 把 UTC 时间转成东八区的 YYYY-MM-DD */
function toShanghaiDateKey(iso: string): string {
  const t = new Date(iso).getTime() + 8 * 60 * 60 * 1000;
  return new Date(t).toISOString().slice(0, 10);
}

function lastNDays(n: number): string[] {
  const keys: string[] = [];
  const nowShifted = Date.now() + 8 * 60 * 60 * 1000;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(nowShifted - i * 24 * 60 * 60 * 1000);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function GateCard({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-[#E8D9C2] bg-white px-6 py-10 text-center shadow-sm">
        <p className="text-lg font-bold text-[#4A3728]">{title}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">{desc}</p>
        <div className="mt-6">{action}</div>
      </div>
    </div>
  );
}

export default async function PollStatsPage() {
  let email: string | null = null;
  try {
    const supabaseAuth = await createServerSupabase();
    const { data } = await supabaseAuth.auth.getUser();
    email = data.user?.email ?? null;
  } catch {
    email = null;
  }

  if (!email) {
    return (
      <GateCard
        title="需要登录后查看"
        desc="投票统计面向站点管理员，请先登录。"
        action={
          <Link
            href="/login"
            className="inline-block rounded-full bg-[#C87941] px-6 py-2 text-sm font-bold text-white shadow-md transition hover:bg-[#A85E2D]"
          >
            去登录
          </Link>
        }
      />
    );
  }

  const allowList = (process.env.POLL_ADMIN_EMAILS ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (allowList.length > 0 && !allowList.includes(email.toLowerCase())) {
    return (
      <GateCard
        title="没有访问权限"
        desc={`当前账号 ${email} 不在管理员名单中。如需开通，请把该邮箱加入环境变量 POLL_ADMIN_EMAILS。`}
      />
    );
  }

  const supabase = createPollServiceClient();
  if (!supabase) {
    return (
      <GateCard
        title="统计服务未配置"
        desc="缺少 SUPABASE_SERVICE_ROLE_KEY，无法读取投票数据。"
      />
    );
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [aggRes, countRes, votesRes] = await Promise.all([
    supabase
      .from('poll_aggregates')
      .select('question_index, option_label, count')
      .eq('tool_id', TOOL_ID)
      .order('question_index', { ascending: true }),
    supabase
      .from('poll_votes')
      .select('id', { count: 'exact', head: true })
      .eq('tool_id', TOOL_ID),
    supabase
      .from('poll_votes')
      .select('created_at, readiness_score')
      .eq('tool_id', TOOL_ID)
      .gte('created_at', since)
      .order('created_at', { ascending: false }),
  ]);

  const aggregates = (aggRes.data ?? []) as AggregateRow[];
  const totalVotes = countRes.count ?? 0;
  const recentVotes = (votesRes.data ?? []) as VoteRow[];

  // ── 按题分组 ──
  const byQuestion = new Map<number, AggregateRow[]>();
  for (const row of aggregates) {
    const list = byQuestion.get(row.question_index) ?? [];
    list.push(row);
    byQuestion.set(row.question_index, list);
  }
  for (const list of byQuestion.values()) {
    list.sort((a, b) => b.count - a.count);
  }

  // ── 14 天趋势 ──
  const dayKeys = lastNDays(TREND_DAYS);
  const dayCount = new Map<string, number>(dayKeys.map(k => [k, 0]));
  for (const v of recentVotes) {
    const key = toShanghaiDateKey(v.created_at);
    if (dayCount.has(key)) dayCount.set(key, (dayCount.get(key) ?? 0) + 1);
  }
  const trend = dayKeys.map(k => ({ key: k, count: dayCount.get(k) ?? 0 }));
  const trendMax = Math.max(1, ...trend.map(t => t.count));
  const trendTotal = trend.reduce((s, t) => s + t.count, 0);

  const avgScore =
    recentVotes.length > 0
      ? Math.round(
          recentVotes.reduce((s, v) => s + (v.readiness_score ?? 0), 0) /
            recentVotes.length
        )
      : 0;

  const stat = [
    { label: '总参与人数', value: String(totalVotes), hint: '一人一票去重后' },
    { label: `近 ${TREND_DAYS} 天新增`, value: String(trendTotal), hint: '含重复设备' },
    { label: '平均准备度', value: `${avgScore}`, hint: '近 30 天样本' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-16">
      <header className="border-b border-[#E8E4DD] bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/tools/community-aging-poll"
            className="text-sm font-medium text-[#8A7E6A] transition hover:text-[#C87941]"
          >
            ← 返回投票
          </Link>
          <span className="text-sm font-bold text-[#4A3728]">投票数据统计</span>
          <span className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-8">
        {/* 概览 */}
        <div className="grid gap-3 sm:grid-cols-3">
          {stat.map(s => (
            <div
              key={s.label}
              className="rounded-xl border border-[#E8D9C2] bg-white px-5 py-4"
            >
              <p className="text-xs text-[#8A7E6A]">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-[#C87941]">{s.value}</p>
              <p className="mt-1 text-[11px] text-[#B0A090]">{s.hint}</p>
            </div>
          ))}
        </div>

        {/* 趋势 */}
        <section className="mt-6 rounded-xl border border-[#E8D9C2] bg-white px-5 py-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-bold text-[#4A3728]">
              近 {TREND_DAYS} 天参与趋势
            </h2>
            <span className="text-[11px] text-[#B0A090]">按东八区自然日</span>
          </div>

          {trendTotal === 0 ? (
            <p className="mt-6 text-center text-xs text-[#B0A090]">
              这段时间还没有新增投票
            </p>
          ) : (
            <div className="mt-5 flex h-40 items-end gap-1.5">
              {trend.map(t => (
                <div key={t.key} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-[#8A7E6A]">
                    {t.count > 0 ? t.count : ''}
                  </span>
                  <div
                    className="w-full rounded-t bg-[#C87941]"
                    style={{
                      height: `${Math.max(t.count > 0 ? 6 : 2, (t.count / trendMax) * 100)}%`,
                      opacity: t.count > 0 ? 1 : 0.15,
                    }}
                  />
                  <span className="text-[10px] text-[#B0A090]">
                    {t.key.slice(5).replace('-', '/')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 各题分布 */}
        <section className="mt-6 space-y-4">
          {POLL_QUESTIONS.map((q, index) => {
            const rows = byQuestion.get(index) ?? [];
            const sum = rows.reduce((s, r) => s + r.count, 0);

            return (
              <div
                key={q.id}
                className="rounded-xl border border-[#E8D9C2] bg-white px-5 py-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-[#B0A090]">
                      {q.chapterIcon} {q.chapter} · 第 {index + 1} 题
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-[#4A3728]">
                      {q.text}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#FDF5EE] px-3 py-1 text-[11px] font-bold text-[#C87941]">
                    {q.multi ? '多选' : '单选'}
                  </span>
                </div>

                {rows.length === 0 ? (
                  <p className="mt-4 text-xs text-[#B0A090]">暂无数据</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {rows.map(r => {
                      const pct = sum > 0 ? Math.round((r.count / sum) * 100) : 0;
                      return (
                        <li key={r.option_label}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#5A4A3A]">{r.option_label}</span>
                            <span className="shrink-0 pl-3 tabular-nums text-[#8A7E6A]">
                              {r.count} 票 · {pct}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F5F0E8]">
                            <div
                              className="h-full rounded-full bg-[#C87941]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {q.multi && (
                  <p className="mt-3 text-[10px] text-[#B0A090]">
                    多选题：占比为该选项被选中的比例，合计超过 100%
                  </p>
                )}
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
