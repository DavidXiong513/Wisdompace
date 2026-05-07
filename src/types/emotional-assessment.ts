export type QuestionCategory = 'emotion' | 'tension' | 'life_events';

export interface EmotionTensionQuestion {
  id: number;
  content: string;
  dimension: string;
  isReverse: boolean;
  triggersWarning?: boolean; // 比如第19题的消极想法关注
}

export interface LifeEvent {
  id: number;
  content: string;
  category: string;
  lcu: number;
  remark: string;
}

export interface AssessmentAnswers {
  emotion: Record<number, number>; // 题号 -> 1-4分
  tension: Record<number, number>; // 题号 -> 1-4分
  lifeEvents: number[]; // 选中的事件ID数组
}

export interface DimensionScore {
  name: string;
  score: number; // 原始总分
  maxScore: number;
}

export interface ModuleResult {
  rawScore: number;
  standardScore: number;
  level: number; // 0-3 (良好, 稍有波动, 值得关注, 建议关注)
  levelName: string;
  dimensions?: DimensionScore[];
}

export interface LifeEventsResult {
  lcuTotal: number;
  level: number; // 0-2 (较低, 有一定, 较大)
  levelName: string;
  highStressCount: number; // LCU >= 60 的事件数量
}

export interface AssessmentResult {
  emotion: ModuleResult;
  tension: ModuleResult;
  lifeEvents: LifeEventsResult;
  comprehensiveLevel: number; // 1-5
  comprehensiveName: string;
  suggestion: string;
  warnings: string[]; // 触发的特殊预警
}