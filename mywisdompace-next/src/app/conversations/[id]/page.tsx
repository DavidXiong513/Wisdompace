'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { ChatContainer } from '@/components/chat/ChatContainer';
import type { AIMessage } from '@/lib/ai/types';

interface ConversationData {
  id: string;
  title: string | null;
  messages: AIMessage[];
}

function ConversationDetail() {
  const params = useParams();
  const user = useAuthStore((s) => s.user);
  const id = params.id as string;

  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchConversation = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (!res.ok) throw new Error();
      const json = await res.json();
      setConversation(json.data ?? null);
    } catch {
      console.error('[conversation detail] Failed to load');
    } finally {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    if (user) fetchConversation();
  }, [user, fetchConversation]);

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-500 text-sm">
          请先 <Link href="/login" className="text-amber-600 underline">登录</Link>
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-sm animate-pulse">加载中...</div>
      </div>
    );
  }

  if (notFound || !conversation) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
        <p className="text-stone-500 text-sm">对话不存在或已被删除</p>
        <Link href="/conversations" className="text-amber-600 text-sm underline">
          返回对话列表
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-stone-50">
      {/* 顶部栏 */}
      <header className="flex-shrink-0 bg-white border-b border-stone-200 px-4 h-14 flex items-center gap-3">
        <Link
          href="/conversations"
          className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          aria-label="返回对话列表"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-medium text-stone-800 truncate">
            {conversation.title || '新的对话'}
          </h1>
        </div>
        <div className="flex-shrink-0 text-xs text-stone-400">
          ✨ AI 助手
        </div>
      </header>

      {/* 聊天区域 */}
      <div className="flex-1 flex flex-col max-w-3xl w-full mx-auto px-4 py-4">
        <ChatContainer
          initialMessages={conversation.messages as AIMessage[]}
          conversationId={conversation.id}
        />
      </div>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <ConversationDetail />
    </Suspense>
  );
}
