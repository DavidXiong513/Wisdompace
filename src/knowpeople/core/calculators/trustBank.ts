/**
 * 信任银行计算引擎
 * 所有函数均为纯函数，无副作用，可独立测试
 */

import type {
  TrustBankResult,
  ReliabilityResult,
  IntimacyResult,
  TrustTrendPoint,
  ObserveEvent,
  CharacterScores,
  DecayInfo,
  TrustStatus,
  FreshnessStatus,
} from '@/knowpeople/core/models';
import type { PersonCategory } from '@/knowpeople/core/models';
import { getCategoryById } from '@/knowpeople/core/constants/categories';
import { getEventCategoryById } from '@/knowpeople/core/constants/events';
import {
  RELIABILITY_WEIGHTS,
  INTIMACY_WEIGHTS,
  getTrustLevel,
  getFreshnessStatus,
} from '@/knowpeople/core/constants/weights';

// ============================================================
// 工具函数
// ============================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function daysBetween(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerDay);
}

// ============================================================
// 1. 信任银行核心计算
// ============================================================

export interface CalculateTrustBankInput {
  initialTrust: number;
  events: ObserveEvent[];
  lastObservedAt: Date;
  category: PersonCategory;
  knownSince?: Date; // 实际认识时间（用于时间增长加分）
  now?: Date; // 可选，用于测试
}

/**
 * 计算信任银行当前值
 * 公式：当前值 = 初始值 + 事件累计变化 + 时间加分 - 衰减值（有上下限）
 */
export function calculateTrustBank(input: CalculateTrustBankInput): TrustBankResult {
  const { initialTrust, events, lastObservedAt, category, knownSince, now = new Date() } = input;

  const categoryConfig = getCategoryById(category);
  if (!categoryConfig) {
    throw new Error(`Unknown category: ${category}`);
  }

  // 1. 累加所有事件的信任变化
  const eventDelta = events.reduce((sum, event) => sum + event.trustDelta, 0);

  // 2. 计算衰减
  const decay = calculateDecay(lastObservedAt, categoryConfig, now);

  // 3. 计算时间增长加分（日久见人心）
  // timeBonus 基于活跃交往期（knownSince → lastObservedAt），停止观察后不再增长
  const timeBonus = calculateTimeBonus(
    knownSince || lastObservedAt,
    lastObservedAt,
    categoryConfig,
    events
  );

  // 4. 综合计算（有上下限）
  const raw = initialTrust + eventDelta + timeBonus - decay.totalDecayed;
  const clamped = clamp(raw, categoryConfig.minTrust, 100);

  // 5. 计算信任等级
  const level = getTrustLevel(clamped);
  const status: TrustStatus = {
    level: level.label,
    color: level.color,
    description: level.description,
  };

  // 6. 计算新鲜度
  const daysSince = daysBetween(lastObservedAt, now);
  const freshness = getFreshnessStatus(daysSince, categoryConfig.observeCycleDays);

  return {
    currentValue: Math.round(clamped),
    initialValue: initialTrust,
    eventDelta,
    timeBonus,
    decay,
    status,
    freshness,
  };
}

/**
 * 计算衰减信息
 */
function calculateDecay(
  lastObservedAt: Date,
  categoryConfig: NonNullable<ReturnType<typeof getCategoryById>>,
  now: Date
): DecayInfo {
  const daysSince = daysBetween(lastObservedAt, now);
  const cycle = categoryConfig.observeCycleDays;

  // 未超期，无衰减
  if (daysSince <= cycle) {
    return {
      totalDecayed: 0,
      daysOverdue: 0,
      nextDecayAt: new Date(lastObservedAt.getTime() + cycle * 24 * 60 * 60 * 1000),
    };
  }

  // 超期天数
  const daysOverdue = daysSince - cycle;

  // 计算衰减周期数（每超一个周期衰减一次）
  const decayPeriods = Math.floor(daysOverdue / cycle);
  const totalDecayed = Math.min(decayPeriods * categoryConfig.decayRate, categoryConfig.maxDecay);

  // 下次衰减时间
  const nextDecayAt = new Date(
    lastObservedAt.getTime() + (cycle + (decayPeriods + 1) * cycle) * 24 * 60 * 60 * 1000
  );

  return {
    totalDecayed,
    daysOverdue,
    nextDecayAt,
  };
}

