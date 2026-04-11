'use client';

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动高度
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    adjustHeight();
  };

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-stone-200 bg-white px-4 py-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        {/* 输入框 */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="输入消息...（Enter 发送，Shift+Enter 换行）"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800
            placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-300
            disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          style={{ maxHeight: '120px', lineHeight: '1.6' }}
        />

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-stone-200
            disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center
            active:scale-95"
          aria-label="发送"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 8L2 2L8 8M14 8L2 14L8 8M14 8L8 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-stone-400 mt-2">
        AI 助手基于《一生的整理》内容生成，仅供参考
      </p>
    </div>
  );
}
