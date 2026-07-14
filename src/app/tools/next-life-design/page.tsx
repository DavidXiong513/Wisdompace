'use client';
'use no memo';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  type AttributeKey,
  type AttributeScores,
  SCORE_DESCRIPTIONS,
  matchDestinyTag,
  matchWeaknessTags,
  getTopAttributes,
  getBottomAttributes,
} from './report-data';

// ── 常量：八大属性 ───────────────────────────────────────────────────────────

const ATTRIBUTES: {
  key: AttributeKey;
  name: string;
  icon: string;
  desc: string;
  low: string;
  high: string;
}[] = [
  {
    key: 'looks',
    name: '颜值身材',
    icon: '💃',
    desc: '外在的容貌与体态',
    low: '丑爆或先天残疾',
    high: '盛世美颜',
  },
  {
    key: 'wealth',
    name: '财富财商',
    icon: '💰',
    desc: '赚钱能力与财富积累',
    low: '一生穷苦赚不到钱',
    high: '堪比巴菲特',
  },
  {
    key: 'fame',
    name: '名誉地位',
    icon: '📜',
    desc: '社会声望与历史留名',
    low: '臭名昭著',
    high: '如圣贤般被敬仰',
  },
  {
    key: 'health',
    name: '身心健康',
    icon: '🍃',
    desc: '身体与心理的综合状态',
    low: '疾病缠身',
    high: '一生身心健康',
  },
  {
    key: 'intelligence',
    name: '学习能力',
    icon: '🧠',
    desc: '智商、学历与独立思考',
    low: '基本没有学习力',
    high: '智商与学习能力爆表',
  },
  {
    key: 'family',
    name: '和睦家庭',
    icon: '🏠',
    desc: '原生家庭与亲密关系',
    low: '六亲缘薄',
    high: '灵魂伴侣、亲子关系健康',
  },
  {
    key: 'longevity',
    name: '长寿善终',
    icon: '🕯️',
    desc: '寿命长度与离世方式',
    low: '早早夭折',
    high: '长命百岁、在家寿终正寝',
  },
  {
    key: 'spirituality',
    name: '修行善根',
    icon: '☸️',
    desc: '信仰与灵性根基',
    low: '不信因果业报',
    high: '天生的修行人',
  },
];

const TOTAL_POINTS = 50;
const MAX_PER_ATTR = 10;
const STORAGE_KEY = 'next-life-design-scores';

const DEFAULT_SCORES: AttributeScores = {
  looks: 0,
  wealth: 0,
  fame: 0,
  health: 0,
  intelligence: 0,
  family: 0,
  longevity: 0,
  spirituality: 0,
};

const WARM_STROKE = '#C87941';
const WARM_FILL = 'rgba(200,121,65,0.25)';
const GRID_COLOR = '#E8D9C2';
const TEXT_COLOR = '#5D4A3A';

// ── 安全工具：localStorage 读写封装（带降级 + 快照缓存） ─────────────────────

// useSyncExternalStore 要求 getSnapshot 返回值在内容不变时保持引用稳定，
// 否则每次 render 都会触发级联更新。通过 cachedScores 缓存最近一次解析结果。
let cachedScores: AttributeScores | null = null;

function computeScores(): AttributeScores {
  if (typeof window === 'undefined') return DEFAULT_SCORES;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SCORES;
    const parsed = JSON.parse(saved) as Partial<AttributeScores>;
    const valid: AttributeScores = { ...DEFAULT_SCORES };
    ATTRIBUTES.forEach(attr => {
      const v = Number(parsed[attr.key]);
      if (!Number.isNaN(v)) {
        valid[attr.key] = Math.max(0, Math.min(MAX_PER_ATTR, v));
      }
    });
    return valid;
  } catch {
    return DEFAULT_SCORES;
  }
}

function safeGetScores(): AttributeScores {
  if (!cachedScores) {
    cachedScores = computeScores();
  }
  return cachedScores;
}

