'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  inspirations,
  categoryMeta,
  loadList,
  saveList,
  generateId,
  type GoodbyeItem,
  type ListCategory,
} from '@/data/goodbye-list/goodbyeListData';

// ── 主页面 ──
export default function GoodbyeListPage() {
  const [items, setItems] = useState<GoodbyeItem[]>(() => loadList());
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<ListCategory>('experience');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showInspirations, setShowInspirations] = useState(false);
  const [filterCategory, setFilterCategory] = useState<ListCategory | 'all'>('all');
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  // 保存
  useEffect(() => {
    saveList(items);
  }, [items]);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  // 添加
  const handleAdd = useCallback((text: string, category: ListCategory) => {
    if (!text.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        text: text.trim(),
        category,
        completed: false,
        createdAt: new Date().toISOString(),
        isCustom: true,
      },
    ]);
    setNewText('');
  }, []);

  // 从灵感添加
  const handleAddInspiration = useCallback((insp: typeof inspirations[number]) => {
    if (items.some((i) => i.text === insp.text && !i.completed)) return;
    setItems((prev) => [
      ...prev,
      {
        id: generateId(),
        text: insp.text,
        category: insp.category,
        completed: false,
        createdAt: new Date().toISOString(),
        isCustom: false,
      },
    ]);
  }, [items]);

  // 完成/取消完成
  const handleToggle = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              completed: !i.completed,
              completedAt: !i.completed ? new Date().toISOString() : undefined,
            }
          : i
      )
    );
    setJustCompleted(id);
    setTimeout(() => setJustCompleted(null), 1500);
  }, []);

  // 开始编辑
  const handleStartEdit = useCallback((id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editText.trim()) return;
    setItems((prev) =>
      prev.map((i) => (i.id === editingId ? { ...i, text: editText.trim() } : i))
    );
    setEditingId(null);
    setEditText('');
  }, [editingId, editText]);

  // 删除
  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // 过滤
  const filteredItems =
    filterCategory === 'all'
      ? items
      : items.filter((i) => i.category === filterCategory);

  const categories: ListCategory[] = ['experience', 'relationship', 'growth', 'legacy', 'courage'];

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      <nav className="sticky top-0 z-50 border-b border-[#E8D9C2]/50 bg-white/80 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/chapter/chapter-4" className="text-sm font-medium text-[#8A7E6A] hover:text-[#C87941]">
            ← 返回好好告别
          </Link>
          <h1 className="text-sm font-bold text-[#4A3728]">我的告别清单</h1>
          <div className="w-20" />
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 pt-8">
        {/* 标题 */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
            My Goodbye List
          </div>
          <h2 className="text-2xl font-bold text-[#4A3728]">我的告别清单</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
            在离开这个世界之前，你还有哪些想做的事？<br className="hidden sm:block" />
            把它们写下来，然后一件件去完成。
          </p>
        </header>

        {/* 进度条 */}
        {totalCount > 0 && (
          <div className="mb-6 rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#4A3728]">
                已完成 {completedCount} / {totalCount} 项
              </span>
              <span className="text-lg font-bold text-[#C87941]">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E8D9C2]">
              <div
                className="h-full rounded-full bg-[#C87941] transition-all duration-700"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            {completedCount >= 5 && completedCount === totalCount && (
              <p className="mt-2 text-center text-sm font-medium text-emerald-600">
                🎉 恭喜你！清单上的每一项都完成了！
              </p>
            )}
          </div>
        )}

        {/* 添加新项 */}
        <div className="mb-6 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-bold text-[#4A3728]">添加一项告别清单</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd(newText, newCategory)}
              placeholder="写下你想做的事..."
              maxLength={50}
              className="flex-1 rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ListCategory)}
              className="rounded-lg border border-[#E8D9C2] bg-white px-2 py-2 text-xs text-[#4A3728] outline-none focus:border-[#C87941]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{categoryMeta[cat].icon} {categoryMeta[cat].label}</option>
              ))}
            </select>
            <button
              onClick={() => handleAdd(newText, newCategory)}
              disabled={!newText.trim()}
              className="rounded-lg bg-[#C87941] px-4 py-2 text-sm font-bold text-white transition-all hover:bg-[#A85E2D] disabled:opacity-40"
            >
              添加
            </button>
          </div>

          {/* 灵感按钮 */}
          <button
            onClick={() => setShowInspirations(!showInspirations)}
            className="mt-3 text-xs text-[#C87941] hover:underline"
          >
            {showInspirations ? '收起灵感推荐' : '💡 需要灵感？看看这些推荐 →'}
          </button>
        </div>

        {/* 灵感推荐 */}
        {showInspirations && (
          <div className="mb-6 rounded-xl border border-[#E8D9C2] bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-bold text-[#4A3728]">💡 灵感推荐（点击快速添加）</p>
            {categories.map((cat) => {
              const catItems = inspirations.filter((i) => i.category === cat);
              const meta = categoryMeta[cat];
              return (
                <div key={cat} className="mb-4 last:mb-0">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span>{meta.icon}</span>
                    <span className="text-xs font-bold text-[#4A3728]">{meta.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {catItems.map((insp) => {
                      const alreadyAdded = items.some((i) => i.text === insp.text && !i.completed);
                      return (
                        <button
                          key={insp.id}
                          onClick={() => handleAddInspiration(insp)}
                          disabled={alreadyAdded}
                          className={`rounded-full border px-3 py-1 text-xs transition-all ${
                            alreadyAdded
                              ? 'border-[#E8D9C2] bg-[#FAF8F3] text-[#B8A888] cursor-default'
                              : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/50 hover:bg-[#FDF5EE]'
                          }`}
                        >
                          {alreadyAdded ? '✓ ' : '+ '}{insp.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 分类过滤 */}
        {totalCount > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory('all')}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                filterCategory === 'all'
                  ? 'bg-[#C87941] text-white'
                  : 'bg-white text-[#5A5A5A] border border-[#E8D9C2] hover:border-[#C87941]/50'
              }`}
            >
              全部 ({totalCount})
            </button>
            {categories.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              if (count === 0) return null;
              const meta = categoryMeta[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-[#C87941] text-white'
                      : 'bg-white text-[#5A5A5A] border border-[#E8D9C2] hover:border-[#C87941]/50'
                  }`}
                >
                  {meta.icon} {meta.label} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* 清单列表 */}
        <div className="space-y-3">
          {filteredItems.length === 0 && totalCount > 0 && (
            <p className="py-8 text-center text-sm text-[#8A7E6A]">该分类下暂无项目</p>
          )}
          {filteredItems.length === 0 && totalCount === 0 && (
            <div className="py-12 text-center">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-sm text-[#8A7E6A]">你的告别清单还是空的</p>
              <p className="text-xs text-[#B8A888] mt-1">在上方添加你想做的事，或点击「需要灵感」获取推荐</p>
            </div>
          )}
          {filteredItems.map((item) => {
            const meta = categoryMeta[item.category];
            const isJustCompleted = justCompleted === item.id && item.completed;
            return (
              <div
                key={item.id}
                className={`rounded-xl border p-4 transition-all duration-300 ${
                  item.completed
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-[#E8D9C2] bg-white'
                } ${isJustCompleted ? 'scale-[1.02] shadow-md' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* 完成按钮 */}
                  <button
                    onClick={() => handleToggle(item.id)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      item.completed
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-[#C8B8A0] bg-white hover:border-[#C87941]'
                    }`}
                  >
                    {item.completed && (
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                          className="flex-1 rounded-lg border border-[#E8D9C2] bg-white px-3 py-1 text-sm text-[#4A3728] outline-none focus:border-[#C87941]"
                          autoFocus
                        />
                        <button onClick={handleSaveEdit} className="text-xs font-medium text-[#C87941]">保存</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-[#8A7E6A]">取消</button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-sm font-medium ${
                            item.completed ? 'text-emerald-600 line-through' : 'text-[#4A3728]'
                          }`}
                        >
                          {item.text}
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
                          >
                            {meta.icon} {meta.label}
                          </span>
                          {item.completed && item.completedAt && (
                            <span className="text-[10px] text-emerald-500">
                              ✓ {new Date(item.completedAt).toLocaleDateString('zh-CN')}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* 操作按钮 */}
                  {editingId !== item.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEdit(item.id, item.text)}
                        className="rounded p-1 text-[#8A7E6A] transition-all hover:bg-[#FAF8F3] hover:text-[#C87941]"
                        title="编辑"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="rounded p-1 text-[#8A7E6A] transition-all hover:bg-red-50 hover:text-red-500"
                        title="删除"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 提示 */}
        {totalCount > 0 && totalCount < 5 && (
          <div className="mt-6 rounded-xl border border-dashed border-[#C87941]/30 bg-[#FDF5EE] p-4 text-center">
            <p className="text-sm text-[#8A7E6A]">
              至少写下 <span className="font-bold text-[#C87941]">5 项</span>告别清单，才能更完整地审视你的人生愿望。
            </p>
            <p className="mt-1 text-xs text-[#B8A888]">
              当前已添加 {totalCount} 项，还差 {5 - totalCount} 项
            </p>
          </div>
        )}

        {totalCount >= 5 && completedCount < totalCount && (
          <div className="mt-6 rounded-xl border border-[#C87941]/20 bg-[#FDF5EE] p-5 text-center">
            <p className="text-sm font-medium leading-relaxed text-[#4A3728]">
              你已经写下了 {totalCount} 件想做的事。每完成一件，就给自己的人生多画上一笔色彩。<br />
              不必急于全部完成——重要的不是速度，而是你一直在路上。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
