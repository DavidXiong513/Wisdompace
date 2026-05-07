'use client';

import React from 'react';
import type { AIMessage } from '@/lib/ai/types';

interface MessageBubbleProps {
  message: AIMessage;
  streaming?: boolean; // 是否正在流式输出中
}

export function MessageBubble({ message, streaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}>
      {/* 头像 */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isUser
            ? 'bg-amber-100 text-amber-700'
            : 'bg-stone-200 text-stone-600'
        }`}
      >
        {isUser ? '👤' : '✨'}
      </div>

      {/* 消息内容 */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 leading-relaxed text-sm ${
          isUser
            ? 'bg-amber-50 text-stone-800 rounded-tr-sm'
            : isAssistant
            ? 'bg-stone-100 text-stone-800 rounded-tl-sm'
            : 'bg-red-50 text-red-700'
        } ${streaming ? 'opacity-80' : ''}`}
        style={{ wordBreak: 'break-word', textAlign: 'justify', textJustify: 'inter-ideograph' as React.CSSProperties['textJustify'] }}
      >
        {message.content}
        {streaming && (
          <span className="inline-block w-1.5 h-3.5 bg-amber-500 ml-0.5 rounded-sm animate-pulse vertical-bottom" />
        )}
      </div>
    </div>
  );
}
