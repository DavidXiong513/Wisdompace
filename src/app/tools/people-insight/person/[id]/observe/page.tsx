'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePersonDetail } from '@/knowpeople/hooks/usePersons';
import { useObserveEvents } from '@/knowpeople/hooks/useObserve';
import {
  POSITIVE_EVENTS,
  NEUTRAL_EVENTS,
  NEGATIVE_EVENTS,
  getEventCategoryById,
} from '@/knowpeople/core/constants/events';
import { CHARACTER_DIMENSIONS } from '@/knowpeople/core/constants/weights';
import { previewEventImpact } from '@/knowpeople/core/calculators/trustBank';
import { useToast } from '@/knowpeople/components/ui/Toast';
import type { EventType } from '@/knowpeople/core/models';

export default function ObservePage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;
  const toast = useToast();

  const { data, loading } = usePersonDetail(personId);
  const { add } = useObserveEvents(personId);

  const [type, setType] = useState<EventType>('positive');
  const [eventCategory, setEventCategory] = useState('');
  const [affectedDimensions, setAffectedDimensions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [customDelta, setCustomDelta] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const currentTrust = data?.person.trustValue || 0;

  const eventOptions =
    type === 'positive' ? POSITIVE_EVENTS : type === 'negative' ? NEGATIVE_EVENTS : NEUTRAL_EVENTS;

  const selectedEventConfig = eventOptions.find(e => e.id === eventCategory);

  const impact =
    eventCategory && selectedEventConfig
      ? previewEventImpact({
          currentTrust,
          eventCategoryId: eventCategory,
          customDelta,
        })
      : null;

  const handleSubmit = async () => {
    if (!eventCategory || !note.trim()) return;
    if (!data) {
      toast.error('人物信息加载中，请稍候');
      return;
    }

    setSaving(true);
    try {
      await add({
        type,
        eventCategory,
        affectedDimensions:
          affectedDimensions.length > 0
            ? affectedDimensions
            : selectedEventConfig?.affectedDimensions || [],
        trustDelta: customDelta,
        note: note.trim(),
      });
      // add 内部已触发 recalculateTrustBank + refresh events
      toast.success('观察记录已保存');
      router.push(`/tools/people-insight/person/${personId}`);
    } catch (err) {
      toast.error(`保存失败: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleDimension = (dimId: string) => {
    setAffectedDimensions(prev =>
      prev.includes(dimId) ? prev.filter(d => d !== dimId) : [...prev, dimId]
    );
  };

  // 切换事件性质时重置相关状态
  const handleTypeChange = (t: EventType) => {
    setType(t);
    setEventCategory('');
    setCustomDelta(undefined);
    setAffectedDimensions([]);
  };

  // 自定义分值校验：限制在 -50 到 +50
  const handleCustomDeltaChange = (val: string) => {
    if (!val) {
      setCustomDelta(undefined);
      return;
    }
    const num = Number(val);
    if (isNaN(num)) return;
    setCustomDelta(Math.max(-50, Math.min(50, num)));
  };

  const getTypeButtonStyle = (t: EventType, isActive: boolean) => {
    const base =
      'py-3 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5';
    if (!isActive) return `${base} bg-white text-[#6b6560] border-[#edeae5] hover:border-[#d5d0c8]`;
    switch (t) {
      case 'positive':
        return `${base} bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm`;
      case 'negative':
        return `${base} bg-rose-50 text-rose-700 border-rose-200 shadow-sm`;
      default:
        return `${base} bg-[#f5f2ed] text-[#6b6560] border-[#d5d0c8] shadow-sm`;
    }
  };

  // 人物不存在的兜底
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

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 pt-4 pb-3 sm:px-5 sm:pt-8 sm:pb-4">
          <button
            onClick={() => router.push(`/tools/people-insight/person/${personId}`)}
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
          <h1 className="bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] bg-clip-text text-base font-bold text-transparent">
            添加观察
          </h1>
        </header>

        <div className="space-y-4 px-4 pb-8 sm:space-y-5 sm:px-5 sm:pb-10">
          {/* Target Person Card */}
          <div className="flex items-center gap-3 rounded-[1.1rem] border border-white/60 bg-white/80 p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:gap-3.5 sm:p-4">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-[#f0ebff] to-[#e3f2fd] text-xl shadow-sm">
              {data?.person.avatar?.startsWith('data:') ? (
                <img src={data.person.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                data?.person.avatar || '\u{1F464}'
              )}
            </div>
            <div>
              <div className="font-semibold text-[#2d2a26]">{data?.person.alias}</div>
              <div className="mt-0.5 text-xs text-[#9c958c]">
                当前信任值: <span className="font-bold text-[#7c5cfc]">{currentTrust}</span>
              </div>
            </div>
          </div>

          {/* Event Type */}
          <div>
            <label className="mb-2.5 block text-sm font-semibold text-[#2d2a26]">事件性质</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {[
                { id: 'positive' as EventType, label: '正面', icon: '+' },
                { id: 'neutral' as EventType, label: '中性', icon: '·' },
                { id: 'negative' as EventType, label: '负面', icon: '\u2212' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  className={getTypeButtonStyle(t.id, type === t.id)}
                >
                  <span className="text-lg leading-none">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Event Category */}
          <div>
            <label className="mb-2.5 block text-sm font-semibold text-[#2d2a26]">事件类型</label>
            <div className="flex flex-wrap gap-2">
              {eventOptions.map(event => (
                <button
                  key={event.id}
                  onClick={() => {
                    setEventCategory(event.id);
                    setCustomDelta(undefined);
                  }}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                    eventCategory === event.id
                      ? 'border-[#7c5cfc] bg-[#7c5cfc] text-white shadow-md shadow-purple-200'
                      : 'border-[#edeae5] bg-white text-[#4a453f] hover:border-[#d5d0c8]'
                  }`}
                >
                  {event.label}
                </button>
              ))}
            </div>
            {selectedEventConfig?.description && (
              <p className="mt-2 text-xs text-[#b5afa6]">{selectedEventConfig.description}</p>
            )}
          </div>

          {/* Impact Preview */}
          {impact && (
            <div className="rounded-[1.1rem] border border-[#e0d8f7] bg-[#f0ebff] p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#6b4ce0]">信任值变化预览</span>
                <span className="text-lg font-bold text-[#7c5cfc]">
                  {currentTrust}
                  <span className="mx-1 text-[#b5afa6]">{'\u2192'}</span>
                  {impact.newTrust}
                  <span
                    className={`ml-1.5 text-sm ${impact.delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}
                  >
                    ({impact.delta >= 0 ? '+' : ''}
                    {impact.delta})
                  </span>
                </span>
              </div>
              <p className="mt-1.5 text-[0.65rem] text-[#b5afa6]">
                * 预览仅供参考，实际值以保存后计算为准
              </p>
            </div>
          )}

          {/* Custom Delta */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2d2a26]">
              自定义分值{' '}
              <span className="font-normal text-[#b5afa6]">（可选，范围 -50 ~ +50）</span>
            </label>
            <input
              type="number"
              value={customDelta ?? ''}
              onChange={e => handleCustomDeltaChange(e.target.value)}
              placeholder={`默认: ${selectedEventConfig?.defaultTrustDelta ?? 0}`}
              className="w-full rounded-xl border border-[#edeae5] bg-white px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
            />
          </div>

          {/* Affected Dimensions */}
          <div>
            <label className="mb-2.5 block text-sm font-semibold text-[#2d2a26]">影响维度</label>
            <div className="flex flex-wrap gap-2">
              {CHARACTER_DIMENSIONS.map(dim => (
                <button
                  key={dim.id}
                  onClick={() => toggleDimension(dim.id)}
                  className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                    affectedDimensions.includes(dim.id)
                      ? 'border-[#7c5cfc] bg-[#7c5cfc] text-white shadow-md shadow-purple-200'
                      : 'border-[#edeae5] bg-white text-[#4a453f] hover:border-[#d5d0c8]'
                  }`}
                >
                  {dim.label}
                </button>
              ))}
            </div>
            {affectedDimensions.length === 0 &&
              selectedEventConfig &&
              selectedEventConfig.affectedDimensions.length > 0 && (
                <p className="mt-2 text-xs text-[#b5afa6]">
                  默认影响:{' '}
                  {selectedEventConfig.affectedDimensions
                    .map(d => CHARACTER_DIMENSIONS.find(cd => cd.id === d)?.label)
                    .filter(Boolean)
                    .join('、')}
                </p>
              )}
          </div>

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#2d2a26]">观察笔记</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="记录你观察到的事实和感受..."
              rows={4}
              className="w-full resize-none rounded-xl border border-[#edeae5] bg-white px-4 py-3.5 leading-relaxed text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={saving || !eventCategory || !note.trim()}
            className="w-full rounded-xl bg-[#7c5cfc] py-3.5 font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? '保存中...' : '保存观察记录'}
          </button>
        </div>
      </div>
    </main>
  );
}
