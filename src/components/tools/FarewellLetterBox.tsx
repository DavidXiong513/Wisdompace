'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  conceptRows,
  letterPrompts,
  loadDraft,
  saveDraft,
  clearDraft,
  countChars,
  countFilled,
  buildPlainText,
  type LetterDraft,
} from '@/data/farewell-letter/farewellLetterData';

const toneStyle: Record<string, string> = {
  legal: 'border-[#CBDDC8] bg-[#EDF4EC] text-[#3F6B45]',
  mixed: 'border-[#EFC9C2] bg-[#FBEDEB] text-[#93372C]',
  private: 'border-[#E8D9C2] bg-[#FDF5EE] text-[#8A5A17]',
};

/**
 * FarewellLetterBox
 * 「无憾的交代」末尾的内嵌内容框：先做三个词的辨析，再给八个起笔提示。
 * 草稿每次改动自动写入浏览器本地，不上传服务器。
 */
export default function FarewellLetterBox() {
  const [draft, setDraft] = useState<LetterDraft>(() => loadDraft());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  const chars = useMemo(() => countChars(draft), [draft]);
  const filled = useMemo(() => countFilled(draft), [draft]);

  const handleChange = useCallback((id: string, value: string) => {
    setDraft(prev => ({ ...prev, [id]: value }));
  }, []);

  const handleCopy = useCallback(async () => {
    const text = buildPlainText(draft);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } catch {
        setCopied(false);
      }
      document.body.removeChild(ta);
    }
  }, [draft]);

  const handleClear = useCallback(() => {
    if (
      !window.confirm('确定清空全部草稿？\n\n清空后无法恢复，建议先点「复制全文」另存一份。')
    )
      return;
    const blank = letterPrompts.reduce<LetterDraft>((acc, p) => {
      acc[p.id] = '';
      return acc;
    }, {});
    setDraft(blank);
    clearDraft();
  }, []);

  return (
    <div className="rounded-2xl border border-[#E8D9C2] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#FDF5EE] px-2.5 py-0.5 text-[11px] font-bold tracking-[0.12em] text-[#C87941]">
          内容框
        </span>
        <h3 className="text-lg font-bold text-[#4A3728]">我的遗嘱准备 · 留给家人的话</h3>
      </div>
      <p className="mt-2 text-sm leading-[1.85] text-[#6A6256]">
        遗嘱管财，这封信管人。它不是法律文书，不处分任何财产，也不需要公证——但它可能是家人真正留下来反复看的东西。
      </p>

      {/* 三词辨析 */}
      <details open className="mt-4 rounded-xl border border-[#F0E6D6] bg-[#FAF8F3] p-4">
        <summary className="cursor-pointer list-none text-sm font-bold text-[#4A3728] marker:hidden">
          先分清三个词：遗嘱 / 遗书 / 这封信
          <span className="ml-2 text-[11px] font-normal text-[#A8927A]">点开看清区别</span>
        </summary>
        <div className="mt-3 space-y-3">
          {conceptRows.map(row => (
            <div key={row.term} className="rounded-lg border border-[#EDE2D0] bg-white p-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-[#4A3728]">{row.term}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneStyle[row.tone]}`}
                >
                  {row.tone === 'legal'
                    ? '有法律效力'
                    : row.tone === 'mixed'
                      ? '无法律效力 · 常被误解'
                      : '无法律效力'}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-[1.75] text-[#6A6256]">{row.what}</p>
              <p className="mt-1 text-[13px] leading-[1.75] text-[#6A6256]">
                <span className="font-semibold text-[#4A3728]">效力：</span>
                {row.effect}
              </p>
              <p className="mt-1 text-[13px] leading-[1.75] text-[#8A7E6A]">
                <span className="font-semibold text-[#4A3728]">用在：</span>
                {row.when}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-lg bg-[#FDF5EE] px-3.5 py-2.5 text-[13px] leading-[1.8] text-[#8A5A17]">
          一句话记住：涉及财产的部分必须写进遗嘱，这封信里写的不算数；这封信写的，是遗嘱永远装不下的那些话。
        </p>
      </details>

      {/* 隐私说明 */}
      <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#EDE2D0] bg-[#FAF8F3] px-3.5 py-2.5">
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C87941]" />
        <p className="text-[13px] leading-[1.75] text-[#8A7E6A]">
          内容只存在这台设备的浏览器里，边写边自动保存。不上传服务器，也不会出现在任何账户里。
        </p>
      </div>

      {/* 八个起笔提示 */}
      <div className="mt-5 flex items-end justify-between">
        <h4 className="flex items-center gap-2.5 text-[15px] font-bold text-[#4A3728]">
          <span className="h-3.5 w-1 rounded-full bg-[#C87941]" />
          八个起笔提示
        </h4>
        <span className="text-[11px] text-[#A8927A]">
          已写 {filled} / {letterPrompts.length} 项
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-[1.7] text-[#8A7E6A]">
        不必按顺序，也不必写完。挑一个现在有话说的，先写那一个。
      </p>

      <div className="mt-3 space-y-2">
        {letterPrompts.map((p, i) => {
          const value = draft[p.id] || '';
          const hasText = value.trim().length > 0;
          return (
            <details
              key={p.id}
              open={i === 0}
              className="group rounded-xl border border-[#EDE2D0] bg-[#FAF8F3] px-4 py-3"
            >
              <summary className="flex cursor-pointer list-none items-center gap-2.5 marker:hidden">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#C87941]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#4A3728]">
                  {p.title}
                </span>
                {hasText && (
                  <span className="shrink-0 rounded-full bg-[#EDF4EC] px-2 py-0.5 text-[10px] font-medium text-[#3F6B45]">
                    已写
                  </span>
                )}
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-[#B5A48C] transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 9l6 6 6-6"
                  />
                </svg>
              </summary>
              <p className="mt-2 text-[13px] leading-[1.7] text-[#8A7E6A]">{p.hint}</p>
              <textarea
                value={value}
                onChange={e => handleChange(p.id, e.target.value)}
                rows={p.rows}
                placeholder="在这里写……"
                className="mt-2.5 w-full resize-y rounded-xl border border-[#E8D9C2] bg-white px-3.5 py-2.5 text-[14px] leading-[1.85] text-[#3D2D22] outline-none transition placeholder:text-[#C4BDB5] focus:border-[#C87941] focus:ring-[3px] focus:ring-[#FDF5EE]"
              />
            </details>
          );
        })}
      </div>

      {/* 操作条 */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-[#EDE2D0] bg-[#FAF8F3] px-4 py-3">
        <div className="min-w-0 flex-1 text-xs text-[#A8927A]">
          已写 <span className="font-bold text-[#C87941]">{chars}</span> 字 · 只存在本机
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded-full border border-[#E8D9C2] bg-white px-4 py-1.5 text-xs font-medium text-[#8A7E6A] transition hover:border-[#D9A9A0] hover:text-[#93372C]"
        >
          清空
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={chars === 0}
          className="shrink-0 rounded-full bg-[#C87941] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? '已复制' : '复制全文'}
        </button>
      </div>

      {/* 三个提醒 */}
      <ul className="mt-4 space-y-2">
        {[
          '不必等「到时候」才写，也不必一次写完。一年改一次很正常，人的想法本来就会变。',
          '写完放在哪里、让谁在什么时候找到它——这件事跟写同样重要。',
          '涉及财产的安排，必须另立遗嘱。这封信里写的不产生任何分配效果。',
        ].map(text => (
          <li key={text} className="flex gap-2.5 text-[13px] leading-[1.8] text-[#8A7E6A]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D9C6AC]" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
