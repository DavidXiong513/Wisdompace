'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ATTRIBUTES,
  DEFAULT_GOALS,
  DEFAULT_SCORES,
  GOAL_NONE,
  GOAL_TYPES,
  MAX_PER_ATTR,
  TOTAL_CEILING,
  buildGoalInsight,
  fillRatio,
  generateReport,
  moveRate,
  parseGoals,
  sumScores,
  type Attribute,
  type Goals,
  type Scores,
} from './data';

const SCORE_KEY = 'wisdompace:life-scorecard:v1';
const GOAL_KEY = 'wisdompace:life-scorecard:goals:v1';

const INK = '#4A3728';
const MUTED = '#7A6A58';
const ACCENT = '#C87941';
const TRACK = '#EDE3D6';

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

function parseScores(raw: string): Scores {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') return DEFAULT_SCORES;
  const src = parsed as Record<string, unknown>;
  const next: Scores = { ...DEFAULT_SCORES };
  for (const attr of ATTRIBUTES) {
    const v = src[attr.key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      next[attr.key] = Math.min(MAX_PER_ATTR, Math.max(0, Math.round(v)));
    }
  }
  return next;
}

function eqScores(a: Scores, b: Scores): boolean {
  return ATTRIBUTES.every(attr => a[attr.key] === b[attr.key]);
}

function eqGoals(a: Goals, b: Goals): boolean {
  return a.custom === b.custom && a.picked.length === b.picked.length && a.picked.every(id => b.picked.includes(id));
}

const scoresStore = makeStore<Scores>(SCORE_KEY, DEFAULT_SCORES, parseScores, eqScores);
const goalsStore = makeStore<Goals>(GOAL_KEY, DEFAULT_GOALS, raw => parseGoals(JSON.parse(raw)), eqGoals);

// ── 单条属性 ─────────────────────────────────────────────────────────
function AttributeRow({
  attr,
  score,
  onChange,
}: {
  attr: Attribute;
  score: number;
  onChange: (key: Attribute['key'], value: number) => void;
}) {
  const rate = Math.round(moveRate(attr) * 100);
  return (
    <div className="rounded-2xl border border-[#EADFD0] bg-white/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold" style={{ color: INK }}>
            {attr.name}
          </span>
          <span className="text-[11px]" style={{ color: MUTED }}>
            可动 {rate}%
          </span>
        </div>
        <span className="font-mono text-[15px] font-semibold" style={{ color: ACCENT }}>
          {score}
        </span>
      </div>

      <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
        测的是：{attr.control}
      </p>

      <div className="relative mt-3 h-6">
        <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ background: TRACK }}>
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${(attr.baseline / MAX_PER_ATTR) * 100}%`,
              width: `${((attr.ceiling - attr.baseline) / MAX_PER_ATTR) * 100}%`,
              background: '#F0CBA0',
            }}
          />
        </div>
        <div
          className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
          style={{ left: `${(score / MAX_PER_ATTR) * 100}%`, background: ACCENT }}
        />
        <input
          type="range"
          min={0}
          max={MAX_PER_ATTR}
          step={1}
          value={score}
          aria-label={`${attr.name} 自评分数`}
          onChange={e => onChange(attr.key, Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      <p className="mt-1 text-[12px] leading-relaxed" style={{ color: '#5C4A38' }}>
        {attr.anchors[score]}
      </p>
    </div>
  );
}

// ── 总看板（放在报告最前面，打分时看不到） ────────────────────────────
function TotalBoard({ scores }: { scores: Scores }) {
  const total = sumScores(scores);
  const percent = Math.round((total / TOTAL_CEILING) * 100);

  return (
    <div className="mt-4 rounded-xl border border-[#EADFD0] bg-[#FBF7F1] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
            总 势
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-4xl font-bold leading-none" style={{ color: INK }}>
              {total.toFixed(1)}
            </span>
            <span className="font-mono text-base" style={{ color: MUTED }}>
              / {TOTAL_CEILING}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold leading-none" style={{ color: ACCENT }}>
            {percent}%
          </div>
          <div className="mt-1 text-[11px]" style={{ color: MUTED }}>
            距你自己的上限
          </div>
        </div>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{ background: TRACK }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, background: ACCENT }} />
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {ATTRIBUTES.map(attr => {
          const score = scores[attr.key];
          const ratio = fillRatio(attr, score);
          return (
            <div key={attr.key}>
              <div className="flex justify-between text-[11px]" style={{ color: MUTED }}>
                <span>{attr.name}</span>
                <span className="font-mono">{score}</span>
              </div>
              <div className="relative mt-0.5 h-1.5 w-full rounded-full" style={{ background: TRACK }}>
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    left: `${(attr.baseline / MAX_PER_ATTR) * 100}%`,
                    width: `${((attr.ceiling - attr.baseline) / MAX_PER_ATTR) * 100}%`,
                    background: '#F0CBA0',
                  }}
                />
                <div
                  className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${(score / MAX_PER_ATTR) * 100}%`, background: ratio < 0 ? '#A8443C' : INK }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: MUTED }}>
        分母是你自己的潜力上限，不是 100，也不是 50。浅色段是后天能挪的范围，深点是你的位置。
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
    <section className="mt-8 rounded-2xl border border-[#EADFD0] bg-white p-5 sm:p-7">
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
              className={`rounded-xl border px-3 py-2 text-left transition ${
                selected ? 'border-[#C87941] bg-[#FBF3E9]' : 'border-[#EADFD0] bg-white hover:border-[#D9C6AE]'
              }`}
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
        className={`mt-3 w-full rounded-xl border px-3 py-2 text-[13px] transition ${
          nonePicked ? 'border-[#C87941] bg-[#FBF3E9] font-semibold' : 'border-dashed border-[#D9C6AE] bg-white'
        }`}
        style={{ color: nonePicked ? ACCENT : MUTED }}
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
          className="mt-1 w-full rounded-xl border border-[#EADFD0] bg-white px-3 py-2 text-[13px] outline-none focus:border-[#C87941]"
          style={{ color: INK }}
        />
      </label>
    </section>
  );
}

