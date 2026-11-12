'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  VOW_PATH_IDS,
  emptyVowDraft,
  getVowPath,
  loadVowDraft,
  saveVowDraft,
  clearVowDraft,
  trailTip,
  vowIntro,
  vowPaths,
  walkVow,
  type VowDraft,
  type VowOption,
  type VowPathId,
} from '@/data/future-vow/vowTree';

const LINE_MAX = 600;

/** 已选路径回显：点任意一层可退回该层重选 */
function Trail({
  pathLabel,
  trail,
  onTruncate,
}: {
  pathLabel: string;
  trail: VowOption[];
  onTruncate: (n: number) => void;
}) {
  const chip =
    'rounded-full border border-[#E8D9C2] bg-[#FDF5EE] px-2.5 py-1 text-[11.5px] text-[#A85E2D] transition hover:border-[#C87941]';
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[11px] text-[#B5A48C]">已选</span>
      <button type="button" onClick={() => onTruncate(0)} title="点一下重选" className={chip}>
        {pathLabel}
        <span className="ml-1 text-[#C4B49C]">×</span>
      </button>
      {trail.map((o, i) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onTruncate(i)}
          title="点一下改选这一层"
          className={chip}
        >
          {o.label}
          <span className="ml-1 text-[#C4B49C]">×</span>
        </button>
      ))}
    </div>
  );
}

