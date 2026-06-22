/**
 * 观察事件类型与分值配置
 */

export type EventType = 'positive' | 'neutral' | 'negative';

export interface EventCategoryConfig {
  id: string;
  label: string;
  type: EventType;
  defaultTrustDelta: number; // 默认信任值变化
  affectedDimensions: string[]; // 默认影响维度
  description?: string;
}

// 正面事件（+信任值）
export const POSITIVE_EVENTS: EventCategoryConfig[] = [
  {
    id: 'keep_promise',
    label: '履约',
    type: 'positive',
    defaultTrustDelta: 5,
    affectedDimensions: ['reliability', 'integrity'],
    description: '按时完成承诺的事情',
  },
  {
    id: 'help_others',
    label: '主动帮助',
    type: 'positive',
    defaultTrustDelta: 4,
    affectedDimensions: ['empathy', 'integrity'],
    description: '主动提供帮助，不求回报',
  },
  {
    id: 'consistent',
    label: '言行一致',
    type: 'positive',
    defaultTrustDelta: 5,
    affectedDimensions: ['integrity', 'reliability'],
    description: '说的和做的一致',
  },
  {
    id: 'share_info',
    label: '分享信息',
    type: 'positive',
    defaultTrustDelta: 3,
    affectedDimensions: ['empathy'],
    description: '无私分享有价值的信息',
  },
  {
    id: 'take_responsibility',
    label: '承担责任',
    type: 'positive',
    defaultTrustDelta: 6,
    affectedDimensions: ['diligence', 'reliability'],
    description: '主动承担责任，不推诿',
  },
  {
    id: 'deep_communication',
    label: '深度沟通',
    type: 'positive',
    defaultTrustDelta: 3,
    affectedDimensions: ['empathy', 'emotionalStability'],
    description: '进行有深度的情感交流',
  },
  {
    id: 'exceed_expectation',
    label: '超预期',
    type: 'positive',
    defaultTrustDelta: 7,
    affectedDimensions: ['diligence', 'reliability'],
    description: '结果超出预期',
  },
];

// 中性事件（+0 或 +1，主要用于记录观察）
export const NEUTRAL_EVENTS: EventCategoryConfig[] = [
  {
    id: 'observation',
    label: '日常观察',
    type: 'neutral',
    defaultTrustDelta: 0,
    affectedDimensions: [],
    description: '记录观察到的行为或特征',
  },
  {
    id: 'info_update',
    label: '信息更新',
    type: 'neutral',
    defaultTrustDelta: 0,
    affectedDimensions: [],
    description: '更新人物的基础信息',
  },
  {
    id: 'routine_contact',
    label: '常规接触',
    type: 'neutral',
    defaultTrustDelta: 1,
    affectedDimensions: [],
    description: '正常的社交接触，无明显正负',
  },
];

// 负面事件（-信任值）
export const NEGATIVE_EVENTS: EventCategoryConfig[] = [
  {
    id: 'break_promise',
    label: '失信',
    type: 'negative',
    defaultTrustDelta: -8,
    affectedDimensions: ['reliability', 'integrity'],
    description: '未履行承诺',
  },
  {
    id: 'lie',
    label: '说谎',
    type: 'negative',
    defaultTrustDelta: -10,
    affectedDimensions: ['integrity'],
    description: '被发现说谎',
  },
  {
    id: 'shirk_responsibility',
    label: '推诿',
    type: 'negative',
    defaultTrustDelta: -6,
    affectedDimensions: ['diligence', 'reliability'],
    description: '推卸责任',
  },
  {
    id: 'disrespect',
    label: '不尊重',
    type: 'negative',
    defaultTrustDelta: -5,
    affectedDimensions: ['empathy', 'emotionalStability'],
    description: '言语或行为不尊重他人',
  },
  {
    id: 'emotional_outburst',
    label: '情绪失控',
    type: 'negative',
    defaultTrustDelta: -4,
    affectedDimensions: ['emotionalStability'],
    description: '情绪失控，行为失态',
  },
  {
    id: 'selfish',
    label: '自私行为',
    type: 'negative',
    defaultTrustDelta: -5,
    affectedDimensions: ['empathy', 'integrity'],
    description: '明显损人利己的行为',
  },
];

export const ALL_EVENTS: EventCategoryConfig[] = [
  ...POSITIVE_EVENTS,
  ...NEUTRAL_EVENTS,
  ...NEGATIVE_EVENTS,
];

export function getEventCategoryById(id: string): EventCategoryConfig | undefined {
  return ALL_EVENTS.find(e => e.id === id);
}

export function getEventsByType(type: EventType): EventCategoryConfig[] {
  return ALL_EVENTS.filter(e => e.type === type);
}