// ── 页面 ────────────────────────────────────────────────────────────
export default function LifeScorecardPage() {
  const scores = useSyncExternalStore(scoresStore.subscribe, scoresStore.getSnapshot, scoresStore.getServerSnapshot);
  const goals = useSyncExternalStore(goalsStore.subscribe, goalsStore.getSnapshot, goalsStore.getServerSnapshot);

  const handleChange = useCallback((key: Attribute['key'], value: number) => {
    scoresStore.set({ ...scoresStore.getSnapshot(), [key]: value });
  }, []);

  const handleToggle = useCallback((id: string) => {
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

  const report = useMemo(() => generateReport(scores), [scores]);
  const insight = useMemo(() => buildGoalInsight(scores, goals), [scores, goals]);

  return (
    <main className="min-h-screen bg-[#FBF7F1] pb-20">
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
        <Link href="/" className="text-[12px] hover:underline" style={{ color: MUTED }}>
          ← 一生的整理
        </Link>

        <header className="mt-4">
          <div className="text-[11px] tracking-[0.22em]" style={{ color: MUTED }}>
            WEIGH YOURSELF · 今生称重
          </div>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl" style={{ color: INK }}>
            称一称自己的斤两
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: MUTED }}>
            八个维度，只对自己打分。不打分排名，不和别人比——分母是你自己的潜力上限。 每一项都只测「你还能影响的那部分」。
          </p>
        </header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ATTRIBUTES.map(attr => (
            <AttributeRow key={attr.key} attr={attr} score={scores[attr.key]} onChange={handleChange} />
          ))}
        </div>

        <GoalPicker goals={goals} onToggle={handleToggle} onCustom={handleCustom} />

        <section className="mt-6 rounded-2xl border border-[#EADFD0] bg-white p-5 sm:p-7">
          <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
            你 的 称 重 单
          </div>
          <TotalBoard scores={scores} />
          <h2 className="mt-5 text-xl font-bold leading-snug sm:text-2xl" style={{ color: INK }}>
            {report.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5C4A38' }}>
            {report.summary}
          </p>

          <div className="mt-6 rounded-xl bg-[#FBF3E9] p-4">
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
                {report.actions.map(({ attr, score }) => (
                  <div key={attr.key} className="rounded-xl bg-[#FBF3E9] p-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-semibold" style={{ color: INK }}>
                        {attr.name}
                      </span>
                      <span className="font-mono text-[13px]" style={{ color: ACCENT }}>
                        {score} → {attr.ceiling}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed" style={{ color: MUTED }}>
                      离上限还有 {attr.ceiling - score} 分，而这一项有 {Math.round(moveRate(attr) * 100)}% 是后天能挪的。
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
                  ：好，但不太能再动。别在这里焦虑，这是运气，不是功劳。
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
                  ：可动区间本来就窄。不是让你认命，是别再拿它审判自己——换一个你能控制的口径去衡量。
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-[#EADFD0] p-4">
            <h3 className="text-sm font-semibold" style={{ color: INK }}>
              下一步，只做一件
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed" style={{ color: '#5C4A38' }}>
              {report.nextStep}
            </p>
          </div>

          <div className="mt-6 border-t border-[#EADFD0] pt-5">
            <p className="text-[13px] leading-relaxed" style={{ color: '#5C4A38' }}>
              没有哪一种活法天然更高级。
              <br />
              真正要紧的，是你有没有找到属于自己的那一种。
            </p>
            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: MUTED }}>
              因为当你说不清自己要什么的时候，很容易把别人的期待，当成自己人生的方向。
            </p>
          </div>

          <p className="mt-5 border-t border-[#EADFD0] pt-4 text-[11px] leading-relaxed" style={{ color: MUTED }}>
            这是一次自我盘点，不是测评、不是诊断，也不产生任何分数排名。数据只存在你这台设备的浏览器里，不上传。
          </p>
        </section>
      </div>
    </main>
  );
}
