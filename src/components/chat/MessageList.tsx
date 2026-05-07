'use client';

import React, { useEffect, useRef } from 'react';
import type { AIMessage } from '@/lib/ai/types';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';

interface MessageListProps {
  messages: AIMessage[];
  isThinking?: boolean;
  streaming?: boolean;
}

export function MessageList({ messages, isThinking = false, streaming = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 新消息时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streaming]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-sm gap-4 py-12">
        <div className="text-4xl">🌿</div>
        <p className="text-center max-w-xs leading-relaxed">
          我是你的<span className="text-amber-600 font-medium">人生整理顾问</span>。
          <br />
          有什么想聊的，随时告诉我。
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          message={msg}
          streaming={streaming && i === messages.length - 1}
        />
      ))}

      {isThinking && <ThinkingIndicator />}

      <div ref={bottomRef} />
    </div>
  );
}
