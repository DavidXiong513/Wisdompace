// ==================== 能力兴趣测评类型定义 ==================== //

/** 单项能力数据 */
export interface Ability {
  id: number;          // 1-42
  name: string;        // 能力名称
  def: string;         // 能力定义
  domain: number;      // 所属能力域 0-6
  batch: number;       // 所属批次 1-7
  prof: string[];      // 擅长度行为锚定描述 [4级, 3级, 2级, 1级]
  inte: string[];      // 喜欢度行为锚定描述 [4级, 3级, 2级, 1级]
  related: number[];   // 关联能力ID列表
}

/** 能力域定义 */
export interface Domain {
  icon: string;        // 图标
  name: string;        // 域名称
  desc: string;        // 域描述
}

/** 单项评分 */
export interface AbilityAnswer {
  p: number;  // 擅长度 1-4
  i: number;  // 喜欢度 1-4
}

/** 四象限分类 */
export type QuadrantKey = 'strength' | 'potential' | 'reserve' | 'abandon';

/** 象限内2×2小宫格细分 */
export interface QuadrantDetail {
  // 优势区：p≥3,i≥3
  hh: Ability[];  // 很擅+很喜 (4,4)
  hm: Ability[];  // 很擅+较喜 (4,3)
  mh: Ability[];  // 较擅+很喜 (3,4)
  mm: Ability[];  // 较擅+较喜 (3,3)
}

export interface PotentialDetail {
  l4: Ability[];  // 很不擅+很喜欢 (1,4)
  l3: Ability[];  // 很不擅+较喜 (1,3)
  n4: Ability[];  // 不太擅+很喜欢 (2,4)
  n3: Ability[];  // 不太擅+较喜 (2,3)
}

export interface ReserveDetail {
  h2: Ability[];  // 很擅+较不喜 (4,2)
  h1: Ability[];  // 很擅+很不喜 (4,1)
  m2: Ability[];  // 较擅+较不喜 (3,2)
  m1: Ability[];  // 较擅+很不喜 (3,1)
}

export interface AbandonDetail {
  ll: Ability[];  // 很不擅+很不喜 (1,1)
  ln: Ability[];  // 很不擅+较不喜 (1,2)
  nl: Ability[];  // 不太擅+很不喜 (2,1)
  nn: Ability[];  // 不太擅+较不喜 (2,2)
}

/** 完整报告数据 */
export interface AbilityReport {
  quadrants: Record<QuadrantKey, Ability[]>;
  strengthDetail: QuadrantDetail;
  potentialDetail: PotentialDetail;
  reserveDetail: ReserveDetail;
  abandonDetail: AbandonDetail;
  domainStats: {
    domain: Domain;
    avgProf: number;
    avgInte: number;
  }[];
}

/** 矛盾检测告警 */
export interface AbilityAlert {
  abilityName: string;
  abilityLevel: string;
  relatedName: string;
  relatedLevel: string;
}

/** 测评阶段 */
export type AbilityPhase = 'welcome' | 'anchor' | 'evaluate' | 'batch-summary' | 'review' | 'report';

/** 评分标签 */
export const PROF_LABELS = ['很不擅长', '不太擅长', '比较擅长', '很擅长'] as const;
export const INTE_LABELS = ['非常不喜欢', '不太喜欢', '比较喜欢', '非常喜欢'] as const;
export const PROF_HINTS = ['(后10%)', '(后30%)', '(前30%)', '(前10%)'] as const;

/** 批次名称 */
export const BATCH_NAMES = [
  '信息处理与认知能力', '创意与审美能力', '执行与操作能力',
  '沟通与人际互动能力', '管理与规划能力', '适应与问题解决能力'
] as const;
