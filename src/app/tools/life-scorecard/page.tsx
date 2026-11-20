'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  ATTRIBUTES,
  DEFAULT_SCORES,
  MAX_PER_ATTR,
  TOTAL_CEILING,
  type Attribute,
  type Scores,
  fillRatio,
  generateReport,
  moveRate,
  sumScores,
} from './data';

const STORAGE_KEY = 'wisdompace:life-scorecard:v1';

const INK = '#4A3728';
const MUTED = '#7A6A58';
const ACCENT = '#C87941';
const TRACK = '#EDE3D6';

// ── localStorage（useSyncExternalStore 要求快照引用稳定） ──────────────
let cached: Scores | null = null;

function readScores(): Scores {
  if (typeof window === 'undefined') return DEFAULT_SCORES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SCORES;
    const src = parsed as Record<string, unknown>;
    const next = { ...DEFAULT_SCORES };
    for (const attr of ATTRIBUTES) {
      const v = src[attr.key];
      if (typeof v === 'number' && Number.isFinite(v)) {
        next[attr.key] = Math.min(MAX_PER_ATTR, Math.max(0, Math.round(v)));
      }
    }
    return next;
  } catch {
    return DEFAULT_SCORES;
  }
}

function getSnapshot(): Scores {
  const next = readScores();
  if (cached && ATTRIBUTES.every(a => cached![a.key] === next[a.key])) return cached;
  cached = next;
  return next;
}

function getServerSnapshot(): Scores {
  return DEFAULT_SCORES;
}

function writeScores(next: Scores) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('life-scorecard-change'));
  } catch {
    /* 隐私模式下降级：仅内存生效 */
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('life-scorecard-change', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('life-scorecard-change', cb);
    window.removeEventListener('storage', cb);
  };
}

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

// ── 右侧潜力面板 ──────────────────────────────────────────────────────
function PotentialPanel({ scores }: { scores: Scores }) {
  const total = sumScores(scores);
  const percent = Math.round((total / TOTAL_CEILING) * 100);

  return (
    <div className="rounded-2xl border border-[#EADFD0] bg-white p-4 sm:p-5">
      <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
        总 势
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="font-mono text-3xl font-bold" style={{ color: INK }}>
          {total.toFixed(1)}
        </span>
        <span className="font-mono text-sm" style={{ color: MUTED }}>
          / {TOTAL_CEILING}
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed" style={{ color: MUTED }}>
        分母是你自己的潜力上限，不是 100，也不是 50。
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full" style={{ background: TRACK }}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, percent)}%`, background: ACCENT }} />
      </div>
      <div className="mt-1 text-right text-[11px] font-mono" style={{ color: MUTED }}>
        {percent}%
      </div>

      <div className="mt-4 space-y-2">
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
        浅色段是后天能挪的范围，深点是你的位置。
      </p>
    </div>
  );
}

// ── 页面 ────────────────────────────────────────────────────────────
export default function LifeScorecardPage() {
  const scores = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleChange = useCallback((key: Attribute['key'], value: number) => {
    const current = getSnapshot();
    writeScores({ ...current, [key]: value });
  }, []);

  const report = useMemo(() => generateReport(scores), [scores]);

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
            八个维度，只对自己打分。不打分排名，不和别人比——分母是你自己的潜力上限。
            每一项都只测「你还能影响的那部分」。
          </p>
        </header>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="order-2 space-y-3 lg:order-1">
            {ATTRIBUTES.map(attr => (
              <AttributeRow key={attr.key} attr={attr} score={scores[attr.key]} onChange={handleChange} />
            ))}
          </div>
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-6">
              <PotentialPanel scores={scores} />
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-2xl border border-[#EADFD0] bg-white p-5 sm:p-7">
          <div className="text-[11px] tracking-[0.18em]" style={{ color: MUTED }}>
            你 的 称 重 单
          </div>
          <h2 className="mt-2 text-xl font-bold leading-snug sm:text-2xl" style={{ color: INK }}>
            {report.headline}
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#5C4A38' }}>
            {report.summary}
          </p>

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

          <p className="mt-5 border-t border-[#EADFD0] pt-4 text-[11px] leading-relaxed" style={{ color: MUTED }}>
            这是一次自我盘点，不是测评、不是诊断，也不产生任何分数排名。数据只存在你这台设备的浏览器里，不上传。
          </p>
        </section>
      </div>
    </main>
  );
}
