import { lifestyleQuestions, MAX_LIFESTYLE_SCORE } from "./questions";

// ── 类型定义 ──

export type BaselineAnswers = Record<string, number>; // questionId -> coefficient
export type LifestyleAnswers = Record<string, number>; // questionId -> score

export type RiskLevel = "attention" | "alert" | "action" | "critical";

export interface RiskResult {
  // 基准风险
  geneticCoefficient: number;
  ageCoefficient: number;
  baselineCoefficient: number;

  // 生活方式
  lifestyleScore: number;
  lifestyleAdjustment: number;

  // 综合
  finalCoefficient: number;
  riskLevel: RiskLevel;

  // 分项画像
  bestDimensions: { id: string; score: number }[];   // 做得好的维度（得分低）
  worstDimensions: { id: string; score: number }[];   // 待改进维度（得分高）
}

// ── 计算函数 ──

export function calculateBaseline(answers: BaselineAnswers): {
  geneticCoefficient: number;
  ageCoefficient: number;
  baselineCoefficient: number;
} {
  const direct = answers["family-direct"] ?? 1.0;
  const indirect = answers["family-indirect"] ?? 1.0;
  const age = answers["age-group"] ?? 1.0;

  const geneticCoefficient = direct * indirect;
  const ageCoefficient = age;
  const baselineCoefficient = geneticCoefficient * ageCoefficient;

  return { geneticCoefficient, ageCoefficient, baselineCoefficient };
}

export function calculateLifestyle(answers: LifestyleAnswers): {
  lifestyleScore: number;
  lifestyleAdjustment: number;
} {
  const lifestyleScore = lifestyleQuestions.reduce((sum, q) => {
    return sum + (answers[q.id] ?? 0);
  }, 0);

  const lifestyleAdjustment = 1 + lifestyleScore / MAX_LIFESTYLE_SCORE;

  return { lifestyleScore, lifestyleAdjustment };
}

export function getRiskLevel(finalCoefficient: number): RiskLevel {
  if (finalCoefficient <= 1.5) return "attention";
  if (finalCoefficient <= 3.0) return "alert";
  if (finalCoefficient <= 5.0) return "action";
  return "critical";
}

export function getBestAndWorst(
  answers: LifestyleAnswers
): { best: { id: string; score: number }[]; worst: { id: string; score: number }[] } {
  const items = lifestyleQuestions.map((q) => ({
    id: q.id,
    score: answers[q.id] ?? 0,
  }));

  const sorted = [...items].sort((a, b) => a.score - b.score);
  const best = sorted.slice(0, 3).filter((d) => d.score === 0 || d.score <= sorted[1].score);
  const worst = sorted
    .reverse()
    .slice(0, 3)
    .filter((d) => d.score > 0);

  return { best, worst };
}

export function calculateFullResult(
  baselineAnswers: BaselineAnswers,
  lifestyleAnswers: LifestyleAnswers
): RiskResult {
  const baseline = calculateBaseline(baselineAnswers);
  const lifestyle = calculateLifestyle(lifestyleAnswers);
  const finalCoefficient = baseline.baselineCoefficient * lifestyle.lifestyleAdjustment;
  const riskLevel = getRiskLevel(finalCoefficient);
  const { best, worst } = getBestAndWorst(lifestyleAnswers);

  return {
    ...baseline,
    ...lifestyle,
    finalCoefficient: Math.round(finalCoefficient * 100) / 100,
    riskLevel,
    bestDimensions: best,
    worstDimensions: worst,
  };
}