export default function FutureVowTool() {
  const [draft, setDraft] = useState<VowDraft>(() => emptyVowDraft());
  const [today, setToday] = useState('');
  const skipFirstSave = useRef(true);

  // 挂载后读取本地草稿；?path= 深链优先于草稿里的路径。
  useEffect(() => {
    const loaded = loadVowDraft();
    let next = loaded;
    try {
      const q = new URLSearchParams(window.location.search).get('path');
      if (q && VOW_PATH_IDS.includes(q as VowPathId)) {
        next = { ...loaded, path: q as VowPathId, picks: [] };
      }
    } catch {
      /* 取不到 query 就按草稿走 */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 挂载后读取本地草稿，避免 SSR 与首帧不一致
    setDraft(next);
    setToday(
      new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    );
  }, []);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    saveVowDraft(draft);
  }, [draft]);

  const path = useMemo(() => getVowPath(draft.path), [draft.path]);
  const walk = useMemo(() => walkVow(path, draft.picks), [path, draft.picks]);
  const tip = trailTip(walk.trail);
  const line = draft.line.trim();

  const pickPath = useCallback((id: VowPathId) => {
    setDraft(prev => ({ ...prev, path: prev.path === id ? null : id, picks: [] }));
  }, []);

  const pickOption = useCallback((depth: number, id: string) => {
    setDraft(prev => {
      const picks = prev.picks.slice(0, depth);
      picks.push(id);
      return { ...prev, picks };
    });
  }, []);

  // n = 保留前 n 层选择；0 表示回到第一层追问
  const truncateTo = useCallback((n: number) => {
    setDraft(prev => ({ ...prev, picks: prev.picks.slice(0, n) }));
  }, []);

  const reset = useCallback(() => {
    if (!window.confirm('确定清空这一页？\n\n选过的路和写过的话都会清掉，无法恢复。')) return;
    clearVowDraft();
    skipFirstSave.current = true;
    setDraft(emptyVowDraft());
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 pt-8 print:max-w-none print:px-0 print:pt-0">
      {/* 页头 */}
      <header className="mb-7 text-center print:hidden">
        <div className="mb-3 inline-block rounded-full bg-[#FDF5EE] px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C87941]">
          Voluntary
        </div>
        <h2 className="text-2xl font-bold text-[#4A3728]">来生志愿</h2>
        <p className="mt-2 text-sm leading-relaxed text-[#8A7E6A]">
          这是给自己的一句话，不必写给任何人看。
        </p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#A8927A]">{vowIntro.lead}</p>
      </header>

      {/* S1 选路 */}
      <section className="print:hidden">
        <p className="mb-3 text-sm font-bold text-[#4A3728]">{vowIntro.firstQuestion}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {vowPaths.map(p => {
            const active = draft.path === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={active}
                onClick={() => pickPath(p.id)}
                className={`rounded-xl border px-4 py-3.5 text-left transition ${
                  active
                    ? 'border-[#C87941] bg-[#FDF5EE] shadow-[0_4px_12px_rgba(200,121,65,0.10)]'
                    : 'border-[#EDE2D0] bg-white hover:border-[#D9C6AC]'
                }`}
              >
                <span className="flex items-start gap-2.5">
                  <span
                    className={`mt-[3px] flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border ${
                      active ? 'border-[#C87941]' : 'border-[#D9C6AC]'
                    }`}
                  >
                    {active && <span className="h-2 w-2 rounded-full bg-[#C87941]" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-[#4A3728]">{p.label}</span>
                    <span className="mt-0.5 block text-[11.5px] leading-relaxed text-[#A8927A]">
                      {p.sub}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-[11.5px] text-[#A8927A]">{vowIntro.fairnessNote}</p>
      </section>

      {/* S2 追问（只有四支有，最多两层） */}
      {path && walk.ask && (
        <section className="mt-5 rounded-2xl border border-[#E8D9C2] bg-white p-4 sm:p-5 print:hidden">
          {walk.trail.length > 0 && (
            <div className="mb-3">
              <Trail pathLabel={path.label} trail={walk.trail} onTruncate={truncateTo} />
            </div>
          )}
          <p className="text-[13.5px] font-semibold leading-relaxed text-[#4A3728]">
            {walk.ask.question}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {walk.ask.options.map(o => {
              const active = walk.picks[walk.picks.length - 1] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pickOption(walk.picks.length, o.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${
                    active
                      ? 'border-[#C87941] bg-[#FDF5EE] font-medium text-[#A85E2D]'
                      : 'border-[#E8D9C2] bg-white text-[#5A5A5A] hover:border-[#C87941]/60'
                  }`}
                >
                  {o.label}
                  {o.note && (
                    <span className="ml-1 text-[10.5px] font-normal text-[#B5A48C]">
                      （{o.note}）
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {walk.ask.note && (
            <p className="mt-3 border-t border-[#F2E9DA] pt-2.5 text-[11px] leading-[1.75] text-[#A8927A]">
              {walk.ask.note}
            </p>
          )}
        </section>
      )}

      {/* S3 书写 */}
      {path && !walk.ask && (
        <section className="mt-5 rounded-2xl border border-[#E8D9C2] bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-[13.5px] font-semibold text-[#4A3728]">
              {walk.write ? walk.write.question : path.label}
            </p>
            {walk.trail.length === 0 && (
              <span className="text-[11px] text-[#B5A48C] print:hidden">{walk.label}</span>
            )}
          </div>

          {walk.trail.length > 0 && (
            <div className="mt-2.5 print:hidden">
              <Trail pathLabel={path.label} trail={walk.trail} onTruncate={truncateTo} />
            </div>
          )}

          {tip && (
            <p className="mt-2.5 rounded-lg bg-[#F7F4EC] px-3 py-2 text-[11.5px] leading-[1.75] text-[#8A7E6A] print:hidden">
              {tip}
            </p>
          )}

          {walk.write === null ? (
            <p className="mt-3 rounded-lg border border-dashed border-[#D9C6AC] px-4 py-6 text-center text-[12.5px] text-[#A8927A]">
              {vowIntro.blankHint}
            </p>
          ) : (
            <>
              <p className="mt-2 text-[12px] leading-[1.8] text-[#8A7E6A]">{walk.write.prompt}</p>
              <textarea
                value={draft.line}
                onChange={e =>
                  setDraft(prev => ({ ...prev, line: e.target.value.slice(0, LINE_MAX) }))
                }
                rows={3}
                placeholder={walk.write.placeholder}
                className="mt-2.5 w-full resize-y rounded-lg border border-[#E8D9C2] bg-white px-3.5 py-3 font-serif text-[15px] leading-[1.9] text-[#4A3728] outline-none placeholder:text-[#C4B49C] focus:border-[#C87941]"
              />
              {walk.write.samples.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 print:hidden">
                  <span className="text-[11px] text-[#A8927A]">没有头绪？点一句借来改：</span>
                  {walk.write.samples.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setDraft(prev => ({ ...prev, line: s }))}
                      className="rounded-full border border-[#E8D9C2] bg-white px-2.5 py-1 text-[11.5px] text-[#8A7E6A] transition hover:border-[#C87941] hover:text-[#A85E2D]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[11px] text-[#B5A48C] print:hidden">
                {draft.line.length} / {LINE_MAX}
              </p>
            </>
          )}
        </section>
      )}

      {/* S4 结果卡 */}
      {path && !walk.ask && (
        <section className="mt-5">
          <div className="rounded-2xl border border-[#DCC9A8] bg-[#FFFDF8] p-6 shadow-[0_10px_28px_rgba(120,90,50,0.08)] print:border-none print:shadow-none">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#A85E2D]">
              {vowIntro.cardTitle}
            </p>
            <p className="mt-3 text-[11.5px] text-[#A8927A]">{walk.label}</p>
            <p className="mt-4 font-serif text-[21px] leading-[1.9] text-[#4A3728]">
              {walk.write === null ? '（留白）' : line || '（还没写）'}
            </p>
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2 border-t border-[#EFE3CE] pt-3 text-[11px] text-[#A8927A]">
              <span>一生的整理 · 好好告别</span>
              <span>写于 {today}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={!line && walk.write !== null}
              className="rounded-full border border-[#E8D9C2] bg-white px-4 py-1.5 text-[12px] font-medium text-[#6A6256] transition hover:border-[#C87941] hover:text-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              打印这一张
            </button>
            <button
              type="button"
              onClick={reset}
              className="text-[11.5px] text-[#B5A48C] transition hover:text-[#93372C]"
            >
              清空
            </button>
          </div>
        </section>
      )}

      {/* 说明与边界 */}
      <footer className="mt-8 border-t border-[#E8D9C2]/70 pt-4 print:hidden">
        <p className="text-[11.5px] leading-[1.75] text-[#A8927A]">{vowIntro.privacy}</p>
        <p className="mt-1.5 text-[11.5px] leading-[1.75] text-[#A8927A]">{vowIntro.closing}</p>
        <p className="mt-2.5 text-[11px] leading-[1.75] text-[#B5A48C]">{vowIntro.disclaimer}</p>
      </footer>
    </main>
  );
}
