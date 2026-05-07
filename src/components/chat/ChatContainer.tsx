'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import type { AIMessage } from '@/lib/ai/types';

interface ChatContainerProps {
  /** 初始消息（如从历史加载） */
  initialMessages?: AIMessage[];
  /** 关联的对话 ID */
  conversationId?: string | null;
}

export function ChatContainer({
  initialMessages = [],
  conversationId,
}: ChatContainerProps) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [currentConvId] = useState<string | null>(conversationId ?? null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(
    async (text: string) => {
      if (!user) return;

      // 用户消息立即显示
      const userMsg: AIMessage = { role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      // 取消上一个请求
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        // 调用 SSE 流式 API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg],
            conversationId: currentConvId,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        // 如果是对话 ID 尚未设置，尝试从响应头或结果中获取（这里简化为 state 更新）
        // 注意：首次创建对话时，API 会在流结束后更新 conversationId
        // 目前的简化实现：前端在发送时创建对话，后续优化为 WebSocket 推送新 ID

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';

        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '' },
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                // 实时更新流式内容
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...last,
                      content: assistantContent,
                    };
                  }
                  return updated;
                });
              }
            } catch { /* ignore */ }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error('[ChatContainer]', err);

        // 显示错误消息
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '抱歉，遇到了点小问题。请稍后再试，或检查网络连接。',
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [user, messages, currentConvId]
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <MessageList
        messages={messages}
        isThinking={isThinking}
        streaming={isThinking}
      />
      <ChatInput onSend={handleSend} disabled={!user || isThinking} />
    </div>
  );
}
