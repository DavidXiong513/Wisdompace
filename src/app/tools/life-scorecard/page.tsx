'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ATTRIBUTES,
  DEFAULT_GOALS,
  ELASTICITY_OPTIONS,
  EMPTY_ASSESSMENT,
  GOAL_NONE,
  GOAL_TYPES,
  MAX_PER_ATTR,
  TOTAL_MAX,
  buildGoalInsight,
  capOf,
  filledCount,
  generateReport,
  isAnswered,
  isComplete,
  missingItems,
  parseAssessment,
  parseGoals,
  type Assessment,
  type Attribute,
  type AttributeKey,
  type CeilingReason,
  type Elasticity,
  type Entry,
  type Goals,
} from './data';

// v2：模型从「固定 baseline + ceiling」换成「现状 + 弹性双问」。
// v1 的键一律不读，避免旧口径的默认分被当成用户输入。
const STORE_KEY = 'wisdompace:life-scorecard:v2';
const GOAL_KEY = 'wisdompace:life-scorecard:goals:v2';

const INK = '#4A3728';
const MUTED = '#7A6A58';
const ACCENT = '#C87941';
const TRACK = '#EDE3D6';
const BORDER = '#EADFD0';
const SOFT = '#FBF3E9';
const ROOM = '#F5D9B8';

// ── 通用本地存储（useSyncExternalStore 要求快照引用稳定） ────────────────
type Store<T> = {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
};

function makeStore<T>(key: string, fallback: T, parse: (raw: string) => T, eq: (a: T, b: T) => boolean): Store<T> {
  const eventName = `${key}:change`;
  let cached = fallback;
  let inited = false;

  const read = (): T => {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return fallback;
      return parse(raw);
    } catch {
      return fallback;
    }
  };

  return {
    subscribe: cb => {
      window.addEventListener(eventName, cb);
      window.addEventListener('storage', cb);
      return () => {
        window.removeEventListener(eventName, cb);
        window.removeEventListener('storage', cb);
      };
    },
    getSnapshot: () => {
      const next = read();
      if (inited && eq(cached, next)) return cached;
      cached = next;
      inited = true;
      return cached;
    },
    getServerSnapshot: () => fallback,
    set: next => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        window.dispatchEvent(new Event(eventName));
      } catch {
        /* 隐私模式下降级：仅内存生效 */
      }
    },
  };
}

function eqAssessment(a: Assessment, b: Assessment): boolean {
  return ATTRIBUTES.every(attr => {
    const x = a[attr.key];
    const y = b[attr.key];
    return x.score === y.score && x.elasticity === y.elasticity && x.reason === y.reason;
  });
}

function eqGoals(a: Goals, b: Goals): boolean {
  return a.custom === b.custom && a.picked.length === b.picked.length && a.picked.every(id => b.picked.includes(id));
}

const assessmentStore = makeStore<Assessment>(
  STORE_KEY,
  EMPTY_ASSESSMENT,
  raw => parseAssessment(JSON.parse(raw)),
  eqAssessment
);
const goalsStore = makeStore<Goals>(GOAL_KEY, DEFAULT_GOALS, raw => parseGoals(JSON.parse(raw)), eqGoals);

