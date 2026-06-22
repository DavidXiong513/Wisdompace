'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  usePersons,
  useCreatePerson,
  useDeletePerson,
  useArchivePerson,
  useUnarchivePerson,
} from '@/knowpeople/hooks/usePersons';
import { useEventCounts } from '@/knowpeople/hooks/useObserve';
import { CATEGORIES, getSubCategories } from '@/knowpeople/core/constants/categories';
import { calculateTrustReliability } from '@/knowpeople/core/calculators/trustBank';
import {
  getTrustTextColor,
  getTrustBarColor,
  getCategoryColorClass,
  formatKnownDuration,
} from '@/knowpeople/lib/trustColors';
import { useToast } from '@/knowpeople/components/ui/Toast';
import type { PersonCategory, PersonStatus, CreatePersonInput } from '@/knowpeople/core/models';
import Link from 'next/link';

export default function Home() {
  const toast = useToast();
  const [selectedCategory, setSelectedCategory] = useState<PersonCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updatedAt' | 'trustValue' | 'knownSince'>('updatedAt');
  const [statusTab, setStatusTab] = useState<PersonStatus | 'all'>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [firstImpression, setFirstImpression] = useState(50);
  const [firstImpressionNote, setFirstImpressionNote] = useState('');
  const [knownSince, setKnownSince] = useState(''); // yyyy-mm-dd 字符串
  const [newPerson, setNewPerson] = useState<Partial<CreatePersonInput>>({
    category: 'friend',
    subCategory: 'close',
  });
  const [customSubCategory, setCustomSubCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 搜索防抖：300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 图片上传处理：压缩 + 转 base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      e.target.value = '';
      return;
    }

    // 校验文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // 居中裁剪
        const min = Math.min(img.width, img.height);
        const sx = (img.width - min) / 2;
        const sy = (img.height - min) / 2;
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        // 使用函数式更新避免闭包陷阱
        setNewPerson(prev => ({ ...prev, avatar: dataUrl }));
      };
      img.onerror = () => {
        toast.error('图片加载失败，可能已损坏');
      };
      img.src = ev.target?.result as string;
    };
    reader.onerror = () => {
      toast.error('文件读取失败');
    };
    reader.readAsDataURL(file);
    // 重置 input 以便重新选择同一文件
    e.target.value = '';
  };

  const filters = useMemo(() => {
    const f: { category?: PersonCategory; query?: string; status?: PersonStatus } = {};
    if (selectedCategory !== 'all') f.category = selectedCategory;
    if (debouncedSearch.trim()) f.query = debouncedSearch.trim();
    if (statusTab !== 'all') f.status = statusTab;
    return f;
  }, [selectedCategory, debouncedSearch, statusTab]);

  const { persons, loading, refresh } = usePersons(filters);
  const { create, loading: creating } = useCreatePerson();
  const { delete: deletePerson, loading: deleting } = useDeletePerson();
  const { archive: archivePerson, loading: archiving } = useArchivePerson();
  const { unarchive: unarchivePerson } = useUnarchivePerson();
  const { counts: eventCounts, refresh: refreshEventCounts } = useEventCounts();

  // 排序后的人物列表
  const sortedPersons = useMemo(() => {
    const list = [...persons];
    switch (sortBy) {
      case 'trustValue':
        return list.sort((a, b) => b.trustValue - a.trustValue);
      case 'knownSince':
        return list.sort((a, b) => {
          const aTime = a.knownSince ? new Date(a.knownSince).getTime() : 0;
          const bTime = b.knownSince ? new Date(b.knownSince).getTime() : 0;
          return bTime - aTime; // 认识最久的在前
        });
      case 'updatedAt':
      default:
        return list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    }
  }, [persons, sortBy]);

  // 历史标签：从当前列表中提取去重后的标签列表
  const historicalTags = useMemo(() => {
    const tagSet = new Set<string>();
    (persons || []).forEach(p => {
      (p.tags || []).forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [persons]);

  const handleCreate = async () => {
    if (!newPerson.alias?.trim()) return;
    const input: CreatePersonInput = {
      ...newPerson,
      subCategory:
        newPerson.subCategory === 'custom'
          ? customSubCategory.trim() || 'custom'
          : newPerson.subCategory || 'close',
      firstImpression,
      firstImpressionNote: firstImpressionNote.trim() || undefined,
      ...(knownSince ? { knownSince: new Date(knownSince + 'T00:00:00') } : {}),
    } as CreatePersonInput;
    try {
      await create(input);
      toast.success('人物添加成功');
      setShowAddModal(false);
      setFirstImpression(50);
      setFirstImpressionNote('');
      setKnownSince('');
      setNewPerson({ category: 'friend', subCategory: 'close' });
      setCustomSubCategory('');
      setTagInput('');
      refresh();
      refreshEventCounts();
    } catch (err) {
      toast.error(`添加失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleDelete = async (id: string, alias: string) => {
    if (!confirm(`确定永久删除「${alias}」及其所有观察记录？\n（不可恢复，建议改用"归档")`)) return;
    try {
      await deletePerson(id);
      toast.success(`已删除「${alias}」`);
      refresh();
      refreshEventCounts();
    } catch (err) {
      toast.error(`删除失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleArchive = async (id: string, alias: string) => {
    if (!confirm(`将「${alias}」移入冷宫？\n数据保留，但不在活跃列表中显示。`)) return;
    try {
      await archivePerson(id);
      toast.success(`已将「${alias}」移入冷宫`);
      refresh();
    } catch (err) {
      toast.error(`操作失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleUnarchive = async (id: string, alias: string) => {
    try {
      await unarchivePerson(id);
      toast.success(`已恢复「${alias}」`);
      refresh();
    } catch (err) {
      toast.error(`操作失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    setNewPerson(prev => {
      const current = prev.tags || [];
      if (current.includes(tag)) return prev;
      return { ...prev, tags: [...current, tag] };
    });
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setNewPerson(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag),
    }));
  };

  const getCategoryLabel = (id: string) => CATEGORIES.find(c => c.id === id)?.label || id;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <header className="px-4 pt-5 pb-3 sm:px-5 sm:pt-8 sm:pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] bg-clip-text text-[1.65rem] font-bold tracking-tight text-transparent">
                慧眼识人
              </h1>
              <p className="mt-0.5 text-xs text-[#9c958c]">
                清楚交代 · 第三章
                <Link href="/chapter/chapter-3" className="ml-1 text-[#7c5cfc] hover:underline">
                  返回章节
                </Link>
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cfc] to-[#5b8def] text-xl text-white shadow-lg shadow-purple-200/50 transition-all hover:shadow-purple-300/60 active:scale-95"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="px-4 pb-2.5 sm:px-5 sm:pb-3">
          <div className="relative">
            <svg
              className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#c4bdb5]"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索代号或标签..."
              className="w-full rounded-xl border border-[#edeae5] bg-white/80 py-2.5 pr-4 pl-10 text-sm text-[#2d2a26] shadow-sm backdrop-blur-sm transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-[#c4bdb5] hover:text-[#6b6560]"
              >
                <svg
                  width="14"
                  height="14"
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
            )}
          </div>
        </div>

        {/* Category Tabs — 自适应换行，无需横滑 */}
        <div className="px-4 pb-3 sm:px-5 sm:pb-4">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#7c5cfc] text-white shadow-sm'
                  : 'border border-[#edeae5] bg-white text-[#6b6560] hover:border-[#d5d0c8]'
              }`}
            >
              全部
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as PersonCategory)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#7c5cfc] text-white shadow-sm'
                    : 'border border-[#edeae5] bg-white text-[#6b6560] hover:border-[#d5d0c8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Status + Sort row */}
          <div className="mb-2 flex items-center gap-2">
            <span className="shrink-0 text-[0.65rem] text-[#b5afa6]">状态</span>
            {[
              { id: 'active' as const, label: '活跃' },
              { id: 'archived' as const, label: '冷宫' },
              { id: 'all' as const, label: '全部' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setStatusTab(opt.id)}
                className={`rounded-full px-2 py-0.5 text-[0.65rem] font-medium transition-all ${
                  statusTab === opt.id
                    ? opt.id === 'archived'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-[#f0ebff] text-[#7c5cfc]'
                    : 'border border-[#edeae5] bg-white text-[#9c958c] hover:border-[#d5d0c8]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Person List */}
        <div className="space-y-2.5 px-4 pb-6 sm:space-y-3 sm:px-5 sm:pb-8">
          {loading ? (
            <div className="py-20 text-center text-[#b5afa6]">
              <div className="mb-3 inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#e0dbd4] border-t-[#7c5cfc]" />
              <p className="text-sm">加载中...</p>
            </div>
          ) : sortedPersons.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-gradient-to-br from-[#f0ebff] to-[#e3f2fd] text-3xl shadow-sm">
                👤
              </div>
              <p className="font-medium text-[#6b6560]">
                {searchQuery ? '未找到匹配的人物' : '还没有记录的人物'}
              </p>
              <p className="mt-1.5 text-sm text-[#b5afa6]">
                {searchQuery ? '尝试其他关键词' : '点击右上角添加第一个观察对象'}
              </p>
            </div>
          ) : (
            sortedPersons.map(person => (
              <div
                key={person.id}
                className="rounded-2xl border border-white/60 bg-white p-4 shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-300 hover:border-[#e8e4f8] hover:shadow-[0_6px_20px_rgba(124,92,252,0.1)]"
              >
                <Link href={`/tools/people-insight/person/${person.id}`} className="block">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar */}
                    <div className="flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/80 bg-gradient-to-br from-[#f0ebff] to-[#e3f2fd] text-[1.35rem] shadow-sm">
                      {person.avatar?.startsWith('data:') ? (
                        <img src={person.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        person.avatar || '👤'
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-[0.95rem] font-semibold text-[#2d2a26]">
                          {person.alias}
                        </h3>
                        <div className="flex shrink-0 items-center gap-1">
                          <span className="text-[0.6rem] text-[#c4bdb5]">信任</span>
                          <span
                            className={`text-sm font-bold ${getTrustTextColor(person.trustValue)}`}
                          >
                            {person.trustValue}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${getCategoryColorClass(person.category)}`}
                        >
                          {getCategoryLabel(person.category)}
                        </span>
                        {person.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#f5f2ed] px-2 py-0.5 text-[0.7rem] text-[#9c958c]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2.5">
                        {/* Trust bar + reliability */}
                        <div className="flex items-center gap-2.5">
                          <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#f5f2ed]">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${getTrustBarColor(person.trustValue)}`}
                              style={{ width: `${person.trustValue}%` }}
                            />
                          </div>
                          {(() => {
                            const tr = calculateTrustReliability({
                              createdAt: person.knownSince ?? person.createdAt,
                              observeCount: eventCounts[person.id] || 0,
                            });
                            return (
                              <div className="flex shrink-0 items-center gap-1.5">
                                <span className="text-[0.65rem] text-[#c4bdb5]">可信</span>
                                <span
                                  className={`text-[0.7rem] font-semibold ${
                                    tr.score >= 70
                                      ? 'text-emerald-500'
                                      : tr.score >= 30
                                        ? 'text-amber-500'
                                        : 'text-[#c4bdb5]'
                                  }`}
                                >
                                  {tr.score}%
                                </span>
                                <span className="text-[0.6rem] text-[#d4cec6]">
                                  {tr.daysSinceCreation}天
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                <div className="mt-2.5 flex justify-end gap-3 border-t border-[#f7f5f2] pt-2">
                  {statusTab === 'archived' ? (
                    <button
                      onClick={() => handleUnarchive(person.id, person.alias)}
                      className="text-[0.7rem] font-medium text-emerald-500 transition hover:text-emerald-600"
                    >
                      恢复
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleArchive(person.id, person.alias)}
                        disabled={archiving}
                        className="text-[0.7rem] text-[#b5afa6] transition hover:text-slate-500"
                      >
                        归档
                      </button>
                      <button
                        onClick={() => handleDelete(person.id, person.alias)}
                        disabled={deleting}
                        className="text-[0.7rem] text-[#d4cec6] transition hover:text-red-400"
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
            <div className="relative w-full max-w-md">
              <div className="animate-slide-up max-h-[92vh] overflow-y-auto rounded-t-[1.75rem] bg-white p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] sm:rounded-[1.75rem] sm:p-6">
                {/* 拖拽指示条 - 移动端可见 */}
                <div className="mb-3 flex justify-center sm:hidden">
                  <div className="h-1 w-10 rounded-full bg-[#e0dbd4]" />
                </div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-[#2d2a26]">添加人物</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f2ed] text-[#9c958c] transition hover:bg-[#edeae5]"
                  >
                    <svg
                      width="14"
                      height="14"
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

                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">代号</label>
                    <input
                      type="text"
                      value={newPerson.alias || ''}
                      onChange={e => setNewPerson({ ...newPerson, alias: e.target.value })}
                      placeholder="给对方一个代号（非真名）"
                      className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">
                        分类
                      </label>
                      <select
                        value={newPerson.category}
                        onChange={e =>
                          setNewPerson({
                            ...newPerson,
                            category: e.target.value as PersonCategory,
                            subCategory: getSubCategories(e.target.value)[0]?.id,
                          })
                        }
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
                      <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">
                        细分
                      </label>
                      {newPerson.subCategory === 'custom' ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="请输入自定义关系名称"
                            value={customSubCategory}
                            onChange={e => setCustomSubCategory(e.target.value)}
                            className="flex-1 rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bfb8] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setNewPerson({
                                ...newPerson,
                                subCategory:
                                  getSubCategories(newPerson.category || 'friend')[0]?.id ||
                                  'normal',
                              })
                            }
                            className="rounded-xl border border-[#edeae5] px-3 py-2 text-sm text-[#6b6560] transition hover:bg-[#f5f2ed]"
                          >
                            返回
                          </button>
                        </div>
                      ) : (
                        <select
                          value={newPerson.subCategory}
                          onChange={e =>
                            setNewPerson({ ...newPerson, subCategory: e.target.value })
                          }
                          className="w-full appearance-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
                        >
                          {getSubCategories(newPerson.category || 'friend').map(sub => (
                            <option key={sub.id} value={sub.id}>
                              {sub.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Avatar */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#6b6560]">头像</label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {/* Photo upload */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition-all ${
                          newPerson.avatar?.startsWith('data:')
                            ? 'scale-110 border-[#7c5cfc] ring-2 ring-[#f0ebff]'
                            : 'border-[#edeae5] bg-[#faf8f5] hover:border-[#d5d0c8]'
                        }`}
                        title="上传照片"
                      >
                        {newPerson.avatar?.startsWith('data:') ? (
                          <img
                            src={newPerson.avatar}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#9c958c"
                            strokeWidth="2"
                            strokeLinecap="round"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                          </svg>
                        )}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                      {/* Emoji options */}
                      {['👤', '🐱', '🐶', '🦊', '🐼', '🐨', '🦁', '🐯', '🐷', '🐸'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setNewPerson({ ...newPerson, avatar: emoji })}
                          className={`flex h-11 w-11 items-center justify-center rounded-full border text-[1.3rem] transition-all ${
                            newPerson.avatar === emoji
                              ? 'scale-110 border-[#7c5cfc] bg-[#f0ebff] ring-2 ring-[#f0ebff]'
                              : 'border-[#edeae5] bg-[#faf8f5] hover:border-[#d5d0c8]'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Known Since */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-[#6b6560]">认识时间</label>
                      <span className="text-[0.7rem] text-[#c4bdb5]">不填则默认今天</span>
                    </div>
                    <input
                      type="date"
                      value={knownSince}
                      onChange={e => setKnownSince(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-sm text-[#2d2a26] transition outline-none focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
                    />
                    {knownSince &&
                      (() => {
                        const duration = formatKnownDuration(knownSince);
                        if (!duration) return null;
                        return (
                          <p className="mt-1.5 text-[0.75rem] font-medium text-[#7c5cfc]">
                            已认识约 {duration}
                          </p>
                        );
                      })()}
                  </div>

                  {/* First Impression Slider */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium text-[#6b6560]">直观感受</label>
                      <span className="text-sm font-bold text-[#7c5cfc]">
                        {firstImpression}
                        <span className="font-normal text-[#c4bdb5]">/100</span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={firstImpression}
                      onChange={e => setFirstImpression(Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#e8e4df] accent-[#7c5cfc]"
                    />
                    <div className="mt-1 flex justify-between text-[0.65rem] text-[#c4bdb5]">
                      <span>很不好</span>
                      <span>一般</span>
                      <span>非常好</span>
                    </div>
                  </div>

                  {/* First Impression Note */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">
                      第一印象备注 <span className="font-normal text-[#c4bdb5]">（可选）</span>
                    </label>
                    <textarea
                      value={firstImpressionNote}
                      onChange={e => setFirstImpressionNote(e.target.value)}
                      placeholder="如：眼神真诚、感觉有点紧张、一见如故..."
                      rows={2}
                      className="w-full resize-none rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-sm leading-relaxed text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#6b6560]">
                      标签 <span className="font-normal text-[#c4bdb5]">（可选）</span>
                    </label>
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                        placeholder="输入标签按回车添加"
                        className="flex-1 rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-2.5 text-sm text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
                      />
                      <button
                        onClick={addTag}
                        className="rounded-xl bg-[#f0ebff] px-4 py-2.5 text-sm font-semibold text-[#7c5cfc] transition hover:bg-[#e0d8f7]"
                      >
                        添加
                      </button>
                    </div>
                    {(newPerson.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {(newPerson.tags || []).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-[#f0ebff] px-2.5 py-1 text-[0.75rem] font-medium text-[#7c5cfc]"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
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
                    )}
                    {/* 历史标签建议 */}
                    {(() => {
                      const currentTags = newPerson.tags || [];
                      const suggestions = historicalTags.filter(t => !currentTags.includes(t));
                      if (suggestions.length === 0) return null;
                      return (
                        <div className="mt-2">
                          <span className="mb-1 block text-[0.7rem] text-[#c4bdb5]">
                            历史标签：
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {suggestions.map(tag => (
                              <button
                                key={tag}
                                onClick={() =>
                                  setNewPerson({ ...newPerson, tags: [...currentTags, tag] })
                                }
                                className="rounded-full bg-[#f5f2ed] px-2 py-0.5 text-[0.7rem] font-medium text-[#9c958c] transition hover:bg-[#f0ebff] hover:text-[#7c5cfc]"
                              >
                                + {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={creating || !newPerson.alias?.trim()}
                    className="w-full rounded-xl bg-[#7c5cfc] py-3.5 font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {creating ? '添加中...' : '确认添加'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
