/**
 * 大五人格测试 — 类型定义
 */

/** 单道题目 */
export type BigFiveQuestion = {
  id: number;
  text: string;
  dimension: BigFiveDimensionKey;
  reverse: boolean;
};

/** 五维度键名 */
export type BigFiveDimensionKey =
  | 'extraversion'
  | 'openness'
  | 'agreeableness'
  | 'conscientiousness'
  | 'neuroticism';

/** 维度元信息（从 questions.json 的 dimensions 字段解析） */
export type DimensionMeta = {
  name: string;
  name_en: string;
  description: string;
  questions: number[];
  reverse_questions: number[];
};

/** 维度解析等级段 */
export type DimensionRange = {
  min: number;
  max: number;
  level: string;
  label: string;
  traits: string[];
  description: string;
  advice: string;
  career: string;
};

/** 维度解析数据（从 interpretations.json 解析） */
export type DimensionInterpretation = {
  name: string;
  name_en: string;
  alias: string;
  description: string;
  ranges: DimensionRange[];
};

/** 整体画像 */
export type OverallProfile = {
  name: string;
  description: string;
};

/** 单维度得分结果 */
export type DimensionScore = {
  key: BigFiveDimensionKey;
  name: string;
  name_en: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  level: string;
  label: string;
  traits: string[];
  description: string;
  advice: string;
  career: string;
};

/** 完整测试结果 */
export type BigFiveTestResult = {
  dimensionScores: DimensionScore[];
  matchedProfiles: Array<{ name: string; description: string }>;
  completedAt: string;
};
