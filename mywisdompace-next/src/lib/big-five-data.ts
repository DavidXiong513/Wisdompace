/**
 * 大五人格测试 — 数据加载、计分逻辑、维度解析
 *
 * 数据来源: /public/data/big-five/ 下的 JSON 文件
 * - questions.json      — 60 道题 + 维度元信息
 * - interpretations.json — 五维度解析（等级/特征/建议/职业）
 */

import type {
  BigFiveQuestion,
  BigFiveDimensionKey,
  DimensionInterpretation,
  DimensionScore,
  BigFiveTestResult,
} from '@/types/big-five';

// ── 常量 ──────────────────────────────────────────────────────────────────

/** 李克特 5 点量表标签 */
export const SCALE_LABELS = ['完全不同意', '基本不同意', '不确定', '基本同意', '完全同意'] as const;

/** 每页显示题目数 */
export const QUESTIONS_PER_PAGE = 10;

/** 维度展示顺序（与题库一致） */
export const DIMENSION_ORDER: BigFiveDimensionKey[] = [
  'extraversion',
  'openness',
  'agreeableness',
  'conscientiousness',
  'neuroticism',
];

/** 维度展示信息（欢迎页用） */
export const DIMENSION_INFO: Record<BigFiveDimensionKey, { icon: string; name: string; desc: string }> = {
  extraversion: { icon: '🤝', name: '外向性', desc: '社交活跃度、精力充沛程度和积极情绪倾向' },
  openness: { icon: '🎨', name: '开放性', desc: '想象力、审美敏感性、求知欲和创造力' },
  agreeableness: { icon: '💛', name: '亲和性', desc: '合作性、信任度和利他倾向' },
  conscientiousness: { icon: '📋', name: '尽责性', desc: '自律性、条理性、目标导向和责任感' },
  neuroticism: { icon: '🌊', name: '神经质', desc: '情绪稳定性和应对压力的能力' },
};

/** 维度配色 */
export const DIMENSION_COLORS: Record<BigFiveDimensionKey, { main: string; light: string; dark: string }> = {
  extraversion: { main: '#E8A849', light: '#FFF5E0', dark: '#B07D2A' },
  openness: { main: '#7B68EE', light: '#F0ECFF', dark: '#5A45CC' },
  agreeableness: { main: '#E87461', light: '#FFF0ED', dark: '#C45A47' },
  conscientiousness: { main: '#4CAF82', light: '#EDFFF5', dark: '#2E8B57' },
  neuroticism: { main: '#5B9BD5', light: '#EBF3FB', dark: '#3A7BBF' },
};

// ── 数据缓存 ──────────────────────────────────────────────────────────────

let _questions: BigFiveQuestion[] | null = null;
let _interpretations: Record<string, DimensionInterpretation> | null = null;

// ── 数据加载 ──────────────────────────────────────────────────────────────

export async function loadQuestions(): Promise<BigFiveQuestion[]> {
  if (_questions) return _questions;
  const res = await fetch('/data/big-five/questions.json');
  const json = await res.json();
  _questions = json.questions;
  return _questions!;
}

export async function loadInterpretations(): Promise<Record<string, DimensionInterpretation>> {
  if (_interpretations) return _interpretations;
  const res = await fetch('/data/big-five/interpretations.json');
  const json = await res.json();
  _interpretations = json.dimensions;
  return _interpretations!;
}

/** 一次性加载所有数据 */
export async function loadAllBigFiveData() {
  const [questions, interpretations] = await Promise.all([
    loadQuestions(),
    loadInterpretations(),
  ]);
  return { questions, interpretations };
}

// ── 工具函数 ──────────────────────────────────────────────────────────────

/** 获取总页数 */
export function getTotalPages(totalQuestions: number): number {
  return Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
}

/** 获取指定页的题目 */
export function getPageQuestions(questions: BigFiveQuestion[], page: number): BigFiveQuestion[] {
  const start = (page - 1) * QUESTIONS_PER_PAGE;
  return questions.slice(start, start + QUESTIONS_PER_PAGE);
}

// ── 计分逻辑 ──────────────────────────────────────────────────────────────