function safeSetScores(next: AttributeScores) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedScores = next; // 直接更新缓存，保证引用稳定
    window.dispatchEvent(new StorageEvent('storage'));
  } catch {
    // 忽略隐私模式/存储限制等异常
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    cachedScores = null; // 其他标签页修改时清空缓存，强制重新读取
    callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

function getServerSnapshot(): AttributeScores {
  return DEFAULT_SCORES;
}

// 稳定的挂载检测订阅（避免每次 render 传入新函数导致 useSyncExternalStore 反复订阅）
const mountedSubscribe = () => () => {};
const mountedClientSnapshot = () => true;
const mountedServerSnapshot = () => false;

// ── 工具函数 ─────────────────────────────────────────────────────────────────

function getRemainingPoints(scores: AttributeScores): number {
  const used = Object.values(scores).reduce((sum, v) => sum + v, 0);
  return TOTAL_POINTS - used;
}

function getScoreLabel(score: number): string {
  if (score <= 2) return '极低';
  if (score <= 4) return '偏低';
  if (score <= 6) return '中等';
  if (score <= 8) return '偏高';
  return '极高';
}

function generateReport(scores: AttributeScores) {
  const top3 = getTopAttributes(scores, 3);
  const bottom2 = getBottomAttributes(scores, 2);
  const totalUsed = TOTAL_POINTS - getRemainingPoints(scores);
  const topNames = top3.map(k => ATTRIBUTES.find(a => a.key === k)!.name);
  const bottomNames = bottom2.map(k => ATTRIBUTES.find(a => a.key === k)!.name);

  // 匹配命格标签（三层优先级：三属性 → 双属性 → 主标签）
  const destiny = matchDestinyTag(scores);

  // 匹配短板功课标签
  const weaknesses = matchWeaknessTags(scores);

  // 一生大体情况：命格描述 + 高低分领域
  const lifeSummary = destiny.desc;

  // 各属性档位场景描述
  const scoreScenes = top3.map(key => {
    const attr = ATTRIBUTES.find(a => a.key === key)!;
    const score = scores[key];
    const scene = SCORE_DESCRIPTIONS[key][score];
    return { attr, score, scene };
  });

  const weaknessScenes = bottom2.map(key => {
    const attr = ATTRIBUTES.find(a => a.key === key)!;
    const score = scores[key];
    const scene = SCORE_DESCRIPTIONS[key][score];
    return { attr, score, scene };
  });

  // 潜意识价值观折射
  const valueReflection = `你把最多的福德给了「${topNames.join('、')}」，这不是随意的选择——它照见了你今生最深处的价值排序。你舍得在这些领域投入，说明你潜意识里认定它们是"值得的"。而「${bottomNames.join('、')}」被你放在了末位，也往往是因为你早已放弃，或觉得"不重要"。50 分的分配，就是你灵魂的一份供词。`;

  // 短板功课
  const weaknessReflection = weaknesses.map(w => `「${w.tag}」：${w.desc}`).join('\n\n');

  // 提醒总结
  const reminder = `50 分终究是有限资源。你在「${topNames.join('、')}」上的慷慨，是对自己灵魂需求的诚实；而在「${bottomNames.join('、')}」上的吝啬，也往往是因为你潜意识里早已放弃或不在乎。来生不会完美——50 分覆盖不了 80 分的人生，缺口才是功课所在。但这份配置会帮你更清楚地看见：你究竟想要怎样的人生。`;

  return {
    archetype: destiny.tag,
    matchedType: destiny.matchedType,
    totalUsed,
    topAttributes: top3,
    bottomAttributes: bottom2,
    lifeSummary,
    scoreScenes,
    weaknessScenes,
    valueReflection,
    weaknessReflection,
    reminder,
  };
}

// ── 滑块输入 ─────────────────────────────────────────────────────────────────

function SliderInput({
  attr,
  value,
  onChange,
  canIncrease,
}: {
  attr: (typeof ATTRIBUTES)[number];
  value: number;
  onChange: (v: number) => void;
  canIncrease: boolean;
}) {
  const isMaxed = value === MAX_PER_ATTR;
  const isMinned = value === 0;

  return (
    <div className="rounded-xl border border-[#E8D9C2] bg-white p-3 shadow-sm transition-all hover:border-[#C87941]/30 sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-xl sm:text-2xl">{attr.icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-bold text-[#4A3728] sm:text-base">{attr.name}</div>
            <div className="text-[10px] text-[#8A7E6A] sm:text-xs">{attr.desc}</div>
          </div>
        </div>
        <div className="ml-2 text-right">
          <div className="text-xl font-bold text-[#C87941] tabular-nums sm:text-2xl">{value}</div>
          <div className="text-[10px] text-[#8A7E6A]">{getScoreLabel(value)}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`减少 ${attr.name}`}
          disabled={isMinned}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F0E8] text-sm font-bold text-[#C87941] disabled:opacity-40 sm:h-9 sm:w-9"
        >
          −
        </button>

        <input
          type="range"
          min={0}
          max={MAX_PER_ATTR}
          step={1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full cursor-pointer accent-[#C87941]"
          aria-label={`调整 ${attr.name} 的分数`}
        />

        <button
          type="button"
          aria-label={`增加 ${attr.name}`}
          disabled={isMaxed || !canIncrease}
          onClick={() => onChange(Math.min(MAX_PER_ATTR, value + 1))}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F0E8] text-sm font-bold text-[#C87941] disabled:opacity-40 sm:h-9 sm:w-9"
        >
          +
        </button>
      </div>

      <div className="mt-2 flex justify-between text-[10px] text-[#8A7E6A]">
        <span className="max-w-[45%] truncate">{attr.low}</span>
        <span className="max-w-[45%] truncate text-right">{attr.high}</span>
      </div>
    </div>
  );
}

// ── 雷达图 ───────────────────────────────────────────────────────────────────

function NextLifeRadarChart({ scores }: { scores: AttributeScores }) {
  const data = useMemo(
    () =>
      ATTRIBUTES.map(attr => ({
        attribute: attr.name,
        score: scores[attr.key],
        fullMark: MAX_PER_ATTR,
      })),
    [scores]
  );

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke={GRID_COLOR} />
          <PolarAngleAxis
            dataKey="attribute"
            tick={{ fill: TEXT_COLOR, fontSize: 11, fontWeight: 600 }}
            tickLine={false}
          />
          <PolarRadiusAxis angle={90} domain={[0, MAX_PER_ATTR]} tick={false} axisLine={false} />
          <Radar
            name="来生配置"
            dataKey="score"
            stroke={WARM_STROKE}
            fill={WARM_FILL}
            fillOpacity={0.35}
            strokeWidth={2}
            dot={{ r: 4, fill: WARM_STROKE, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload as (typeof data)[0];
              return (
                <div className="rounded-lg border border-[#E8D9C2] bg-white px-3 py-2 shadow-md">
                  <p className="text-xs font-semibold text-[#3D2B1F]">{d.attribute}</p>
                  <p className="mt-1 text-xs text-[#5D4A3A]">
                    得分：<strong>{d.score}</strong> / {MAX_PER_ATTR}
                  </p>
                </div>
              );
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 主页面 ───────────────────────────────────────────────────────────────────

export default function NextLifeDesignPage() {
  const scores = useSyncExternalStore(subscribe, safeGetScores, getServerSnapshot);
  const [showReport, setShowReport] = useState(false);
  const isMounted = useSyncExternalStore(
    mountedSubscribe,
    mountedClientSnapshot,
    mountedServerSnapshot
  );

  const remaining = getRemainingPoints(scores);
  const isOver = remaining < 0;
  const report = useMemo(() => generateReport(scores), [scores]);

  const handleChange = (key: AttributeKey, value: number) => {
    const currentValue = scores[key];
    if (value === currentValue) return;

    const next = { ...scores, [key]: value };
    const used = Object.values(next).reduce((sum, v) => sum + v, 0);

    if (used > TOTAL_POINTS && value > currentValue) {
      // 如果增加会超出，则尽可能向上取到刚好用满 50 分
      const available = TOTAL_POINTS - (used - value);
      if (available >= currentValue) {
        next[key] = Math.max(currentValue, Math.min(MAX_PER_ATTR, available));
      } else {
        return;
      }
    }

    safeSetScores(next);
    setShowReport(false);
  };

  const handleReset = () => {
    safeSetScores(DEFAULT_SCORES);
    setShowReport(false);
  };

  // 每个属性是否还能继续增加（用于 + 按钮状态）
  const canIncreaseMap = useMemo(() => {
    const map: Record<AttributeKey, boolean> = {
      looks: false,
      wealth: false,
      fame: false,
      health: false,
      intelligence: false,
      family: false,
      longevity: false,
      spirituality: false,
    };
    ATTRIBUTES.forEach(attr => {
      const afterIncrease = {
        ...scores,
        [attr.key]: Math.min(MAX_PER_ATTR, scores[attr.key] + 1),
      };
      const used = Object.values(afterIncrease).reduce((sum, v) => sum + v, 0);
      map[attr.key] = used <= TOTAL_POINTS && scores[attr.key] < MAX_PER_ATTR;
    });
    return map;
  }, [scores]);

  return (
    <main className="min-h-screen bg-[#F5F0E8] px-3 py-6 sm:px-4 sm:py-10">
      <div className="mx-auto max-w-5xl">
        {/* 头部介绍 */}
        <div className="mb-6 rounded-2xl border border-[#E8D9C2] bg-white p-4 shadow-sm sm:mb-8 sm:p-6 lg:p-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">🌀</span>
            <h1 className="text-xl font-bold text-[#4A3728] sm:text-2xl lg:text-3xl">
              来生设计：配置你的人生属性
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-[#6A6256] sm:text-base">
            假设你马上要投胎到下一世去做人，目前手里握着
            <strong className="text-[#C87941]">50 点投胎福德积分</strong>。你会如何分配这 50
            个积点到以下八大属性中？
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#8A7E6A] sm:text-sm">
            每个属性 0–10 分，八大属性总分不能超过 50 分。拖动滑块或点击 ±
            按钮实时调整，雷达图会同步变化。
          </p>
        </div>

        {/* 积分余额条 */}
        <div className="mb-5 rounded-xl border border-[#E8D9C2] bg-white p-4 shadow-sm sm:mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#4A3728]">剩余福德积分</span>
            <span
              className={`text-2xl font-bold tabular-nums ${
                isOver ? 'text-red-600' : remaining === 0 ? 'text-emerald-600' : 'text-[#C87941]'
              }`}
            >
              {remaining}
              <span className="text-sm font-medium text-[#8A7E6A]"> / {TOTAL_POINTS}</span>
            </span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#E8D9C2]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isOver ? 'bg-red-500' : remaining === 0 ? 'bg-emerald-500' : 'bg-[#C87941]'
              }`}
              style={{
                width: `${Math.min(100, ((TOTAL_POINTS - remaining) / TOTAL_POINTS) * 100)}%`,
              }}
            />
          </div>
          {isOver && (
            <p className="mt-2 text-sm font-medium text-red-600">
              ⚠️ 已超出 50 分上限，请减少某些属性的分数。
            </p>
          )}
          {remaining === 0 && !isOver && (
            <p className="mt-2 text-sm font-medium text-emerald-600">✅ 50 分已全部分配完毕。</p>
          )}
        </div>

        {/* 主内容：滑块 + 雷达图 */}
        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* 上方（移动端）/ 左侧（桌面端）滑块 */}
          <div className="space-y-3 lg:order-1 lg:space-y-4">
            {ATTRIBUTES.map(attr => (
              <SliderInput
                key={attr.key}
                attr={attr}
                value={scores[attr.key]}
                canIncrease={canIncreaseMap[attr.key]}
                onChange={v => handleChange(attr.key, v)}
              />
            ))}
          </div>

          {/* 下方（移动端）/ 右侧（桌面端）雷达图 */}
          <div className="rounded-2xl border border-[#E8D9C2] bg-white p-4 shadow-sm sm:p-6 lg:sticky lg:top-6 lg:order-2 lg:self-start">
            <h2 className="mb-2 text-center text-base font-bold text-[#4A3728] sm:mb-4 sm:text-lg">
              你的来生雷达图
            </h2>
            {isMounted ? (
              <>
                <NextLifeRadarChart scores={scores} />
                <p className="mt-2 text-center text-[10px] text-[#8A7E6A] sm:mt-4 sm:text-xs">
                  雷达图会随你的配置实时变化。悬停数据点可查看分数。
                </p>
              </>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-[#8A7E6A]">
                加载中…
              </div>
            )}
          </div>
        </div>

        {/* 生成报告按钮 */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowReport(true)}
            disabled={isOver || remaining > 0}
            className="rounded-full bg-[#C87941] px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D] disabled:cursor-not-allowed disabled:opacity-40 sm:px-8 sm:py-3 sm:text-base"
          >
            {showReport ? '已生成来生档案' : '生成我的来生档案'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full border border-[#E8D9C2] bg-white px-5 py-2.5 text-sm font-bold text-[#4A3728] transition-all hover:border-[#C87941] hover:text-[#C87941]"
          >
            重置配置
          </button>
        </div>

        {/* 报告区域 */}
        {showReport && !isOver && (
          <div className="mt-8 space-y-4 rounded-2xl border border-[#C87941]/20 bg-[#FDF5EE] p-4 shadow-sm sm:mt-10 sm:space-y-6 sm:p-6 lg:p-8">
            <div className="text-center">
              <span className="inline-block rounded-full bg-[#C87941] px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-white uppercase">
                来生档案
              </span>
              <h2 className="mt-3 text-xl font-bold text-[#4A3728] sm:text-2xl">
                你的来世身份：{report.archetype}
              </h2>
              <p className="mt-2 text-sm text-[#8A7E6A]">
                已使用 {report.totalUsed} / {TOTAL_POINTS} 点福德积分
              </p>
            </div>

            {/* 高分与低分 */}
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 sm:p-5">
                <h3 className="mb-3 text-sm font-bold text-[#4A3728]">你最舍得投入的领域</h3>
                <div className="flex flex-wrap gap-2">
                  {report.topAttributes.map(key => {
                    const attr = ATTRIBUTES.find(a => a.key === key)!;
                    return (
                      <span
                        key={key}
                        className="rounded-full bg-[#FDF5EE] px-3 py-1 text-sm font-semibold text-[#C87941]"
                      >
                        {attr.icon} {attr.name} {scores[key]}分
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 sm:p-5">
                <h3 className="mb-3 text-sm font-bold text-[#4A3728]">你相对淡薄的领域</h3>
                <div className="flex flex-wrap gap-2">
                  {report.bottomAttributes.map(key => {
                    const attr = ATTRIBUTES.find(a => a.key === key)!;
                    return (
                      <span
                        key={key}
                        className="rounded-full bg-[#F5F0E8] px-3 py-1 text-sm font-semibold text-[#8A7E6A]"
                      >
                        {attr.icon} {attr.name} {scores[key]}分
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 人生大体情况 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 sm:p-6">
              <h3 className="mb-3 text-base font-bold text-[#4A3728] sm:text-lg">一生大体情况</h3>
              <p className="text-sm leading-relaxed text-[#5A5A5A] sm:text-base">
                {report.lifeSummary}
              </p>
            </div>

            {/* 潜意识价值观折射 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 sm:p-6">
              <h3 className="mb-3 text-base font-bold text-[#4A3728] sm:text-lg">
                潜意识价值观折射
              </h3>
              <p className="text-sm leading-relaxed text-[#5A5A5A] sm:text-base">
                {report.valueReflection}
              </p>
            </div>

            {/* 各属性档位场景 */}
            <div className="rounded-xl border border-[#E8D9C2] bg-white p-4 sm:p-6">
              <h3 className="mb-3 text-base font-bold text-[#4A3728] sm:text-lg">
                你最看重的领域 · 具体场景
              </h3>
              <div className="space-y-3">
                {report.scoreScenes.map(({ attr, score, scene }) => (
                  <div
                    key={attr.key}
                    className="flex items-start gap-3 rounded-lg bg-[#FDF5EE] p-3"
                  >
                    <span className="text-xl">{attr.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#4A3728]">
                        {attr.name} · {score}分
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#6A6256]">{scene}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 短板功课 */}
            <div className="rounded-xl border border-[#C87941]/30 bg-[#FDF5EE] p-4 sm:p-6">
              <h3 className="mb-3 text-base font-bold text-[#4A3728] sm:text-lg">
                你的功课 · 被你搁置的领域
              </h3>
              <div className="space-y-3">
                {report.weaknessScenes.map(({ attr, score, scene }) => (
                  <div key={attr.key} className="flex items-start gap-3 rounded-lg bg-white p-3">
                    <span className="text-xl opacity-50">{attr.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[#8A7E6A]">
                        {attr.name} · {score}分
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#8A7E6A]">{scene}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm leading-relaxed text-[#6A6256]">
                  {report.weaknessReflection}
                </p>
              </div>
            </div>

            {/* 提醒 */}
            <div className="rounded-xl border border-[#C87941]/30 bg-[#FDF5EE] p-4 sm:p-6">
              <p className="text-sm leading-relaxed text-[#6A6256]">{report.reminder}</p>
            </div>
          </div>
        )}

        {/* 底部导航 */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
          <Link
            href="/chapter/chapter-1"
            className="rounded-full bg-[#C87941] px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#A85E2D]"
          >
            返回看见自己
          </Link>
          <Link
            href="/tools/career-values-test"
            className="rounded-full border border-[#C87941] px-5 py-2.5 text-sm font-bold text-[#C87941] transition-all hover:bg-[#FDF5EE]"
          >
            去生涯价值观测评
          </Link>
        </div>
      </div>
    </main>
  );
}
