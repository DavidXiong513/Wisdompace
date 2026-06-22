/**
 * 权重系数与信任等级配置
 */

// ============================================================
// 靠谱度计算权重
// ============================================================

export const RELIABILITY_WEIGHTS = {
  diligence: 0.3, // 尽责度
  integrity: 0.3, // 诚信人品
  emotionalStability: 0.2, // 情绪稳定性
  eventScore: 0.2, // 事件评分
} as const;

// ============================================================
// 亲密度计算权重
// ============================================================

export const INTIMACY_WEIGHTS = {
  interactionFrequency: 0.4, // 互动频率
  trustValue: 0.3, // 信任银行值
  communicationDepth: 0.3, // 沟通深度
} as const;

// ============================================================
// 信任银行等级定义
// ============================================================

export interface TrustLevel {
  min: number;
  max: number;
  label: string;
  color: string; // Tailwind 颜色类
  description: string;
}

export const TRUST_LEVELS: TrustLevel[] = [
  {
    min: 0,
    max: 20,
    label: '警惕',
    color: 'text-red-600',
    description: '需要高度警惕，保持距离',
  },
  {
    min: 21,
    max: 40,
    label: '观察中',
    color: 'text-orange-500',
    description: '仍在观察，谨慎交往',
  },
  {
    min: 41,
    max: 60,
    label: '普通信任',
    color: 'text-yellow-500',
    description: '基本的信任，可以正常交往',
  },
  {
    min: 61,
    max: 75,
    label: '较为信任',
    color: 'text-lime-500',
    description: '比较可靠，可以适度依赖',
  },
  {
    min: 76,
    max: 90,
    label: '高度信任',
    color: 'text-emerald-500',
    description: '非常可靠，可以深度交往',
  },
  {
    min: 91,
    max: 100,
    label: '深度信任',
    color: 'text-purple-600',
    description: '完全信任，可以托付重要事务',
  },
];

export function getTrustLevel(value: number): TrustLevel {
  const level = TRUST_LEVELS.find(l => value >= l.min && value <= l.max);
  return level || TRUST_LEVELS[0];
}

// ============================================================
// 观察新鲜度状态
// ============================================================

export interface FreshnessStatus {
  status: 'fresh' | 'normal' | 'stale' | 'expired';
  label: string;
  color: string;
  message: string;
}

export function getFreshnessStatus(
  daysSinceLastObserved: number,
  observeCycleDays: number
): FreshnessStatus {
  const ratio = daysSinceLastObserved / observeCycleDays;

  if (ratio < 0.5) {
    return {
      status: 'fresh',
      label: '新鲜',
      color: 'text-emerald-500',
      message: '观察数据较新',
    };
  }
  if (ratio < 0.8) {
    return {
      status: 'normal',
      label: '正常',
      color: 'text-blue-500',
      message: '观察数据正常',
    };
  }
  if (ratio < 1.2) {
    return {
      status: 'stale',
      label: '将过期',
      color: 'text-yellow-500',
      message: '观察即将过期，建议更新',
    };
  }
  return {
    status: 'expired',
    label: '已过期',
    color: 'text-gray-400',
    message: '观察已过期，信任值基于陈旧数据',
  };
}

// ============================================================
// 品性维度配置
// ============================================================

export interface CharacterDimension {
  id: string;
  label: string;
  description: string;
  maxScore: number; // 满分
}

export const CHARACTER_DIMENSIONS: CharacterDimension[] = [
  {
    id: 'diligence',
    label: '尽责度',
    description: '做事认真负责，有始有终',
    maxScore: 10,
  },
  {
    id: 'reliability',
    label: '靠谱度',
    description: '值得信赖，说到做到',
    maxScore: 10,
  },
  {
    id: 'integrity',
    label: '诚信人品',
    description: '诚实守信，品行端正',
    maxScore: 10,
  },
  {
    id: 'emotionalStability',
    label: '情绪稳定',
    description: '情绪管理良好，不易失控',
    maxScore: 10,
  },
  {
    id: 'empathy',
    label: '同理心',
    description: '能换位思考，理解他人感受',
    maxScore: 10,
  },
];

export function getCharacterDimensionById(id: string): CharacterDimension | undefined {
  return CHARACTER_DIMENSIONS.find(d => d.id === id);
}