/**
 * 计算单维度得分
 * - 正向题：直接取分值（1-5）
 * - 反向题：6 - 分值
 * - 维度总分 = 该维度所有题目得分之和
 */
function calcDimensionRawScore(
  dimension: BigFiveDimensionKey,
  answers: Record<number, number>,
  questions: BigFiveQuestion[],
): number {
  return questions
    .filter((q) => q.dimension === dimension)
    .reduce((sum, q) => {
      const rawAnswer = answers[q.id];
      if (rawAnswer === undefined) return sum;
      return sum + (q.reverse ? 6 - rawAnswer : rawAnswer);
    }, 0);
}

/** 获取维度已答题数 */
export function getDimensionAnsweredCount(
  dimension: BigFiveDimensionKey,
  answers: Record<number, number>,
  questions: BigFiveQuestion[],
): number {
  return questions.filter((q) => q.dimension === dimension && answers[q.id] !== undefined).length;
}

/** 获取维度总题数 */
export function getDimensionQuestionCount(
  dimension: BigFiveDimensionKey,
  questions: BigFiveQuestion[],
): number {
  return questions.filter((q) => q.dimension === dimension).length;
}

// ── 结果生成 ──────────────────────────────────────────────────────────────

/**
 * 生成完整的测试结果
 */
export function generateTestResult(
  answers: Record<number, number>,
  questions: BigFiveQuestion[],
  interpretations: Record<string, DimensionInterpretation>,
): BigFiveTestResult {
  const dimensionScores: DimensionScore[] = DIMENSION_ORDER.map((key) => {
    const interp = interpretations[key];
    const rawScore = calcDimensionRawScore(key, answers, questions);
    const count = getDimensionQuestionCount(key, questions);
    const maxScore = count * 5;
    const percentage = Math.round((rawScore / maxScore) * 100);

    // 找到对应的等级段
    const range = interp.ranges.find((r) => rawScore >= r.min && rawScore <= r.max)
      ?? interp.ranges[interp.ranges.length - 1];

    return {
      key,
      name: interp.name,
      name_en: interp.name_en,
      rawScore,
      maxScore,
      percentage,
      level: range.level,
      label: range.label,
      traits: range.traits,
      description: range.description,
      advice: range.advice,
      career: range.career,
    };
  });

  // 匹配整体画像
  const matchedProfiles = matchOverallProfiles(dimensionScores);

  return {
    dimensionScores,
    matchedProfiles,
    completedAt: new Date().toISOString(),
  };
}

/**
 * 匹配整体画像
 * 基于维度得分高低组合来判断
 */
function matchOverallProfiles(scores: DimensionScore[]): Array<{ name: string; description: string }> {
  const profiles: Array<{ name: string; description: string }> = [];

  // 判断高低：以 50% 为界
  const isHigh = (key: BigFiveDimensionKey) => {
    const s = scores.find((d) => d.key === key);
    return s && s.percentage >= 50;
  };

  if (isHigh('openness') && isHigh('conscientiousness')) {
    profiles.push({
      name: '创新型实干家',
      description: '您既有创新的思维，又有实现想法的执行力。这种组合非常难得，使您能够将创意转化为实际成果。',
    });
  }

  if (isHigh('extraversion') && isHigh('agreeableness')) {
    profiles.push({
      name: '社交达人',
      description: '您外向且友善，是天生的社交高手。您能够轻松建立广泛的人际网络，在人群中如鱼得水。',
    });
  }

  if (!isHigh('neuroticism') && isHigh('conscientiousness')) {
    profiles.push({
      name: '稳定可靠者',
      description: '您情绪稳定且认真负责，是团队中值得信赖的基石。无论环境如何变化，您都能保持稳定的表现。',
    });
  }

  if (isHigh('neuroticism') && isHigh('openness')) {
    profiles.push({
      name: '敏感艺术家',
      description: '您敏感且富有创造力，对艺术和美感有独特的感知。虽然情绪波动较大，但这正是您创造力的源泉。',
    });
  }

  if (!isHigh('extraversion') && isHigh('openness')) {
    profiles.push({
      name: '独立思考者',
      description: '您喜欢独处思考，具有丰富的内心世界。您不随波逐流，能够形成独特的见解和创意。',
    });
  }

  return profiles;
}
