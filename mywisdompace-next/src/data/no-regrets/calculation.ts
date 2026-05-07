import type { DimensionCategory } from "./assessmentData";
import { getUrgencyFactor, lifeTypes, type LifeType } from "./assessmentData";

// ── 类型定义 ──

export type ScoreInput = Record<string, number>; // dimensionId → 0-100

export type CategoryScore = {
  category: DimensionCategory;
  label: string;
  score: number;
};

export type AssessmentResult = {
  scores: ScoreInput;
  foundationScore: number; // 根基分
  relationScore: number; // 关系分
  selfScore: number; // 自我分
  urgencyFactor: number;
  selfAlignIndex: number; // 生命自洽指数 (0-100)
  lifeType: LifeType;
};

// ── 分类标签 ──
const categoryLabels: Record<DimensionCategory, string> = {
  self: "自我实现",
  relation: "关系质量",
  foundation: "健康根基",
};

// ── 计算 ──

export function calculateResult(
  scores: ScoreInput,
  age: number
): AssessmentResult {
  const entries = Object.entries(scores);

  // 按类别分组求平均
  const categoryMap: Record<DimensionCategory, number[]> = {
    self: [],
    relation: [],
    foundation: [],
  };

  // 维度ID到类别的映射
  const dimCategoryMap: Record<string, DimensionCategory> = {
    "self-real": "self",
    "work-life": "self",
    emotion: "self",
    relation: "relation",
    health: "foundation",
    flow: "self",
    happiness: "self",
  };

  entries.forEach(([id, score]) => {
    const cat = dimCategoryMap[id];
    if (cat) categoryMap[cat].push(score);
  });

  const avg = (arr: number[]) =>
    arr.length > 0 ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  const foundationScore = Math.round(avg(categoryMap.foundation));
  const relationScore = Math.round(avg(categoryMap.relation));
  const selfScore = Math.round(avg(categoryMap.self));

  const urgencyFactor = getUrgencyFactor(age);

  // 生命自洽指数
  const raw =
    (foundationScore * 0.4 + relationScore * 0.3 + selfScore * 0.3) *
    urgencyFactor;
  const selfAlignIndex = Math.min(100, Math.round(raw));

  // 五型分类
  const lifeType = determineLifeType(selfScore, relationScore, foundationScore);

  return {
    scores,
    foundationScore,
    relationScore,
    selfScore,
    urgencyFactor,
    selfAlignIndex,
    lifeType,
  };
}

// ── 五型判定 ──

function determineLifeType(
  self: number,
  relation: number,
  foundation: number
): LifeType {
  // E: 三项均≥70
  if (self >= 70 && relation >= 70 && foundation >= 70) return "E";

  // A: 自我分≥60, 根基分<50
  if (self >= 60 && foundation < 50) return "A";

  // B: 根基分≥60, 自我分<50
  if (foundation >= 60 && self < 50) return "B";

  // C: 自我分≥60, 根基分≥60, 关系分<50
  if (self >= 60 && foundation >= 60 && relation < 50) return "C";

  // D: 其他情况（各项中等）
  return "D";
}

// ── 获取类型定义 ──

export function getLifeTypeDef(typeId: LifeType) {
  return lifeTypes.find((t) => t.id === typeId) ?? lifeTypes[3]; // fallback to D
}

// ── 获取分维度建议 ──

export function getDimensionAdvice(
  dimensionId: string,
  score: number,
  adviceMap: Record<string, { low: string; mid: string; high: string }>
): string {
  const advice = adviceMap[dimensionId];
  if (!advice) return "";
  if (score < 40) return advice.low;
  if (score < 70) return advice.mid;
  return advice.high;
}
