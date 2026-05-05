'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import type { SaveStatus } from '@/hooks/useReflectionAnswers';

interface ReflectionAnswerBoxProps {
  questionIndex: number;
  initialValue?: string;
  onSave: (index: number, text: string) => void;
  status?: SaveStatus;
}

export function ReflectionAnswerBox({
  questionIndex,
  initialValue = '',
  onSave,
  status,
}: ReflectionAnswerBoxProps) {
  const [text, setText] = useState(initialValue);
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = !!user;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setText(val);
      onSave(questionIndex, val);
    },
    [questionIndex, onSave]
  );

  const charCount = text.length;
  const isEmpty = charCount === 0;

  // 状态提示文字与颜色
  let statusText = '';
  let statusColor = '#A8927A';
  if (status === 'saving') {
    statusText = '保存中…';
    statusColor = '#C9A15A';
  } else if (status === 'saved') {
    statusText = isLoggedIn ? '已同步到云端 ✓' : '已保存到本地 ✓';
    statusColor = '#7A9E7E';
  } else if (status === 'error') {
    statusText = '同步失败，已保留本地';
    statusColor = '#C45B4A';
  }

  return (
    <div className="mt-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder="写下你的想法…"
          rows={3}
          className="w-full resize-y rounded-xl px-3.5 py-2.5 text-sm leading-relaxed outline-none transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid #E8D9C2',
            color: '#4A3728',
            fontFamily: 'var(--wp-font-sans)',
            minHeight: '80px',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#C9A15A';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 161, 90, 0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E8D9C2';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />

        {/* 右上角字数统计 */}
        <span
          className="pointer-events-none absolute bottom-2 right-3 text-[11px]"
          style={{ color: isEmpty ? '#C9BBA0' : '#A8927A' }}
        >
          {charCount} 字
        </span>
      </div>

      {/* 底部状态栏 */}
      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusText && (
            <span className="text-xs" style={{ color: statusColor }}>
              {statusText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isLoggedIn && !isEmpty && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: '#F5EDE0', color: '#A8927A' }}
            >
              登录后可云端保存
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
