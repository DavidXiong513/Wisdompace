/**
 * 核心数据模型类型定义
 */

// ============================================================
// 基础类型
// ============================================================

export type PersonCategory =
  | 'parent' // 父母类
  | 'family' // 亲戚类
  | 'intimate' // 亲密关系类
  | 'friend' // 朋友类
  | 'classmate' // 同窗类
  | 'colleague' // 同事类
  | 'circle' // 圈子/社群类
  | 'stranger' // 陌生人
  | 'other'; // 其他

export type PersonStatus = 'active' | 'archived'; // 活跃 | 归档（冷宫）

export type EventType = 'positive' | 'neutral' | 'negative';

// ============================================================
// 人物主表
// ============================================================

export interface Person {
  id: string; // UUID
  alias: string; // 代号（非真名）
  avatar?: string; // 头像（emoji 或 base64 图片）
  category: PersonCategory; // 一级分类
  subCategory: string; // 二级分类 ID
  tags: string[]; // 自定义标签
  note?: string; // 总览备注

  // 关联数据 ID（可选，用于关联查询）
  hardwareId?: string;
  softwareId?: string;
  characterId?: string;
  networkId?: string;

  // 第一印象（创建时录入，此后只读）
  firstImpression?: number; // 第一印象分 0-100，可选
  firstImpressionNote?: string; // 第一印象备注，可选
  knownSince?: Date; // 实际认识时间（可选，默认为录入时间）

  // 统计字段（冗余存储，便于列表查询）
  trustValue: number; // 当前信任值（0-100）
  reliability: number; // 靠谱度（0-100）
  intimacy: number; // 亲密度（0-100）

  // 关系状态
  status: PersonStatus; // 活跃/归档（冷宫）

  createdAt: Date;
  updatedAt: Date;
  lastObservedAt: Date; // 最后观察时间（用于衰减计算）
}

// 创建人物时的输入类型
export interface CreatePersonInput {
  alias: string;
  avatar?: string;
  category: PersonCategory;
  subCategory: string;
  tags?: string[];
  note?: string;
  firstImpression?: number; // 第一印象分 0-100
  firstImpressionNote?: string; // 第一印象备注
  knownSince?: Date; // 实际认识时间
  hardware?: CreateHardwareInput;
  software?: CreateSoftwareInput;
}

// ============================================================
// 硬件信息（身高体重等）
// ============================================================

export interface HardwareInfo {
  id: string;
  personId: string;
  height?: number; // cm
  weight?: number; // kg
  age?: number;
  education?: string; // 学历
  occupation?: string; // 职业
  incomeLevel?: string; // 收入水平（描述）
  location?: string; // 所在地
  company?: string; // 公司/单位
  updatedAt: Date;
}

export interface CreateHardwareInput {
  height?: number;
  weight?: number;
  age?: number;
  education?: string;
  occupation?: string;
  incomeLevel?: string;
  location?: string;
  company?: string;
}

// ============================================================
// 软件特质（MBTI/星座/兴趣等）
// ============================================================

export interface SoftwareTrait {
  id: string;
  personId: string;
  mbti?: string; // MBTI类型，如 "INTJ"
  zodiac?: string; // 星座
  bloodType?: string; // 血型
  hobbies: string[]; // 兴趣爱好
  personalityTags: string[]; // 性格标签（如 "外向", "细心"）
  updatedAt: Date;
}

export interface CreateSoftwareInput {
  mbti?: string;
  zodiac?: string;
  bloodType?: string;
  hobbies?: string[];
  personalityTags?: string[];
}

// ============================================================
// 品性观察评分
// ============================================================

export interface CharacterScores {
  id: string;
  personId: string;
  diligence: number; // 尽责度 0-10
  reliability: number; // 靠谱度 0-10
  integrity: number; // 诚信人品 0-10
  emotionalStability: number; // 情绪稳定 0-10
  empathy: number; // 同理心 0-10
  updatedAt: Date;
}

