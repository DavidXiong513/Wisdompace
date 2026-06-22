'use client';

import { useMemo } from 'react';
import { usePersons } from '@/knowpeople/hooks/usePersons';
import { useDecayReminders } from '@/knowpeople/hooks/useObserve';
import { CATEGORIES } from '@/knowpeople/core/constants/categories';
import { TRUST_LEVELS } from '@/knowpeople/core/constants/weights';
import { getTrustTextColor, getCategoryColorHex } from '@/knowpeople/lib/trustColors';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

// 信任等级对应的饼图颜色
const TRUST_LEVEL_COLORS: Record<string, string> = {
  深度信任: '#8b5cf6',
  高度信任: '#10b981',
  较为信任: '#84cc16',
  普通信任: '#eab308',
  观察中: '#f97316',
  警惕: '#ef4444',
};

export default function InsightsPage() {
  // 只统计活跃人物，不含冷宫
  const { persons, loading } = usePersons({ status: 'active' });
  const { reminders } = useDecayReminders();

  const stats = useMemo(() => {
    if (persons.length === 0) return null;

    const total = persons.length;
    const avgTrust = Math.round(persons.reduce((sum, p) => sum + p.trustValue, 0) / total);
    const avgReliability = Math.round(persons.reduce((sum, p) => sum + p.reliability, 0) / total);
    const avgIntimacy = Math.round(persons.reduce((sum, p) => sum + p.intimacy, 0) / total);

    // 分类分布
    const categoryDist = CATEGORIES.map(cat => ({
      name: cat.label,
      count: persons.filter(p => p.category === cat.id).length,
      color: getCategoryColorHex(cat.id),
    })).filter(c => c.count > 0);

    // 信任等级分布（复用 TRUST_LEVELS，避免硬编码重复）
    const trustLevels = TRUST_LEVELS.slice()
      .reverse()
      .map(level => ({
        name: level.label,
        count: persons.filter(p => p.trustValue >= level.min && p.trustValue <= level.max).length,
        color: TRUST_LEVEL_COLORS[level.label] || '#7c5cfc',
      }));

    // 最高分/最低分（至少 2 人才显示）
    const sorted = [...persons].sort((a, b) => b.trustValue - a.trustValue);

    return {
      total,
      avgTrust,
      avgReliability,
      avgIntimacy,
      categoryDist,
      trustLevels: trustLevels.filter(t => t.count > 0),
      highest: sorted[0],
      lowest: sorted[sorted.length - 1],
      showExtremes: sorted.length >= 2,
    };
  }, [persons]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf8f5]">
        <div className="mx-auto max-w-md px-4 pt-5 pb-16 sm:px-5 sm:pt-8 sm:pb-20">
          <div className="py-20 text-center">
            <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#e0dbd4] border-t-[#7c5cfc]" />
            <p className="text-sm text-[#b5afa6]">加载中...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-md px-4 pt-5 pb-16 sm:px-5 sm:pt-8 sm:pb-20">
        <header className="mb-6">
          <h1 className="bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] bg-clip-text text-[1.65rem] font-bold tracking-tight text-transparent">
            洞察统计
          </h1>
          <p className="mt-0.5 text-xs text-[#9c958c]">数据驱动，理性识人</p>
        </header>

        {persons.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-[#f0ebff] to-[#e3f2fd] text-3xl shadow-sm">
              {'\u{1F4CA}'}
            </div>
            <p className="font-medium text-[#6b6560]">暂无数据</p>
            <p className="mt-1.5 text-sm text-[#b5afa6]">添加人物后查看统计洞察</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-4">
                <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">人物总数</div>
                <div className="text-2xl font-bold text-[#2d2a26]">{stats?.total}</div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-4">
                <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">平均信任值</div>
                <div className={`text-2xl font-bold ${getTrustTextColor(stats?.avgTrust || 0)}`}>
                  {stats?.avgTrust}
                </div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-4">
                <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">平均靠谱度</div>
                <div className="text-2xl font-bold text-[#2d2a26]">{stats?.avgReliability}</div>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-4">
                <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">平均亲密度</div>
                <div className="text-2xl font-bold text-[#2d2a26]">{stats?.avgIntimacy}</div>
              </div>
            </div>

            {/* Category Distribution */}
            {stats && stats.categoryDist.length > 0 && (
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
                <h2 className="mb-3 text-sm font-bold text-[#2d2a26] sm:mb-4">关系分类分布</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={stats.categoryDist}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#b5afa6' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#b5afa6' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #edeae5',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {stats.categoryDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Trust Level Distribution */}
            {stats && stats.trustLevels.length > 0 && (
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
                <h2 className="mb-3 text-sm font-bold text-[#2d2a26] sm:mb-4">信任等级分布</h2>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={stats.trustLevels}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {stats.trustLevels.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #edeae5',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: '12px',
                        }}
                        formatter={(value, name) => [`${value}人`, name as string]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {stats.trustLevels.map(level => (
                    <div key={level.name} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: level.color }}
                      />
                      <span className="text-[0.7rem] text-[#6b6560]">
                        {level.name} {level.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highest & Lowest — 至少 2 人才显示 */}
            {stats && stats.showExtremes && (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <Link href={`/tools/people-insight/person/${stats.highest.id}`}>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-4">
                    <div className="mb-1.5 text-[0.7rem] font-semibold text-emerald-600 sm:mb-2">
                      {'\u{1F3C6}'} 信任最高
                    </div>
                    <div className="truncate text-base font-bold text-[#2d2a26]">
                      {stats.highest.alias}
                    </div>
                    <div
                      className={`mt-1 text-lg font-bold ${getTrustTextColor(stats.highest.trustValue)}`}
                    >
                      {stats.highest.trustValue}
                    </div>
                  </div>
                </Link>
                <Link href={`/tools/people-insight/person/${stats.lowest.id}`}>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:p-4">
                    <div className="mb-1.5 text-[0.7rem] font-semibold text-red-500 sm:mb-2">
                      {'\u26A0\uFE0F'} 信任最低
                    </div>
                    <div className="truncate text-base font-bold text-[#2d2a26]">
                      {stats.lowest.alias}
                    </div>
                    <div
                      className={`mt-1 text-lg font-bold ${getTrustTextColor(stats.lowest.trustValue)}`}
                    >
                      {stats.lowest.trustValue}
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* Decay Reminders */}
            {reminders.length > 0 && (
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
                <h2 className="mb-2.5 text-sm font-bold text-[#2d2a26] sm:mb-3">
                  观察提醒
                  <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[0.7rem] text-amber-600">
                    {reminders.length} 人
                  </span>
                </h2>
                <div className="space-y-2.5">
                  {reminders.slice(0, 5).map(r => (
                    <Link key={r.person.id} href={`/tools/people-insight/person/${r.person.id}`}>
                      <div className="flex items-center justify-between border-b border-[#f7f5f2] py-2 last:border-0">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#edeae5] bg-[#f0ebff] text-sm">
                            {r.person.avatar?.startsWith('data:') ? (
                              <img
                                src={r.person.avatar}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              r.person.avatar || '\u{1F464}'
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#2d2a26]">
                            {r.person.alias}
                          </span>
                        </div>
                        <span
                          className={`text-[0.7rem] font-medium ${r.status === 'expired' ? 'text-red-500' : 'text-amber-500'}`}
                        >
                          {r.status === 'expired' ? `已过期 ${r.daysOverdue} 天` : '即将过期'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                {reminders.length > 5 && (
                  <p className="mt-2 text-center text-[0.7rem] text-[#b5afa6]">
                    还有 {reminders.length - 5} 人需要观察
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
