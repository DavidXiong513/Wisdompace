/**
 * MBTI 测试数据加载与计分工具
 *
 * 数据来源: /public/data/mbti/ 下的 JSON 文件
 * - questions.json  — 93 道题
 * - scoring.json    — 计分规则
 * - types.json      — 16 种人格描述
 */

import type { MBTIQuestion, ScoringRule, PersonalityTypeData, DimensionScores, TestResult } from '@/types/mbti';

// ── 数据缓存 ──────────────────────────────────────────────────────────────────

let _questions: MBTIQuestion[] | null = null;
let _scoringRules: ScoringRule[] | null = null;
let _personalityTypes: PersonalityTypeData[] | null = null;

// ── 数据加载 ──────────────────────────────────────────────────────────────────

export async function loadQuestions(): Promise<MBTIQuestion[]> {
  if (_questions) return _questions;
  const res = await fetch('/data/mbti/questions.json');
  const json = await res.json();
  _questions = json.questions;
  return _questions!;
}

export async function loadScoringRules(): Promise<ScoringRule[]> {
  if (_scoringRules) return _scoringRules;
  const res = await fetch('/data/mbti/scoring.json');
  const json = await res.json();
  _scoringRules = json.rules;
  return _scoringRules!;
}

export async function loadPersonalityTypes(): Promise<PersonalityTypeData[]> {
  if (_personalityTypes) return _personalityTypes;
  const res = await fetch('/data/mbti/types.json');
  const json = await res.json();
  _personalityTypes = json.types;
  return _personalityTypes!;
}

/** 一次性加载所有数据 */
export async function loadAllMBTIData() {
  const [questions, scoringRules, personalityTypes] = await Promise.all([
    loadQuestions(),
    loadScoringRules(),
    loadPersonalityTypes(),
  ]);
  return { questions, scoringRules, personalityTypes };
}

// ── 计分逻辑 ──────────────────────────────────────────────────────────────────

/** 计算八维度得分 */
export function calculateScores(
  answers: Record<number, 'A' | 'B'>,
  scoringRules: ScoringRule[]
): DimensionScores {
  const scores: DimensionScores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  for (const rule of scoringRules) {
    const answer = answers[rule.id];
    if (!answer) continue;
    if (answer === 'A') {
      scores[rule.optionA]++;
    } else {
      scores[rule.optionB]++;
    }
  }

  return scores;
}

/** 根据八维度得分确定四字母人格类型 */
export function determineType(scores: DimensionScores): string {
  const type =
    (scores.E >= scores.I ? 'E' : 'I') +
    (scores.S >= scores.N ? 'S' : 'N') +
    (scores.T >= scores.F ? 'T' : 'F') +
    (scores.J >= scores.P ? 'J' : 'P');
  return type;
}

/** 生成完整测试结果 */
export function generateTestResult(
  answers: Record<number, 'A' | 'B'>,
  scoringRules: ScoringRule[],
  personalityTypes: PersonalityTypeData[]
): TestResult {
  const scores = calculateScores(answers, scoringRules);
  const typeCode = determineType(scores);
  const typeData = personalityTypes.find((t) => t.code === typeCode)!;

  return {
    type: typeCode,
    scores,
    typeName: typeData?.name ?? typeCode,
    typeData: typeData ?? {
      code: typeCode,
      name: typeCode,
      dominant: '-',
      auxiliary: '-',
      tertiary: '-',
      inferior: '-',
      bestPerformance: '暂无描述',
      characteristics: '暂无描述',
      othersView: '暂无描述',
      growthAreas: '暂无描述',
    },
  };
}

// ── 题目分区信息 ──────────────────────────────────────────────────────────────

export const SECTION_INFO: Record<string, { title: string; range: string }> = {
  part1: { title: '第一部分', range: '情景题 1-26' },
  part2: { title: '第二部分', range: '词语配对 27-58' },
  part3: { title: '第三部分', range: '情景题 59-78' },
  part4: { title: '第四部分', range: '词语配对 79-93' },
};

/** 每页显示题目数 */
export const QUESTIONS_PER_PAGE = 10;

/** 计算总页数 */
export function getTotalPages(totalQuestions: number): number {
  return Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
}

/** 获取某一页的题目切片 */
export function getPageQuestions(questions: MBTIQuestion[], page: number): MBTIQuestion[] {
  const start = page * QUESTIONS_PER_PAGE;
  return questions.slice(start, start + QUESTIONS_PER_PAGE);
}

// ── 维度展示工具 ──────────────────────────────────────────────────────────────

export interface DimensionPair {
  left: { letter: string; name: string; score: number };
  right: { letter: string; name: string; score: number };
}

const DIMENSION_NAMES: Record<string, string> = {
  E: '外向',
  I: '内向',
  S: '感觉',
  N: '直觉',
  T: '思考',
  F: '情感',
  J: '判断',
  P: '知觉',
};

/** 获取四组维度对比数据（用于结果页柱状图） */
export function getDimensionPairs(scores: DimensionScores): DimensionPair[] {
  return [
    {
      left: { letter: 'E', name: DIMENSION_NAMES.E, score: scores.E },
      right: { letter: 'I', name: DIMENSION_NAMES.I, score: scores.I },
    },
    {
      left: { letter: 'S', name: DIMENSION_NAMES.S, score: scores.S },
      right: { letter: 'N', name: DIMENSION_NAMES.N, score: scores.N },
    },
    {
      left: { letter: 'T', name: DIMENSION_NAMES.T, score: scores.T },
      right: { letter: 'F', name: DIMENSION_NAMES.F, score: scores.F },
    },
    {
      left: { letter: 'J', name: DIMENSION_NAMES.J, score: scores.J },
      right: { letter: 'P', name: DIMENSION_NAMES.P, score: scores.P },
    },
  ];
}
