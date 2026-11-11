'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  vowPaths,
  vowLead,
  vowPrivacyNote,
  vowClosing,
  fotang,
  type VowPathId,
} from '@/data/future-vow/futureVowData';

const STORAGE_KEY = 'wisdompace:future-vow:v1';

type Draft = {
  path: VowPathId | null;
  text: string;
};

const VALID_PATHS: VowPathId[] = ['faith', 'memory', 'blank'];

function emptyDraft(): Draft {
  return { path: null, text: '' };
}

function loadDraft(): Draft {
  if (typeof window === 'undefined') return emptyDraft();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyDraft();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyDraft();
    const o = parsed as Record<string, unknown>;
    const path = VALID_PATHS.includes(o.path as VowPathId) ? (o.path as VowPathId) : null;
    const text = typeof o.text === 'string' ? o.text.slice(0, 2000) : '';
    return { path, text };
  } catch {
    return emptyDraft();
  }
}

function saveDraft(draft: Draft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* 本地存储不可用时静默降级，页面仍可用 */
  }
}

export default function FutureVowBox() {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft());
  const skipFirstSave = useRef(true);

  useEffect(() => {
    const loaded = loadDraft();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载后读取本地草稿，避免 SSR 与首帧不一致
    setDraft(loaded);
  }, []);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveDraft(draft);
  }, [draft]);

  const pick = useCallback((id: VowPathId) => {
    setDraft(prev => ({ ...prev, path: prev.path === id ? null : id }));
  }, []);

  const clear = useCallback(() => {
    if (!window.confirm('确定清空这句志愿？\n\n清空后无法恢复。')) return;
    setDraft(emptyDraft());
  }, []);

  const current = vowPaths.find(p => p.id === draft.path) ?? null;
  const showFaithLink = draft.path === 'faith';
  const hasText = draft.text.trim().length > 0;

  return (
    <div className="mt-6 rounded-2xl border border-[#E8D9C2] bg-white/80 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#FDF5EE] px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[#A85E2D]">
          VOLUNTARY
        </span>
        <h3 className="font-serif text-[19px] font-bold tracking-wide text-[#4A3728]">
          写一句，或者留空
        </h3>
      </div>

      <p className="mt-3 text-[13px] leading-[1.8] text-[#8A7E6A]">{vowLead}</p>

      {/* 三条路 */}
      <div className="mt-4 space-y-2">
        {vowPaths.map(p => {
          const active = draft.path === p.id;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => pick(p.id)}
              className={`w-full rounded-xl border px-3.5 py-3 text-left transition ${
                active
                  ? 'border-[#C87941] bg-[#FDF5EE]'
                  : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                    active ? 'border-[#C87941]' : 'border-[#D9C6AC]'
                  }`}
                >
                  {active && <span className="h-2 w-2 rounded-full bg-[#C87941]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13.5px] font-semibold text-[#4A3728]">
                    {p.label}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] text-[#A8927A]">{p.sub}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 选中后的书写区 */}
      {current && (
        <div className="mt-4 rounded-xl border border-[#E8D9C2] bg-[#FDFBF5] px-4 py-4">
          <p className="text-[12.5px] leading-[1.8] text-[#8A7E6A]">{current.prompt}</p>

          {current.id === 'blank' ? (
            <p className="mt-3 rounded-lg border border-dashed border-[#D9C6AC] px-4 py-6 text-center text-[12.5px] text-[#A8927A]">
              这一格先空着。想好了再回来。
            </p>
          ) : (
            <>
              <textarea
                value={draft.text}
                onChange={e => setDraft(prev => ({ ...prev, text: e.target.value.slice(0, 2000) }))}
                rows={4}
                placeholder={current.placeholder}
                className="mt-2.5 w-full resize-y rounded-lg border border-[#E8D9C2] bg-white px-3.5 py-3 font-serif text-[15px] leading-[1.9] text-[#4A3728] outline-none placeholder:text-[#C4B49C] focus:border-[#C87941]"
              />
              {current.samples.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#A8927A]">没有头绪？点一句借来用：</span>
                  {current.samples.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, text: s }))}
                      className="rounded-full border border-[#E8D9C2] bg-white px-2.5 py-1 text-[11.5px] text-[#8A7E6A] transition hover:border-[#C87941] hover:text-[#A85E2D]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[#B5A48C]">{draft.text.length} / 2000</span>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    disabled={!hasText}
                    className="rounded-full border border-[#E8D9C2] bg-white px-4 py-1.5 text-[12px] font-medium text-[#6A6256] transition hover:border-[#C87941] hover:text-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    打印这一句
                  </button>
                  <button
                    type="button"
                    onClick={clear}
                    className="text-[11.5px] text-[#B5A48C] transition hover:text-[#93372C]"
                  >
                    清空
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 可选外部出口：只在「有信仰」这一支展开，且只出现一次 */}
      {showFaithLink && (
        <div className="mt-4 rounded-xl border border-[#CFDCE8] bg-[#F4F7FA] px-4 py-3.5">
          <p className="text-[12.5px] font-semibold text-[#3D5A73]">{fotang.lead}</p>
          <p className="mt-1.5 text-[12px] leading-[1.75] text-[#5C7590]">{fotang.desc}</p>
          <a
            href={fotang.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#B9CADE] bg-white px-3.5 py-1.5 text-[12px] font-medium text-[#3D5A73] transition hover:border-[#3D5A73]"
          >
            {fotang.name}
            <span className="text-[10px]">↗</span>
          </a>
          <p className="mt-2 text-[11px] leading-[1.7] text-[#8FA3B5]">{fotang.disclosure}</p>
        </div>
      )}

      <p className="mt-3 border-t border-[#F0E6D6] pt-3 text-[11.5px] leading-[1.7] text-[#A8927A]">
        {vowPrivacyNote}
      </p>
      <p className="mt-1 text-[11.5px] leading-[1.7] text-[#A8927A]">{vowClosing}</p>
    </div>
  );
}
