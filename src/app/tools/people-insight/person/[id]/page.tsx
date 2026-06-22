'use client';

import { useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  usePersonDetail,
  useUpdatePerson,
  useUpdateHardware,
  useUpdateSoftware,
  useUpdateCharacter,
} from '@/knowpeople/hooks/usePersons';
import { useObserveEvents, useTrustBank, useTrustTrend } from '@/knowpeople/hooks/useObserve';
import {
  getCategoryById,
  getSubCategories,
  CATEGORIES,
} from '@/knowpeople/core/constants/categories';
import { CHARACTER_DIMENSIONS } from '@/knowpeople/core/constants/weights';
import { formatDate } from '@/knowpeople/lib/utils';
import { calculateTrustReliability } from '@/knowpeople/core/calculators/trustBank';
import {
  getTrustTextColor,
  getTrustBarColor,
  formatKnownDuration,
} from '@/knowpeople/lib/trustColors';
import { useToast } from '@/knowpeople/components/ui/Toast';
import type {
  Person,
  PersonCategory,
  HardwareInfo,
  SoftwareTrait,
  CharacterScores,
} from '@/knowpeople/core/models';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

type DetailTab = 'overview' | 'hardware' | 'software' | 'character' | 'events';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [editMode, setEditMode] = useState(false);
  const [editTab, setEditTab] = useState<DetailTab>('overview');

  const { data, loading, refresh: refreshPerson } = usePersonDetail(personId);
  const { stats, recalculate: recalcTrustBank } = useTrustBank(personId);
  const { events, remove: removeEvent } = useObserveEvents(personId);
  const { trend } = useTrustTrend(personId, 30);

  const { update: updatePerson, loading: updatingPerson } = useUpdatePerson();
  const { update: updateHardware, loading: updatingHardware } = useUpdateHardware(personId);
  const { update: updateSoftware, loading: updatingSoftware } = useUpdateSoftware(personId);
  const { update: updateCharacter, loading: updatingCharacter } = useUpdateCharacter(personId);

  // 趋势图数据格式化（useMemo 优化）
  // 必须放在所有 early return 之前，否则 loading 从 true 变 false 时会出现 hooks 数量不一致错误
  const chartData = useMemo(
    () =>
      trend.map(p => ({
        date: p.date.slice(5), // MM-DD
        value: p.value,
        positive: p.events.positive,
        negative: p.events.negative,
      })),
    [trend]
  );

  const handleSave = useCallback(async () => {
    await Promise.all([refreshPerson(), recalcTrustBank()]);
    setEditMode(false);
  }, [refreshPerson, recalcTrustBank]);

  // 人物不存在的兜底处理
  if (!loading && !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="px-6 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f2ed] text-3xl">
            {'\u2753'}
          </div>
          <p className="mb-1 font-medium text-[#6b6560]">人物不存在</p>
          <p className="mb-6 text-sm text-[#b5afa6]">该人物可能已被删除</p>
          <button
            onClick={() => router.push('/tools/people-insight')}
            className="rounded-xl bg-[#7c5cfc] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6b4ce0]"
          >
            返回人物库
          </button>
        </div>
      </main>
    );
  }

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#e0dbd4] border-t-[#7c5cfc]" />
          <p className="text-sm text-[#b5afa6]">加载中...</p>
        </div>
      </main>
    );
  }

  const { person, hardware, software, character } = data;
  const categoryConfig = getCategoryById(person.category);
  const effectiveInitialTrust = person.firstImpression ?? categoryConfig?.initialTrust ?? 0;
  const trustValue = stats?.trustValue ?? person.trustValue;
  const reliability = stats?.reliability ?? person.reliability;
  const intimacy = stats?.intimacy ?? person.intimacy;
  const timeBonus = stats?.timeBonus ?? 0;

  // 可信度：路遥知马力，日久见人心
  const trustReliability = calculateTrustReliability({
    createdAt: person.knownSince ?? person.createdAt,
    observeCount: events.length,
  });

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'overview', label: '概览' },
    { id: 'hardware', label: '硬件' },
    { id: 'software', label: '软件' },
    { id: 'character', label: '品性' },
    { id: 'events', label: '动态' },
  ];

  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'negative':
        return 'bg-rose-50 text-rose-700 border border-rose-100';
      default:
        return 'bg-[#f5f2ed] text-[#9c958c] border border-[#edeae5]';
    }
  };

  const getEventDeltaStyle = (delta: number) => {
    if (delta > 0) return 'text-emerald-600';
    if (delta < 0) return 'text-rose-500';
    return 'text-[#b5afa6]';
  };

  const isUpdating = updatingPerson || updatingHardware || updatingSoftware || updatingCharacter;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-8 sm:pb-4">
          <button
            onClick={() => router.push('/tools/people-insight')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[#6b6560] shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex flex-1 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-[#f0ebff] to-[#e3f2fd] text-base shadow-sm">
              {person.avatar?.startsWith('data:') ? (
                <img src={person.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                person.avatar || '👤'
              )}
            </div>
            <h1 className="bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] bg-clip-text text-base font-bold text-transparent">
              {person.alias}
            </h1>
          </div>
          <button
            onClick={() => {
              if (editMode) {
                setEditMode(false);
              } else {
                setEditTab(activeTab);
                setEditMode(true);
              }
            }}
            className="text-sm font-medium text-[#7c5cfc] transition hover:text-[#6b4ce0]"
          >
            {editMode ? '完成' : '编辑'}
          </button>
        </header>

        {/* Trust Bank Card */}
        <div className="mx-4 mb-3 rounded-[1.25rem] border border-white/60 bg-white/80 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:mx-5 sm:mb-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-[#6b6560]">信任银行</span>
            <span className={`text-[1.65rem] font-bold ${getTrustTextColor(trustValue)}`}>
              {trustValue}
              <span className="ml-0.5 text-sm font-normal text-[#c4bdb5]">/ 100</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 h-[6px] w-full overflow-hidden rounded-full bg-gradient-to-r from-[#f5f2ed] to-[#edeae5]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getTrustBarColor(trustValue)}`}
              style={{ width: `${trustValue}%` }}
            />
          </div>

          {/* Trust Reliability 可信度 */}
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.7rem] text-[#9c958c]">可信度</span>
                <span className="text-[0.65rem] text-[#c4bdb5]">路遥知马力</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold ${
                    trustReliability.score >= 70
                      ? 'text-emerald-500'
                      : trustReliability.score >= 30
                        ? 'text-amber-500'
                        : 'text-[#c4bdb5]'
                  }`}
                >
                  {trustReliability.score}%
                </span>
                <span className="text-[0.6rem] text-[#c4bdb5]">
                  {trustReliability.daysSinceCreation}天 · {trustReliability.observeCount}次观察
                </span>
              </div>
            </div>
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-[#f5f2ed]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${trustReliability.score}%`,
                  backgroundColor:
                    trustReliability.score >= 70
                      ? '#10b981'
                      : trustReliability.score >= 30
                        ? '#f59e0b'
                        : '#d1d5db',
                }}
              />
            </div>
          </div>

          {/* Time Bonus - 日久见人心 */}
          {timeBonus > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-[#f0faf0] px-3 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.8rem]">⏳</span>
                <span className="text-[0.75rem] font-medium text-emerald-600">日久见人心</span>
              </div>
              <span className="text-[0.75rem] font-semibold text-emerald-600">+{timeBonus}</span>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-[#faf8f5] px-2 py-3 text-center">
              <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">靠谱度</div>
              <div className="text-lg font-bold text-[#2d2a26]">{reliability}</div>
            </div>
            <div className="rounded-xl bg-[#faf8f5] px-2 py-3 text-center">
              <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">亲密度</div>
              <div className="text-lg font-bold text-[#2d2a26]">{intimacy}</div>
            </div>
            <div className="rounded-xl bg-[#faf8f5] px-2 py-3 text-center">
              <div className="mb-0.5 text-[0.7rem] text-[#9c958c]">上次更新</div>
              <div className="pt-1 text-sm font-semibold text-[#6b6560]">
                {formatDate(person.lastObservedAt)}
              </div>
            </div>
          </div>

          {/* First Impression */}
          {person.firstImpression !== undefined && (
            <div className="mt-4 border-t border-[#f7f5f2] pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.7rem] font-medium text-amber-600">
                    💭 第一印象
                  </span>
                  <span
                    className={`text-sm font-bold ${getTrustTextColor(person.firstImpression)}`}
                  >
                    {person.firstImpression}
                  </span>
                  <span className="text-[0.7rem] text-[#c4bdb5]">/100</span>
                </div>
                {person.firstImpression !== trustValue && (
                  <span
                    className={`text-[0.7rem] font-medium ${
                      trustValue > person.firstImpression
                        ? 'text-emerald-500'
                        : trustValue < person.firstImpression
                          ? 'text-rose-400'
                          : 'text-[#b5afa6]'
                    }`}
                  >
                    {trustValue > person.firstImpression
                      ? '↑'
                      : trustValue < person.firstImpression
                        ? '↓'
                        : ''}
                    {Math.abs(trustValue - person.firstImpression)}
                  </span>
                )}
              </div>
              {person.firstImpressionNote && (
                <p className="mt-2 text-[0.75rem] leading-relaxed text-[#9c958c] italic">
                  「{person.firstImpressionNote}」
                </p>
              )}
            </div>
          )}
        </div>

        {/* Trend Chart */}
        {chartData.length > 1 && (
          <div className="mx-4 mb-3 rounded-[1.25rem] border border-white/60 bg-white/80 p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm sm:mx-5 sm:mb-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-[#6b6560]">信任趋势（30天）</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trustGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#b5afa6' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#b5afa6' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #edeae5',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                  formatter={value => [`信任值: ${value}`, '']}
                />
                <ReferenceLine y={effectiveInitialTrust} stroke="#c4bdb5" strokeDasharray="4 4" />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#7c5cfc"
                  strokeWidth={2}
                  fill="url(#trustGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#7c5cfc', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Action Button */}
        <div className="mx-4 mb-3 sm:mx-5 sm:mb-4">
          <Link
            href={`/tools/people-insight/person/${personId}/observe`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7c5cfc] py-3.5 text-center font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6b4ce0] active:scale-[0.98]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            添加观察记录
          </Link>
        </div>

        {/* Tabs */}
        <div className="mx-4 mb-2.5 sm:mx-5 sm:mb-3">
          <div className="hide-scrollbar flex gap-1 overflow-x-auto rounded-xl border border-[#edeae5] bg-white p-1 shadow-sm">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#7c5cfc] text-white shadow-sm'
                    : 'text-[#9c958c] hover:text-[#6b6560]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-4 pb-8 sm:mx-5 sm:pb-10">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="rounded-[1.25rem] border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
              {editMode && editTab === 'overview' ? (
                <OverviewEditor
                  person={person}
                  onUpdate={updatePerson}
                  onSave={handleSave}
                  loading={isUpdating}
                />
              ) : (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9c958c]">分类</span>
                    <span className="text-sm font-semibold text-[#2d2a26]">
                      {categoryConfig?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9c958c]">细分</span>
                    <span className="text-sm font-semibold text-[#2d2a26]">
                      {getSubCategories(person.category).find(s => s.id === person.subCategory)
                        ?.label || person.subCategory}
                    </span>
                  </div>
                  {person.firstImpression !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">第一印象</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${getTrustTextColor(person.firstImpression)}`}
                        >
                          {person.firstImpression}
                        </span>
                        <span className="text-[0.7rem] text-[#c4bdb5]">/100</span>
                      </div>
                    </div>
                  )}
                  {person.firstImpressionNote && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 text-sm text-[#9c958c]">初印象备注</span>
                      <p className="text-right text-sm text-[#6b6560] italic">
                        「{person.firstImpressionNote}」
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#9c958c]">可信度</span>
                    <div className="flex items-center gap-2">
                      <div className="h-[3px] w-16 overflow-hidden rounded-full bg-[#f5f2ed]">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${trustReliability.score}%`,
                            backgroundColor:
                              trustReliability.score >= 70
                                ? '#10b981'
                                : trustReliability.score >= 30
                                  ? '#f59e0b'
                                  : '#d1d5db',
                          }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          trustReliability.score >= 70
                            ? 'text-emerald-500'
                            : trustReliability.score >= 30
                              ? 'text-amber-500'
                              : 'text-[#c4bdb5]'
                        }`}
                      >
                        {trustReliability.score}%
                      </span>
                      <span className="text-[0.65rem] text-[#c4bdb5]">
                        {trustReliability.daysSinceCreation}天
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="shrink-0 text-sm text-[#9c958c]">标签</span>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {person.tags.length > 0 ? (
                        person.tags.map(tag => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#f0ebff] px-2.5 py-1 text-[0.7rem] font-medium text-[#7c5cfc]"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-[#c4bdb5]">无标签</span>
                      )}
                    </div>
                  </div>
                  {person.knownSince &&
                    (() => {
                      const duration = formatKnownDuration(person.knownSince);
                      if (!duration) return null;
                      return (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#9c958c]">认识时长</span>
                          <span className="text-sm font-semibold text-[#2d2a26]">
                            {duration}
                            <span className="ml-1.5 text-[0.7rem] font-normal text-[#c4bdb5]">
                              ({new Date(person.knownSince).toLocaleDateString('zh-CN')})
                            </span>
                          </span>
                        </div>
                      );
                    })()}
                  {person.note && (
                    <div className="border-t border-[#f7f5f2] pt-3">
                      <span className="text-sm text-[#9c958c]">备注</span>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#6b6560]">{person.note}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Hardware Tab */}
          {activeTab === 'hardware' && (
            <div className="rounded-[1.25rem] border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
              {editMode && editTab === 'hardware' ? (
                <HardwareEditor
                  hardware={hardware}
                  onUpdate={updateHardware}
                  onSave={handleSave}
                  loading={isUpdating}
                />
              ) : hardware ? (
                <div className="space-y-3.5">
                  {hardware.height && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">身高</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.height} cm
                      </span>
                    </div>
                  )}
                  {hardware.weight && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">体重</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.weight} kg
                      </span>
                    </div>
                  )}
                  {hardware.age && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">年龄</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.age} 岁
                      </span>
                    </div>
                  )}
                  {hardware.education && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">学历</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.education}
                      </span>
                    </div>
                  )}
                  {hardware.occupation && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">职业</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.occupation}
                      </span>
                    </div>
                  )}
                  {hardware.company && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">公司/单位</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.company}
                      </span>
                    </div>
                  )}
                  {hardware.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">所在地</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {hardware.location}
                      </span>
                    </div>
                  )}
                  {!hardware.height &&
                    !hardware.weight &&
                    !hardware.age &&
                    !hardware.education &&
                    !hardware.occupation &&
                    !hardware.company &&
                    !hardware.location && (
                      <div className="py-8 text-center text-[#b5afa6]">
                        <p>暂无硬件信息</p>
                        <p className="mt-1 text-xs">点击右上角编辑添加</p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#edeae5] bg-white text-2xl shadow-sm">
                    📋
                  </div>
                  <p className="font-medium text-[#6b6560]">此维度信息暂未录入</p>
                  <p className="mt-1 text-sm text-[#b5afa6]">点击右上角编辑添加</p>
                </div>
              )}
            </div>
          )}

          {/* Software Tab */}
          {activeTab === 'software' && (
            <div className="rounded-[1.25rem] border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
              {editMode && editTab === 'software' ? (
                <SoftwareEditor
                  software={software}
                  onUpdate={updateSoftware}
                  onSave={handleSave}
                  loading={isUpdating}
                />
              ) : software ? (
                <div className="space-y-3.5">
                  {software.mbti && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">MBTI</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">{software.mbti}</span>
                    </div>
                  )}
                  {software.zodiac && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">星座</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {software.zodiac}
                      </span>
                    </div>
                  )}
                  {software.bloodType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#9c958c]">血型</span>
                      <span className="text-sm font-semibold text-[#2d2a26]">
                        {software.bloodType}
                      </span>
                    </div>
                  )}
                  {software.hobbies.length > 0 && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 text-sm text-[#9c958c]">兴趣爱好</span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {software.hobbies.map(h => (
                          <span
                            key={h}
                            className="rounded-full bg-[#f0ebff] px-2.5 py-1 text-[0.7rem] font-medium text-[#7c5cfc]"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {software.personalityTags.length > 0 && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 text-sm text-[#9c958c]">性格标签</span>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {software.personalityTags.map(t => (
                          <span
                            key={t}
                            className="rounded-full bg-[#f5f2ed] px-2.5 py-1 text-[0.7rem] font-medium text-[#6b6560]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!software.mbti &&
                    !software.zodiac &&
                    !software.bloodType &&
                    software.hobbies.length === 0 &&
                    software.personalityTags.length === 0 && (
                      <div className="py-8 text-center text-[#b5afa6]">
                        <p>暂无软件特质信息</p>
                        <p className="mt-1 text-xs">点击右上角编辑添加</p>
                      </div>
                    )}
                </div>
              ) : (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#edeae5] bg-white text-2xl shadow-sm">
                    📋
                  </div>
                  <p className="font-medium text-[#6b6560]">此维度信息暂未录入</p>
                  <p className="mt-1 text-sm text-[#b5afa6]">点击右上角编辑添加</p>
                </div>
              )}
            </div>
          )}

          {/* Character Tab */}
          {activeTab === 'character' && (
            <div className="rounded-[1.25rem] border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
              {editMode && editTab === 'character' ? (
                <CharacterEditor
                  character={character}
                  onUpdate={updateCharacter}
                  onSave={handleSave}
                  loading={isUpdating}
                />
              ) : character ? (
                <div className="space-y-5">
                  {CHARACTER_DIMENSIONS.map(dim => {
                    const score = character[dim.id as keyof typeof character] as number;
                    const percentage = (score / 10) * 100;
                    return (
                      <div key={dim.id}>
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-[#2d2a26]">{dim.label}</span>
                            <p className="mt-0.5 text-[0.7rem] text-[#b5afa6]">{dim.description}</p>
                          </div>
                          <span className="text-sm font-bold text-[#7c5cfc]">
                            {score}
                            <span className="font-normal text-[#c4bdb5]">/10</span>
                          </span>
                        </div>
                        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#f5f2ed]">
                          <div
                            className="h-full rounded-full bg-[#7c5cfc] transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#edeae5] bg-white text-2xl shadow-sm">
                    📋
                  </div>
                  <p className="font-medium text-[#6b6560]">暂无品性评分</p>
                  <p className="mt-1 text-sm text-[#b5afa6]">点击右上角编辑添加</p>
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-3">
              {events.length === 0 ? (
                <div className="py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#edeae5] bg-white text-2xl shadow-sm">
                    📝
                  </div>
                  <p className="font-medium text-[#6b6560]">暂无观察记录</p>
                  <p className="mt-1 text-sm text-[#b5afa6]">添加第一个观察事件</p>
                </div>
              ) : (
                events.map(event => (
                  <div
                    key={event.id}
                    className="rounded-[1.1rem] border border-[#f0ebe5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${getEventTypeStyle(event.type)}`}
                      >
                        {event.type === 'positive'
                          ? '正面'
                          : event.type === 'negative'
                            ? '负面'
                            : '中性'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${getEventDeltaStyle(event.trustDelta)}`}
                        >
                          {event.trustDelta > 0 ? '+' : ''}
                          {event.trustDelta}
                        </span>
                        <button
                          onClick={async () => {
                            if (!confirm('删除此观察记录？')) return;
                            try {
                              await removeEvent(event.id);
                              // removeEvent 内部已刷新 events，只需刷新人物信任值
                              await Promise.all([refreshPerson(), recalcTrustBank()]);
                              toast.success('观察记录已删除');
                            } catch (err) {
                              toast.error(
                                `删除失败: ${err instanceof Error ? err.message : String(err)}`
                              );
                            }
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[#d4cec6] transition hover:bg-red-50 hover:text-red-400"
                          title="删除"
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-[0.85rem] leading-relaxed text-[#4a453f]">{event.note}</p>
                    <p className="mt-2 text-[0.7rem] text-[#c4bdb5]">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// ============================================================
// 编辑子组件
// ============================================================

function OverviewEditor({
  person,
  onUpdate,
  onSave,
  loading,
}: {
  person: Person;
  onUpdate: (id: string, updates: Partial<Person>) => Promise<Person>;
  onSave: () => void;
  loading: boolean;
}) {
  const toast = useToast();
  const [alias, setAlias] = useState(person.alias);
  const [note, setNote] = useState(person.note || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(person.tags);
  const [category, setCategory] = useState(person.category);
  const [subCategory, setSubCategory] = useState(person.subCategory);

  const handleSave = async () => {
    try {
      await onUpdate(person.id, { alias, note, tags, category, subCategory });
      toast.success('保存成功');
      onSave();
    } catch (err) {
      toast.error(`保存失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">代号</label>
        <input
          type="text"
          value={alias}
          onChange={e => setAlias(e.target.value)}
          className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">分类</label>
          <select
            value={category}
            onChange={e => {
              const newCat = e.target.value as PersonCategory;
              setCategory(newCat);
              setSubCategory(getSubCategories(newCat)[0]?.id || 'normal');
            }}
            className="w-full appearance-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">细分</label>
          <select
            value={subCategory}
            onChange={e => setSubCategory(e.target.value)}
            className="w-full appearance-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          >
            {getSubCategories(category).map(sub => (
              <option key={sub.id} value={sub.id}>
                {sub.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">标签</label>
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const t = tagInput.trim();
                if (t && !tags.includes(t)) setTags([...tags, t]);
                setTagInput('');
              }
            }}
            placeholder="输入标签按回车添加"
            className="flex-1 rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          />
          <button
            onClick={() => {
              const t = tagInput.trim();
              if (t && !tags.includes(t)) setTags([...tags, t]);
              setTagInput('');
            }}
            className="rounded-xl bg-[#f0ebff] px-4 py-2.5 text-sm font-semibold text-[#7c5cfc] transition hover:bg-[#e0d8f7]"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[#f0ebff] px-2.5 py-1 text-[0.75rem] font-medium text-[#7c5cfc]"
            >
              {tag}
              <button
                onClick={() => setTags(tags.filter(t => t !== tag))}
                className="text-[#b5afa6] hover:text-[#7c5cfc]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">备注</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-xl bg-[#7c5cfc] py-3 font-semibold text-white transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
  );
}

function HardwareEditor({
  hardware,
  onUpdate,
  onSave,
  loading,
}: {
  hardware?: {
    height?: number;
    weight?: number;
    age?: number;
    education?: string;
    occupation?: string;
    company?: string;
    location?: string;
    incomeLevel?: string;
  } | null;
  onUpdate: (updates: Partial<Omit<HardwareInfo, 'id' | 'personId'>>) => Promise<HardwareInfo>;
  onSave: () => void;
  loading: boolean;
}) {
  const toast = useToast();
  const [height, setHeight] = useState(hardware?.height?.toString() || '');
  const [weight, setWeight] = useState(hardware?.weight?.toString() || '');
  const [age, setAge] = useState(hardware?.age?.toString() || '');
  const [education, setEducation] = useState(hardware?.education || '');
  const [occupation, setOccupation] = useState(hardware?.occupation || '');
  const [company, setCompany] = useState(hardware?.company || '');
  const [location, setLocation] = useState(hardware?.location || '');

  const parseNum = (val: string, min: number, max: number): number | undefined => {
    if (!val) return undefined;
    const num = parseFloat(val);
    if (isNaN(num)) return undefined;
    return Math.max(min, Math.min(max, num));
  };

  const handleSave = async () => {
    try {
      await onUpdate({
        height: parseNum(height, 50, 300),
        weight: parseNum(weight, 10, 500),
        age: parseNum(age, 0, 150),
        education: education || undefined,
        occupation: occupation || undefined,
        company: company || undefined,
        location: location || undefined,
      });
      toast.success('保存成功');
      onSave();
    } catch (err) {
      toast.error(`保存失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">身高 (cm)</label>
          <input
            type="number"
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">体重 (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">年龄</label>
        <input
          type="number"
          value={age}
          onChange={e => setAge(e.target.value)}
          className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">学历</label>
        <input
          type="text"
          value={education}
          onChange={e => setEducation(e.target.value)}
          placeholder="如：本科、硕士、博士"
          className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">职业</label>
        <input
          type="text"
          value={occupation}
          onChange={e => setOccupation(e.target.value)}
          className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">公司/单位</label>
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">所在地</label>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-xl bg-[#7c5cfc] py-3 font-semibold text-white transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
  );
}

function SoftwareEditor({
  software,
  onUpdate,
  onSave,
  loading,
}: {
  software?: {
    mbti?: string;
    zodiac?: string;
    bloodType?: string;
    hobbies?: string[];
    personalityTags?: string[];
  } | null;
  onUpdate: (updates: Partial<Omit<SoftwareTrait, 'id' | 'personId'>>) => Promise<SoftwareTrait>;
  onSave: () => void;
  loading: boolean;
}) {
  const toast = useToast();
  const [mbti, setMbti] = useState(software?.mbti || '');
  const [zodiac, setZodiac] = useState(software?.zodiac || '');
  const [bloodType, setBloodType] = useState(software?.bloodType || '');
  const [hobbies, setHobbies] = useState(software?.hobbies || []);
  const [personalityTags, setPersonalityTags] = useState(software?.personalityTags || []);
  const [hobbyInput, setHobbyInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleSave = async () => {
    try {
      await onUpdate({
        mbti: mbti || undefined,
        zodiac: zodiac || undefined,
        bloodType: bloodType || undefined,
        hobbies,
        personalityTags,
      });
      toast.success('保存成功');
      onSave();
    } catch (err) {
      toast.error(`保存失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">MBTI</label>
        <select
          value={mbti}
          onChange={e => setMbti(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        >
          <option value="">未选择</option>
          {[
            'INTJ',
            'INTP',
            'ENTJ',
            'ENTP',
            'INFJ',
            'INFP',
            'ENFJ',
            'ENFP',
            'ISTJ',
            'ISFJ',
            'ESTJ',
            'ESFJ',
            'ISTP',
            'ISFP',
            'ESTP',
            'ESFP',
          ].map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">星座</label>
        <select
          value={zodiac}
          onChange={e => setZodiac(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        >
          <option value="">未选择</option>
          {[
            '白羊座',
            '金牛座',
            '双子座',
            '巨蟹座',
            '狮子座',
            '处女座',
            '天秤座',
            '天蝎座',
            '射手座',
            '摩羯座',
            '水瓶座',
            '双鱼座',
          ].map(z => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">血型</label>
        <select
          value={bloodType}
          onChange={e => setBloodType(e.target.value)}
          className="w-full appearance-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
        >
          <option value="">未选择</option>
          <option value="A">A型</option>
          <option value="B">B型</option>
          <option value="AB">AB型</option>
          <option value="O">O型</option>
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">兴趣爱好</label>
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={hobbyInput}
            onChange={e => setHobbyInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const t = hobbyInput.trim();
                if (t && !hobbies.includes(t)) setHobbies([...hobbies, t]);
                setHobbyInput('');
              }
            }}
            placeholder="输入爱好按回车添加"
            className="flex-1 rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          />
          <button
            onClick={() => {
              const t = hobbyInput.trim();
              if (t && !hobbies.includes(t)) setHobbies([...hobbies, t]);
              setHobbyInput('');
            }}
            className="rounded-xl bg-[#f0ebff] px-4 py-2.5 text-sm font-semibold text-[#7c5cfc] transition hover:bg-[#e0d8f7]"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {hobbies.map(h => (
            <span
              key={h}
              className="inline-flex items-center gap-1 rounded-full bg-[#f0ebff] px-2.5 py-1 text-[0.75rem] font-medium text-[#7c5cfc]"
            >
              {h}
              <button
                onClick={() => setHobbies(hobbies.filter(x => x !== h))}
                className="text-[#b5afa6] hover:text-[#7c5cfc]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">性格标签</label>
        <div className="mb-2 flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const t = tagInput.trim();
                if (t && !personalityTags.includes(t)) setPersonalityTags([...personalityTags, t]);
                setTagInput('');
              }
            }}
            placeholder="输入标签按回车添加"
            className="flex-1 rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
          />
          <button
            onClick={() => {
              const t = tagInput.trim();
              if (t && !personalityTags.includes(t)) setPersonalityTags([...personalityTags, t]);
              setTagInput('');
            }}
            className="rounded-xl bg-[#f0ebff] px-4 py-2.5 text-sm font-semibold text-[#7c5cfc] transition hover:bg-[#e0d8f7]"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {personalityTags.map(t => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-full bg-[#f5f2ed] px-2.5 py-1 text-[0.75rem] font-medium text-[#6b6560]"
            >
              {t}
              <button
                onClick={() => setPersonalityTags(personalityTags.filter(x => x !== t))}
                className="text-[#b5afa6] hover:text-[#6b6560]"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-xl bg-[#7c5cfc] py-3 font-semibold text-white transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? '保存中...' : '保存'}
      </button>
    </div>
  );
}

function CharacterEditor({
  character,
  onUpdate,
  onSave,
  loading,
}: {
  character?: CharacterScores | null;
  onUpdate: (
    updates: Partial<Omit<CharacterScores, 'id' | 'personId'>>
  ) => Promise<CharacterScores>;
  onSave: () => void;
  loading: boolean;
}) {
  const toast = useToast();
  const [scores, setScores] = useState({
    diligence: character?.diligence ?? 5,
    reliability: character?.reliability ?? 5,
    integrity: character?.integrity ?? 5,
    emotionalStability: character?.emotionalStability ?? 5,
    empathy: character?.empathy ?? 5,
  });

  const handleSave = async () => {
    try {
      await onUpdate(scores);
      toast.success('品性评分已保存');
      onSave();
    } catch (err) {
      toast.error(`保存失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className="space-y-6">
      {CHARACTER_DIMENSIONS.map(dim => {
        const value = scores[dim.id as keyof typeof scores];
        return (
          <div key={dim.id}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-[#2d2a26]">{dim.label}</span>
                <p className="mt-0.5 text-[0.7rem] text-[#b5afa6]">{dim.description}</p>
              </div>
              <span className="text-sm font-bold text-[#7c5cfc]">
                {value}
                <span className="font-normal text-[#c4bdb5]">/10</span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={value}
              onChange={e => setScores({ ...scores, [dim.id]: Number(e.target.value) })}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#f5f2ed] accent-[#7c5cfc]"
            />
            <div className="mt-1 flex justify-between text-[0.65rem] text-[#c4bdb5]">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        );
      })}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full rounded-xl bg-[#7c5cfc] py-3 font-semibold text-white transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:opacity-40"
      >
        {loading ? '保存中...' : '保存评分'}
      </button>
    </div>
  );
}