export interface UpdateCharacterInput {
  diligence?: number;
  reliability?: number;
  integrity?: number;
  emotionalStability?: number;
  empathy?: number;
}

// ============================================================
// 能力项
// ============================================================

export interface Ability {
  id: string;
  personId: string;
  name: string; // 能力名称
  level: number; // 熟练度 1-5
  description?: string; // 描述
  createdAt: Date;
}

// ============================================================
// 人脉资源
// ============================================================

export interface NetworkInfo {
  id: string;
  personId: string;
  industry?: string; // 所属行业
  resources: NetworkResource[]; // 资源列表
  connections: string[]; // 关联人物ID（人脉网络）
  updatedAt: Date;
}

export interface NetworkResource {
  id: string;
  type: string; // 资源类型（如 "信息", "资金", "渠道"）
  description: string;
  value: number; // 价值评估 1-5
}

// ============================================================
// 观察记录（信任事件）
// ============================================================

export interface ObserveEvent {
  id: string;
  personId: string;
  type: EventType; // 正面/中性/负面
  eventCategory: string; // 事件类型 ID（如 "keep_promise"）
  affectedDimensions: string[]; // 影响维度 ID 列表
  trustDelta: number; // 信任值变化（+/-）
  note: string; // 观察笔记
  createdAt: Date;
}

export interface CreateObserveEventInput {
  personId: string;
  type: EventType;
  eventCategory: string;
  affectedDimensions: string[];
  trustDelta?: number; // 可选，默认使用事件配置
  note: string;
}

// ============================================================
// 信任银行计算结果
// ============================================================

export interface DecayInfo {
  totalDecayed: number; // 累计衰减值
  daysOverdue: number; // 超期天数
  nextDecayAt: Date; // 下次衰减时间
}

export interface TrustBankResult {
  currentValue: number; // 当前信任值 0-100
  initialValue: number; // 初始值
  eventDelta: number; // 事件累计变化
  timeBonus: number; // 时间增长加分（日久见人心）
  decay: DecayInfo; // 衰减信息
  status: TrustStatus; // 信任等级
  freshness: FreshnessStatus; // 新鲜度状态
}

export interface TrustStatus {
  level: string; // 等级标签（如 "高度信任"）
  color: string; // 颜色类
  description: string;
}

export interface FreshnessStatus {
  status: 'fresh' | 'normal' | 'stale' | 'expired';
  label: string;
  color: string;
  message: string;
}

// ============================================================
// 靠谱度/亲密度计算结果
// ============================================================

export interface ReliabilityResult {
  value: number; // 0-100
  characterScore: number; // 品性部分得分
  eventScore: number; // 事件部分得分
  breakdown: {
    diligence: number;
    integrity: number;
    emotionalStability: number;
    eventReliability: number;
  };
}

export interface IntimacyResult {
  value: number; // 0-100
  breakdown: {
    interactionFrequency: number;
    trustValue: number;
    communicationDepth: number;
  };
}

// ============================================================
// 信任趋势点（用于图表）
// ============================================================

export interface TrustTrendPoint {
  date: string; // YYYY-MM-DD
  value: number; // 当日信任值
  events: {
    // 当日事件
    positive: number;
    negative: number;
  };
}

// ============================================================
// 筛选与搜索
// ============================================================

export interface PersonFilters {
  category?: PersonCategory;
  subCategory?: string;
  tags?: string[];
  minTrust?: number;
  maxTrust?: number;
  query?: string; // 搜索代号/标签
  status?: PersonStatus; // 按状态筛选
}

// ============================================================
// 导出/导入
// ============================================================

export interface ExportData {
  version: string;
  exportedAt: string;
  persons: Person[];
  hardwareInfos: HardwareInfo[];
  softwareTraits: SoftwareTrait[];
  characterScores: CharacterScores[];
  networkInfos: NetworkInfo[];
  abilities: Ability[];
  observeEvents: ObserveEvent[];
}

export interface ImportResult {
  success: boolean;
  importedPersons: number;
  importedEvents: number;
  errors: string[];
}