/**
 * 计算时间增长加分（日久见人心）
 *
 * 设计理念：
 *   - 认识时间越长、没有负面事件，信任自然增长
 *   - 增长基于「活跃交往期」（从认识到最后一次观察），停止观察后不再增长
 *     这样衰减机制才能生效——长期不接触，信任必然下降
 *   - 增长率与分类观察周期挂钩：亲密关系（周期长=关系稳固）增长快，陌生人增长慢
 *   - 增长曲线用 sqrt，初期快、后期渐缓
 *   - 负面事件抵消时间加分
 *   - 最多加 10 分
 */
function calculateTimeBonus(
  knownSince: Date,
  lastObservedAt: Date,
  categoryConfig: NonNullable<ReturnType<typeof getCategoryById>>,
  events: ObserveEvent[]
): number {
  // 活跃交往期：从认识到最后一次观察的天数
  // 停止观察后 timeBonus 冻结，衰减继续累积，确保长期不接触信任下降
  const activeDays = daysBetween(new Date(knownSince), lastObservedAt);
  if (activeDays < 7) return 0; // 不足一周无加分

  // 增长率与观察周期挂钩：周期越长（关系越稳固），增长越快
  // 陌生人(14天)→0.56，朋友(45天)→1.0，亲人(90天)→1.41，父母(180天)→2.0
  const growthRate = Math.sqrt(categoryConfig.observeCycleDays / 45);

  // sqrt 对数增长，最高 10 分
  const rawBonus = Math.min(Math.round(growthRate * 1.2 * Math.sqrt(activeDays)), 10);

  // 负面事件抵消加分：每个负面事件扣 2 分
  const negativeEvents = events.filter(e => e.type === 'negative').length;
  const penalty = negativeEvents * 2;

  return Math.max(0, rawBonus - penalty);
}

// ============================================================
// 2. 靠谱度计算
// ============================================================

export interface CalculateReliabilityInput {
  scores: CharacterScores | null;
  events: ObserveEvent[];
}

/**
 * 计算靠谱度
 * 公式：靠谱度 = 尽责度×0.3 + 诚信人品×0.3 + 情绪稳定性×0.2 + 事件评分×0.2
 * 结果转为 0-100
 */
export function calculateReliability(input: CalculateReliabilityInput): ReliabilityResult {
  const { scores, events } = input;

  // 品性部分（0-10 分制，转为 0-100）
  const characterScore = scores
    ? (scores.diligence * RELIABILITY_WEIGHTS.diligence +
        scores.integrity * RELIABILITY_WEIGHTS.integrity +
        scores.emotionalStability * RELIABILITY_WEIGHTS.emotionalStability) *
      10
    : 0;

  // 事件部分（基于履约/失信等事件计算）
  const eventReliabilityScore = calculateEventReliabilityScore(events);
  const eventScore = eventReliabilityScore * RELIABILITY_WEIGHTS.eventScore * 10;

  const total = characterScore + eventScore;

  return {
    value: Math.round(clamp(total, 0, 100)),
    characterScore: Math.round(characterScore),
    eventScore: Math.round(eventScore),
    breakdown: {
      diligence: Math.round((scores?.diligence || 0) * RELIABILITY_WEIGHTS.diligence * 10),
      integrity: Math.round((scores?.integrity || 0) * RELIABILITY_WEIGHTS.integrity * 10),
      emotionalStability: Math.round(
        (scores?.emotionalStability || 0) * RELIABILITY_WEIGHTS.emotionalStability * 10
      ),
      eventReliability: Math.round(eventScore),
    },
  };
}

/**
 * 基于事件计算靠谱度评分
 * 正面事件加分，负面事件减分，中性事件不影响
 */
function calculateEventReliabilityScore(events: ObserveEvent[]): number {
  if (events.length === 0) return 5; // 无事件时默认中等

  const reliabilityEvents = events.filter(e => {
    const config = getEventCategoryById(e.eventCategory);
    return (
      config?.affectedDimensions.includes('reliability') ||
      config?.affectedDimensions.includes('integrity')
    );
  });

  if (reliabilityEvents.length === 0) return 5;

  // 计算平均分（正面事件 +，负面事件 -）
  const totalDelta = reliabilityEvents.reduce((sum, e) => sum + e.trustDelta, 0);
  const normalized = 5 + totalDelta / Math.max(reliabilityEvents.length, 1);

  return clamp(normalized, 0, 10);
}

// ============================================================
// 3. 亲密度计算
// ============================================================

export interface CalculateIntimacyInput {
  interactionFrequency: number; // 0-100，互动频率评分
  trustValue: number; // 0-100，当前信任值
  communicationDepth: number; // 0-100，沟通深度评分
}

/**
 * 计算亲密度
 * 公式：亲密度 = 互动频率×0.4 + 信任银行×0.3 + 沟通深度×0.3
 */