// ── 进度条 ────────────────────────────────────────────────────────────
function Progress({ done }: { done: number }) {
  const percent = Math.round((done / ATTRIBUTES.length) * 100);
  return (
    <div className="mt-5">
      <div className="flex items-baseline justify-between text-[11px]" style={{ color: MUTED }}>
        <span>已定位 {done} / {ATTRIBUTES.length}</span>
        <span>{done === ATTRIBUTES.length ? '可以出复盘单了' : `还差 ${ATTRIBUTES.length - done} 项`}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: TRACK }}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percent}%`, background: ACCENT }}
        />
      </div>
    </div>
  );
}

// ── 单项卡片 ──────────────────────────────────────────────────────────
type CardProps = {
  attr: Attribute;
  entry: Entry;
  open: boolean;
  onToggleOpen: () => void;
  onScore: (key: AttributeKey, value: number) => void;
  onElasticity: (key: AttributeKey, value: Elasticity) => void;
  onReason: (key: AttributeKey, value: CeilingReason) => void;
};

function AttributeCard({ attr, entry, open, onToggleOpen, onScore, onElasticity, onReason }: CardProps) {
  const answered = isAnswered(entry);
  const score = entry.score;
  const cap = capOf(entry);
  const room = Math.max(0, cap - (score ?? 0));
  // 「基本就这样了」之后还欠一句「是哪一种」——这是唯一会卡住进度的半完成态
  const needsReason = entry.elasticity === 'none' && entry.reason === null;

  const tag = !entry.elasticity
    ? null
    : needsReason
      ? '还差一句'
      : entry.elasticity === 'none'
        ? entry.reason === 'enough'
          ? '已够好'
          : '动不了'
        : entry.elasticity === 'high'
          ? '空间大'
          : '空间小';

  return (
    <div
      data-attr={attr.key}
      className="rounded-2xl border bg-white/70 p-4 transition-colors sm:p-5"
      style={{
        borderColor: needsReason ? ACCENT : answered ? '#DFCDB4' : BORDER,
        boxShadow: needsReason ? '0 0 0 3px rgba(200,121,65,0.12)' : 'none',
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-semibold" style={{ color: INK }}>
            {attr.name}
          </span>
          {attr.note && (
            <span className="text-[11px]" style={{ color: '#A8927A' }}>
              {attr.note}
            </span>
          )}
          {tag && (
            <span className="text-[11px]" style={{ color: needsReason ? ACCENT : MUTED }}>
              {tag}
            </span>
          )}
        </div>
        {score === null ? (
          <span className="shrink-0 text-[11px]" style={{ color: '#A8927A' }}>
            未定位
          </span>
        ) : (
          <span className="shrink-0 font-mono text-[15px] font-semibold" style={{ color: ACCENT }}>
            {score}
          </span>
        )}
      </div>

      <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
        测的是：{attr.control}
      </p>
      <p className="mt-0.5 flex gap-1.5 text-[11px] leading-relaxed" style={{ color: '#A8927A' }}>
        <span aria-hidden>—</span>
        <span>{attr.given}</span>
      </p>
      {attr.fit === 'different' && (
        <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: '#A8927A' }}>
          {attr.gap}
        </p>
      )}

      {/* 未定位：一句话 + 展开按钮 */}
      {score === null && (
        <button
          type="button"
          onClick={onToggleOpen}
          className="mt-3 w-full rounded-xl border border-dashed px-3 py-2.5 text-[13px] transition hover:border-[#C87941]"
          style={{ borderColor: '#D9C6AE', color: ACCENT }}
        >
          {open ? '收起' : '选一句最像现在的你'}
        </button>
      )}

      {/* 11 档选句 */}
      {open && (
        <ul className="mt-3 flex flex-col gap-1">
          {attr.anchors.map((text, i) => {
            const active = score === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onScore(attr.key, i)}
                  className="flex w-full items-start gap-2 rounded-lg px-2.5 py-1.5 text-left transition"
                  style={{
                    background: active ? SOFT : 'transparent',
                    outline: active ? `1px solid ${ACCENT}` : 'none',
                  }}
                >
                  <span
                    className="mt-[1px] w-5 shrink-0 text-center font-mono text-[11px]"
                    style={{ color: active ? ACCENT : '#A8927A' }}
                  >
                    {i}
                  </span>
                  <span
                    className="text-[12.5px] leading-relaxed"
                    style={{ color: active ? INK : '#5C4A38' }}
                  >
                    {text}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 已定位：现状句 + 刻度 */}
      {score !== null && (
        <>
          <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: '#5C4A38' }}>
            {attr.anchors[score]}
          </p>

          <div className="relative mt-3 h-2 w-full rounded-full" style={{ background: TRACK }}>
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${(score / MAX_PER_ATTR) * 100}%`, background: ACCENT }}
            />
            {room > 0 && (
              <div
                className="absolute inset-y-0 rounded-full"
                style={{ left: `${(score / MAX_PER_ATTR) * 100}%`, width: `${(room / MAX_PER_ATTR) * 100}%`, background: ROOM }}
              />
            )}
          </div>
          <div className="mt-1 flex justify-between text-[11px]" style={{ color: MUTED }}>
            <button type="button" onClick={onToggleOpen} className="underline decoration-dotted">
              {open ? '收起' : '改一下'}
            </button>
            <span>{room > 0 ? `你给了 ${room} 分空间` : '你说这项封顶了'}</span>
          </div>

          {/* 第二问：弹性 */}
          <div className="mt-3 border-t pt-3" style={{ borderColor: BORDER }}>
            <p className="text-[11px]" style={{ color: MUTED }}>
              往后三五年，这一项还能往上走多少？
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ELASTICITY_OPTIONS.map(opt => {
                const active = entry.elasticity === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onElasticity(attr.key, opt.value)}
                    title={opt.hint}
                    className="rounded-full border px-2.5 py-1 text-[11.5px] transition"
                    style={{
                      borderColor: active ? ACCENT : '#D9C6AE',
                      background: active ? SOFT : 'transparent',
                      color: active ? ACCENT : MUTED,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* 「基本就这样了」要说清是哪一种不动 */}
            {entry.elasticity === 'none' && (
              <div
                className="mt-2 rounded-lg px-2.5 py-2"
                style={{
                  background: needsReason ? '#FDF3E4' : SOFT,
                  borderLeft: `3px solid ${needsReason ? ACCENT : 'transparent'}`,
                }}
              >
                <p className="text-[11px]" style={{ color: needsReason ? ACCENT : MUTED }}>
                  {needsReason ? '还差一句 · 是哪一种？' : '是哪一种？这两种在报告里的读法完全不同。'}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {(
                    [
                      { value: 'enough', label: '已经够好了，不想再要更多' },
                      { value: 'stuck', label: '不是不想要，是真的动不了' },
                    ] as { value: CeilingReason; label: string }[]
                  ).map(opt => {
                    const active = entry.reason === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onReason(attr.key, opt.value)}
                        className="rounded-lg border px-2 py-1 text-[11px] transition"
                        style={{
                          borderColor: active ? ACCENT : '#D9C6AE',
                          background: active ? '#FFFFFF' : 'transparent',
                          color: active ? ACCENT : MUTED,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── 总看板（只在八项全答后出现） ──────────────────────────────────────
function TotalBoard({ assessment }: { assessment: Assessment }) {
  const report = useMemo(() => generateReport(assessment), [assessment]);

  return (
    <div className="mt-4 rounded-xl border p-4 sm:p-5" style={{ borderColor: BORDER, background: '#FBF7F1' }}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
            总 势
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold leading-none" style={{ color: INK }}>
              {report.total}
            </span>
            <span className="font-mono text-base" style={{ color: MUTED }}>
              / {TOTAL_MAX}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold leading-none" style={{ color: ACCENT }}>
            {report.potential}%
          </div>
          <div className="mt-1 text-[11px]" style={{ color: MUTED }}>
            潜力进度 · 在你的区间里
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: TRACK }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, (report.total / TOTAL_MAX) * 100)}%`, background: ACCENT }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px]" style={{ color: MUTED }}>
        <span>你自己声明的上限合计 {report.ceiling} 分</span>
        <span>离上限还差 {report.ceiling - report.total} 分</span>
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {ATTRIBUTES.map(attr => {
          const entry = assessment[attr.key];
          const score = entry.score ?? 0;
          const cap = capOf(entry);
          const room = Math.max(0, cap - score);
          return (
            <div key={attr.key}>
              <div className="flex justify-between text-[11px]" style={{ color: MUTED }}>
                <span>{attr.name}</span>
                <span className="font-mono">
                  {score}
                  <span style={{ color: '#B8A791' }}> / {cap}</span>
                </span>
              </div>
              <div className="relative mt-1 h-1.5 w-full rounded-full" style={{ background: TRACK }}>
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${(score / MAX_PER_ATTR) * 100}%`, background: INK }}
                />
                {room > 0 && (
                  <div
                    className="absolute inset-y-0 rounded-full"
                    style={{ left: `${(score / MAX_PER_ATTR) * 100}%`, width: `${(room / MAX_PER_ATTR) * 100}%`, background: ROOM }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: MUTED }}>
        总分满分 80（八项各十分），不是 50 分，也不和来生设计对齐。潜力进度的分母是你自己给每一项定的上限，不是 100。
      </p>
    </div>
  );
}

// ── 目标类型多选 ──────────────────────────────────────────────────────
function GoalPicker({
  goals,
  onToggle,
  onCustom,
}: {
  goals: Goals;
  onToggle: (id: string) => void;
  onCustom: (value: string) => void;
}) {
  const nonePicked = goals.picked.includes(GOAL_NONE);
  const count = goals.picked.filter(id => id !== GOAL_NONE).length;

  return (
    <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-7" style={{ borderColor: BORDER }}>
      <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
        参 考 · 不 是 标 签
      </div>
      <h2 className="mt-2 text-lg font-bold sm:text-xl" style={{ color: INK }}>
        你最想留下什么？
      </h2>
      <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: MUTED }}>
        可多选，也可以一条都不选。选「像你」的，不是「听起来体面」的。
        <span style={{ color: ACCENT }}> 已选 {count} 项</span>
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {GOAL_TYPES.map(goal => {
          const selected = goals.picked.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onToggle(goal.id)}
              className="rounded-xl border px-3 py-2 text-left transition"
              style={{
                borderColor: selected ? ACCENT : BORDER,
                background: selected ? SOFT : '#FFFFFF',
              }}
            >
              <span className="text-[13px] font-semibold" style={{ color: selected ? ACCENT : INK }}>
                {goal.name}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: MUTED }}>
                {goal.desc}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        aria-pressed={nonePicked}
        onClick={() => onToggle(GOAL_NONE)}
        className="mt-3 w-full rounded-xl border px-3 py-2 text-[13px] transition"
        style={{
          borderStyle: nonePicked ? 'solid' : 'dashed',
          borderColor: nonePicked ? ACCENT : '#D9C6AE',
          background: nonePicked ? SOFT : '#FFFFFF',
          color: nonePicked ? ACCENT : MUTED,
          fontWeight: nonePicked ? 600 : 400,
        }}
      >
        以上都没有——先跳过也行
      </button>

      <label className="mt-3 block">
        <span className="text-[11px]" style={{ color: MUTED }}>
          或者，用你自己的话说（选填）
        </span>
        <input
          type="text"
          value={goals.custom}
          maxLength={40}
          onChange={e => onCustom(e.target.value)}
          placeholder="我想留下的是……"
          className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-[13px] outline-none focus:border-[#C87941]"
          style={{ borderColor: BORDER, color: INK }}
        />
      </label>
    </section>
  );
}

// ── 页面 ────────────────────────────────────────────────────────────
export default function LifeScorecardPage() {
  const assessment = useSyncExternalStore(
    assessmentStore.subscribe,
    assessmentStore.getSnapshot,
    assessmentStore.getServerSnapshot
  );
  const goals = useSyncExternalStore(goalsStore.subscribe, goalsStore.getSnapshot, goalsStore.getServerSnapshot);
  const [openKey, setOpenKey] = useState<AttributeKey | null>(null);

  const handleScore = useCallback((key: AttributeKey, value: number) => {
    const cur = assessmentStore.getSnapshot();
    assessmentStore.set({ ...cur, [key]: { ...cur[key], score: value } });
    setOpenKey(null);
  }, []);

  const handleElasticity = useCallback((key: AttributeKey, value: Elasticity) => {
    const cur = assessmentStore.getSnapshot();
    // 不清空 reason：用户从「基本就这样了」切走再切回来时，
    // 之前回答过的那一句应该还在，否则会掉进「看起来填完了其实差一句」的坑
    assessmentStore.set({ ...cur, [key]: { ...cur[key], elasticity: value } });
  }, []);

  const handleReason = useCallback((key: AttributeKey, value: CeilingReason) => {
    const cur = assessmentStore.getSnapshot();
    assessmentStore.set({ ...cur, [key]: { ...cur[key], reason: value } });
  }, []);

  const handleToggleGoal = useCallback((id: string) => {
    const cur = goalsStore.getSnapshot();
    if (id === GOAL_NONE) {
      goalsStore.set({ ...cur, picked: cur.picked.includes(GOAL_NONE) ? [] : [GOAL_NONE] });
      return;
    }
    const withoutNone = cur.picked.filter(x => x !== GOAL_NONE);
    const next = withoutNone.includes(id) ? withoutNone.filter(x => x !== id) : [...withoutNone, id];
    goalsStore.set({ ...cur, picked: next });
  }, []);

  const handleCustom = useCallback((value: string) => {
    goalsStore.set({ ...goalsStore.getSnapshot(), custom: value.slice(0, 40) });
  }, []);

  const done = filledCount(assessment);
  const complete = isComplete(assessment);
  const missing = useMemo(() => missingItems(assessment), [assessment]);
  const report = useMemo(() => (complete ? generateReport(assessment) : null), [complete, assessment]);
  const insight = useMemo(() => (complete ? buildGoalInsight(assessment, goals) : null), [complete, assessment, goals]);

  return (
    <main className="min-h-screen bg-[#FBF7F1] pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <Link href="/" className="text-[12px] hover:underline" style={{ color: MUTED }}>
          ← 一生的整理
        </Link>

        <header className="mt-4">
          <div className="text-[11px] tracking-[0.22em]" style={{ color: MUTED }}>
            TAKE STOCK · 今生复盘
          </div>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: INK }}>
            看看当下的自己有几斤几两
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: MUTED }}>
            八个维度。每一项问两件事：你现在在哪，以及往后还能往上走多少。
            不给默认起点——因为每个人的起点千差万别，先读句子，自己找位置。
          </p>
          <p className="mt-2 max-w-2xl text-[11.5px] leading-relaxed" style={{ color: '#A8927A' }}>
            这八项和你做「来生设计」时那八项同名，但问的不是一件事：那边问你想重新拿什么牌，这里问手里这副牌你打到几分。同一个 6 分，两处意思不同，不用拿两个分数互相校准。
          </p>
          <Progress done={done} />
        </header>

        <div className="mt-6 grid items-start gap-3 sm:grid-cols-2">
          {ATTRIBUTES.map(attr => (
            <AttributeCard
              key={attr.key}
              attr={attr}
              entry={assessment[attr.key]}
              open={openKey === attr.key}
              onToggleOpen={() => setOpenKey(prev => (prev === attr.key ? null : attr.key))}
              onScore={handleScore}
              onElasticity={handleElasticity}
              onReason={handleReason}
            />
          ))}
        </div>

        {!complete && (
          <div className="mt-4 rounded-xl border border-dashed px-4 py-3" style={{ borderColor: '#D9C6AE' }}>
            <p className="text-[12.5px] leading-relaxed" style={{ color: MUTED }}>
              <span style={{ color: ACCENT }}>还差 {missing.length} 项：</span>
              {missing
                .map(m => (m.needsReason ? `${m.attr.name}（还欠一句「是哪一种」）` : m.attr.name))
                .join('、')}
              。八项都答完才会出复盘单——半张单子算不出总分，而且现在的偏好会污染你对还没答的那几项判断。
            </p>
          </div>
        )}

        {complete && report && insight && (
          <>
            <GoalPicker goals={goals} onToggle={handleToggleGoal} onCustom={handleCustom} />

            <section className="mt-6 rounded-2xl border bg-white p-5 sm:p-7" style={{ borderColor: BORDER }}>
              <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
                你 的 复 盘 单
              </div>
              <TotalBoard assessment={assessment} />

              <h2 className="mt-5 text-xl font-bold leading-snug sm:text-2xl" style={{ color: INK }}>
                {report.headline}
              </h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5C4A38' }}>
                {report.summary}
              </p>

              <div className="mt-6 rounded-xl p-4" style={{ background: SOFT }}>
                <h3 className="text-sm font-semibold" style={{ color: INK }}>
                  你想留下的，和你现在的样子
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: '#5C4A38' }}>
                  {insight.text}
                </p>
                {insight.wanted.length > 0 && (
                  <p className="mt-2 text-[11px] leading-relaxed" style={{ color: MUTED }}>
                    你选的类型对应到八项：
                    {insight.wanted.map(w => (w.count > 1 ? `${w.attr.name} ×${w.count}` : w.attr.name)).join(' · ')}
                  </p>
                )}
              </div>

              {report.actions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold" style={{ color: INK }}>
                    最该动的两处
                  </h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {report.actions.map(({ attr, score, cap, action }) => (
                      <div key={attr.key} className="rounded-xl p-4" style={{ background: SOFT }}>
                        <div className="flex items-baseline justify-between">
                          <span className="text-sm font-semibold" style={{ color: INK }}>
                            {attr.name}
                          </span>
                          <span className="font-mono text-[13px]" style={{ color: ACCENT }}>
                            {score} → {cap}
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] leading-relaxed" style={{ color: MUTED }}>
                          你自己划了 {cap - score} 分空间在这里。想动的话，先做这一件：
                        </p>
                        <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: '#5C4A38' }}>
                          {action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {report.compound.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: INK }}>
                      复利区
                    </h3>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
                      {report.compound.map(c => c.attr.name).join('、')}
                      ：已经不错，而且还能继续长。加厚比补短更划算。
                    </p>
                  </div>
                )}
                {report.gift.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: INK }}>
                      天赋红利
                    </h3>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
                      {report.gift.map(c => c.attr.name).join('、')}
                      ：好，但你自己也说不太能再动。别在这里焦虑，这是运气，不是功劳。
                    </p>
                  </div>
                )}
                {report.release.length > 0 && (
                  <div className="sm:col-span-2">
                    <h3 className="text-sm font-semibold" style={{ color: INK }}>
                      可以放下的
                    </h3>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
                      {report.release.map(c => c.attr.name).join('、')}
                      ：空间本来就窄。不是让你认命，是别再拿它审判自己——换一个你能控制的口径去衡量。
                    </p>
                  </div>
                )}
              </div>

              {report.watch.length > 0 && (
                <div className="mt-6 rounded-xl border p-4" style={{ borderColor: '#E4C9A8', background: '#FDF6EC' }}>
                  <h3 className="text-sm font-semibold" style={{ color: INK }}>
                    守住，比追赶更急
                  </h3>
                  <p className="mt-1 text-[11px]" style={{ color: MUTED }}>
                    这几项现在不算差，但它们本来就不会自己维持。不用你额外努力，只是别断。
                  </p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {report.watch.map(w => (
                      <li key={w.attr.key} className="text-[12.5px] leading-relaxed" style={{ color: '#5C4A38' }}>
                        {w.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 rounded-xl border p-4" style={{ borderColor: BORDER }}>
                <h3 className="text-sm font-semibold" style={{ color: INK }}>
                  半年后，回来再称一次
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: '#5C4A38' }}>
                  {report.nextStep}
                </p>
              </div>

              <div className="mt-6 border-t pt-5" style={{ borderColor: BORDER }}>
                <p className="text-[13px] leading-relaxed" style={{ color: '#5C4A38' }}>
                  没有哪一种活法天然更高级。
                  <br />
                  真正要紧的，是你有没有找到属于自己的那一种。
                </p>
                <p className="mt-2 text-[12px] leading-relaxed" style={{ color: MUTED }}>
                  因为当你说不清自己要什么的时候，很容易把别人的期待，当成自己人生的方向。
                </p>
              </div>

              <p className="mt-5 border-t pt-4 text-[11px] leading-relaxed" style={{ color: MUTED }}>
                这是一次自我复盘，不是测评、不是诊断，也不产生任何排名。稳一稳再来一次也完全可以——半年、一年、三年、五年，只要同一项的数字动了，这份复盘单就有意义。
                数据只存在你这台设备的浏览器里，不上传。
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
