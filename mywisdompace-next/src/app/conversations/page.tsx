'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';

interface Conversation {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

function ConversationsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 加载对话列表
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error();
      const json = await res.json();
      setConversations(json.data ?? []);
    } catch {
      console.error('[conversations] Failed to load');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user, fetchConversations]);

  // 创建新对话
  const handleNewChat = useCallback(async () => {
    if (!user) return;
    setCreating(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      router.push(`/conversations/${json.data.id}`);
    } catch {
      console.error('[conversations] Failed to create');
      setCreating(false);
    }
  }, [user, router]);

  // 删除对话
  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm('确定要删除这个对话吗？')) return;

      try {
        await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
        setConversations((prev) => prev.filter((c) => c.id !== id));
      } catch {
        console.error('[conversations] Failed to delete');
      }
    },
    []
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h1 className="font-serif text-lg text-stone-800">我的对话</h1>
          </div>
          <button
            onClick={handleNewChat}
            disabled={creating || !user}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600
              disabled:bg-stone-200 text-white text-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            新对话
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {!user ? (
          <div className="text-center text-stone-500 text-sm py-12">
            <p>请先 <Link href="/login" className="text-amber-600 underline">登录</Link> 查看对话历史</p>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-stone-200 h-16 animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🌿</div>
            <p className="text-stone-500 text-sm mb-6">还没有对话记录</p>
            <button
              onClick={handleNewChat}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm transition-colors"
            >
              开始第一次对话
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                href={`/conversations/${conv.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200
                  hover:border-amber-200 hover:shadow-sm transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 truncate font-medium">
                    {conv.title || '新的对话'}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">{formatDate(conv.updated_at)}</p>
                </div>
                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  className="opacity-0 group-hover:opacity-100 ml-3 p-1.5 text-stone-400 hover:text-red-500
                    hover:bg-red-50 rounded-lg transition-all"
                  aria-label="删除对话"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 3.5h10M5.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3.5 3.5l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <ConversationsContent />
    </Suspense>
  );
}