export function calculateIntimacy(input: CalculateIntimacyInput): IntimacyResult {
  const { interactionFrequency, trustValue, communicationDepth } = input;

  const value =
    interactionFrequency * INTIMACY_WEIGHTS.interactionFrequency +
    trustValue * INTIMACY_WEIGHTS.trustValue +
    communicationDepth * INTIMACY_WEIGHTS.communicationDepth;

  return {
    value: Math.round(clamp(value, 0, 100)),
    breakdown: {
      interactionFrequency: Math.round(
        interactionFrequency * INTIMACY_WEIGHTS.interactionFrequency
      ),
      trustValue: Math.round(trustValue * INTIMACY_WEIGHTS.trustValue),
      communicationDepth: Math.round(communicationDepth * INTIMACY_WEIGHTS.communicationDepth),
    },
  };
}

// ============================================================
// 4. 信任趋势生成
// ============================================================

export interface GenerateTrustTrendInput {
  initialTrust: number;
  events: ObserveEvent[];
  category: PersonCategory;
  days: number; // 生成最近多少天的趋势
  knownSince?: Date; // 实际认识时间
  now?: Date;
}

/**
 * 生成信任趋势数据（用于图表）
 */
export function generateTrustTrend(input: GenerateTrustTrendInput): TrustTrendPoint[] {
  const { initialTrust, events, category, days, knownSince, now = new Date() } = input;

  const points: TrustTrendPoint[] = [];

  // 按日期分组事件
  const eventsByDate = new Map<string, ObserveEvent[]>();
  events.forEach(event => {
    const dateStr = event.createdAt.toISOString().split('T')[0];
    if (!eventsByDate.has(dateStr)) {
      eventsByDate.set(dateStr, []);
    }
    eventsByDate.get(dateStr)!.push(event);
  });

  // 生成每一天的数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // 获取该日期及之前的所有事件
    const priorEvents: ObserveEvent[] = [];
    eventsByDate.forEach((dayEvents, d) => {
      if (d <= dateStr) {
        priorEvents.push(...dayEvents);
      }
    });

    // 计算该日期的信任值
    const result = calculateTrustBank({
      initialTrust,
      events: priorEvents,
      lastObservedAt: priorEvents.length > 0 ? priorEvents[priorEvents.length - 1].createdAt : date,
      category,
      knownSince,
      now: date,
    });

    const dayEvents = eventsByDate.get(dateStr) || [];
    points.push({
      date: dateStr,
      value: result.currentValue,
      events: {
        positive: dayEvents.filter(e => e.type === 'positive').length,
        negative: dayEvents.filter(e => e.type === 'negative').length,
      },
    });
  }

  return points;
}

// ============================================================
// 5. 事件影响预览
// ============================================================

export interface PreviewEventImpactInput {
  currentTrust: number;
  eventCategoryId: string;
  customDelta?: number;
}

/**
 * 预览某事件对信任值的影响
 */
export function previewEventImpact(input: PreviewEventImpactInput): {
  newTrust: number;
  delta: number;
} {
  const { currentTrust, eventCategoryId, customDelta } = input;

  const config = getEventCategoryById(eventCategoryId);
  const delta = customDelta ?? config?.defaultTrustDelta ?? 0;

  return {
    newTrust: clamp(currentTrust + delta, 0, 100),
    delta,
  };
}

// ============================================================
// 信任可信度计算（路遥知马力）
// ============================================================

/**
 * 计算信任值的可信度（置信系数）
 *
 * 信任值本身表示“这个人值不值得信赖”，
 * 可信度表示“这个信任值有多靠谱”——认识时间越长、观察越多，越可信。
 *
 * 公式：
 *   daysFactor = min(daysSinceCreation / 365, 1)  // 认识时长，60%权重，1年封顶
 *   obsFactor  = min(observeCount / 20, 1)        // 观察次数，40%权重，20次封顶
 *   reliability = (daysFactor * 0.6 + obsFactor * 0.4) * 100
 */
export function calculateTrustReliability(input: {
  createdAt: Date;
  observeCount: number;
  now?: Date;
}): { score: number; daysSinceCreation: number; observeCount: number } {
  const now = input.now || new Date();
  const daysSinceCreation = Math.floor(
    (now.getTime() - new Date(input.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysFactor = Math.min(daysSinceCreation / 365, 1);
  const obsFactor = Math.min(input.observeCount / 20, 1);

  const score = Math.round((daysFactor * 0.6 + obsFactor * 0.4) * 100);

  return {
    score: Math.min(score, 100),
    daysSinceCreation,
    observeCount: input.observeCount,
  };
}
