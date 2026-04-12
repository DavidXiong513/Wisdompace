import { describe, it, expect, vi } from 'vitest';
import {
  calculateDimensionScores,
  determinePersonalityType,
  calculateResult,
} from '../scoring';
import type { ScoringRule, PersonalityTypeData } from '@/types/mbti';

// Sample scoring rules for testing (simplified MBTI rules)
const testScoringRules: ScoringRule[] = [
  // E/I dimension questions
  { id: 1, optionA: 'E', optionB: 'I' },
  { id: 2, optionA: 'E', optionB: 'I' },
  { id: 3, optionA: 'E', optionB: 'I' },
  // S/N dimension questions
  { id: 4, optionA: 'S', optionB: 'N' },
  { id: 5, optionA: 'S', optionB: 'N' },
  { id: 6, optionA: 'S', optionB: 'N' },
  // T/F dimension questions
  { id: 7, optionA: 'T', optionB: 'F' },
  { id: 8, optionA: 'T', optionB: 'F' },
  { id: 9, optionA: 'T', optionB: 'F' },
  // J/P dimension questions
  { id: 10, optionA: 'J', optionB: 'P' },
  { id: 11, optionA: 'J', optionB: 'P' },
  { id: 12, optionA: 'J', optionB: 'P' },
];

const testTypesData: PersonalityTypeData[] = [
  {
    code: 'ENFJ',
    name: '主人公',
    dominant: 'Fe',
    auxiliary: 'Ni',
    tertiary: 'Se',
    inferior: 'Ti',
    bestPerformance: '教导与启发',
    characteristics: '富有魅力，善于激励他人',
    othersView: '热情、有说服力',
    growthAreas: '接受批评，关注自身需求',
  },
  {
    code: 'ISTP',
    name: '鉴赏家',
    dominant: 'Ti',
    auxiliary: 'Se',
    tertiary: 'Ni',
    inferior: 'Fe',
    bestPerformance: '实践与操作',
    characteristics: '冷静务实，善于解决问题',
    othersView: '理性、独立',
    growthAreas: '表达情感，长期规划',
  },
  {
    code: 'INTJ',
    name: '建筑师',
    dominant: 'Ni',
    auxiliary: 'Te',
    tertiary: 'Fi',
    inferior: 'Se',
    bestPerformance: '战略规划',
    characteristics: '独立思考，追求完美',
    othersView: '自信、果断',
    growthAreas: '接纳情感，灵活应变',
  },
];

describe('calculateDimensionScores', () => {
  it('should calculate correct dimension scores for ENFJ type', () => {
    const answers: Record<number, 'A' | 'B'> = {
      1: 'A', 2: 'A', 3: 'A', // E (3 points)
      4: 'B', 5: 'B', 6: 'B', // N (3 points)
      7: 'B', 8: 'B', 9: 'B', // F (3 points)
      10: 'A', 11: 'A', 12: 'A', // J (3 points)
    };

    const scores = calculateDimensionScores(answers, testScoringRules);

    expect(scores.E).toBe(3);
    expect(scores.I).toBe(0);
    expect(scores.N).toBe(3);
    expect(scores.S).toBe(0);
    expect(scores.F).toBe(3);
    expect(scores.T).toBe(0);
    expect(scores.J).toBe(3);
    expect(scores.P).toBe(0);
  });

  it('should calculate correct dimension scores for ISTP type', () => {
    const answers: Record<number, 'A' | 'B'> = {
      1: 'B', 2: 'B', 3: 'B', // I (3 points)
      4: 'A', 5: 'A', 6: 'A', // S (3 points)
      7: 'A', 8: 'A', 9: 'A', // T (3 points)
      10: 'B', 11: 'B', 12: 'B', // P (3 points)
    };

    const scores = calculateDimensionScores(answers, testScoringRules);

    expect(scores.I).toBe(3);
    expect(scores.E).toBe(0);
    expect(scores.S).toBe(3);
    expect(scores.N).toBe(0);
    expect(scores.T).toBe(3);
    expect(scores.F).toBe(0);
    expect(scores.P).toBe(3);
    expect(scores.J).toBe(0);
  });

  it('should handle mixed answers correctly', () => {
    const answers: Record<number, 'A' | 'B'> = {
      1: 'A', 2: 'B', 3: 'A', // E: 2, I: 1
      4: 'A', 5: 'B', 6: 'A', // S: 2, N: 1
      7: 'B', 8: 'A', 9: 'B', // T: 1, F: 2
      10: 'A', 11: 'B', 12: 'A', // J: 2, P: 1
    };

    const scores = calculateDimensionScores(answers, testScoringRules);

    expect(scores.E).toBe(2);
    expect(scores.I).toBe(1);
    expect(scores.S).toBe(2);
    expect(scores.N).toBe(1);
    expect(scores.F).toBe(2);
    expect(scores.T).toBe(1);
    expect(scores.J).toBe(2);
    expect(scores.P).toBe(1);
  });

  it('should return zero scores for empty answers', () => {
    const answers: Record<number, 'A' | 'B'> = {};

    const scores = calculateDimensionScores(answers, testScoringRules);

    expect(scores.E).toBe(0);
    expect(scores.I).toBe(0);
    expect(scores.S).toBe(0);
    expect(scores.N).toBe(0);
    expect(scores.T).toBe(0);
    expect(scores.F).toBe(0);
    expect(scores.J).toBe(0);
    expect(scores.P).toBe(0);
  });

  it('should warn and skip questions without scoring rules', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const answers: Record<number, 'A' | 'B'> = {
      1: 'A',
      999: 'A', // Question without a rule
    };

    calculateDimensionScores(answers, testScoringRules);

    expect(consoleSpy).toHaveBeenCalledWith('No scoring rule found for question 999');
    consoleSpy.mockRestore();
  });
});

describe('determinePersonalityType', () => {
  it('should determine ENFJ type from scores', () => {
    const scores = {
      E: 3, I: 0,
      S: 0, N: 3,
      T: 0, F: 3,
      J: 3, P: 0,
    };

    const type = determinePersonalityType(scores);
    expect(type).toBe('ENFJ');
  });

  it('should determine ISTP type from scores', () => {
    const scores = {
      E: 0, I: 3,
      S: 3, N: 0,
      T: 3, F: 0,
      J: 0, P: 3,
    };

    const type = determinePersonalityType(scores);
    expect(type).toBe('ISTP');
  });

  it('should default to first letter on ties (E, S, T, J)', () => {
    const scores = {
      E: 2, I: 2,
      S: 2, N: 2,
      T: 2, F: 2,
      J: 2, P: 2,
    };

    const type = determinePersonalityType(scores);
    expect(type).toBe('ESTJ'); // All ties default to first letter
  });

  it('should handle mixed scores correctly', () => {
    const scores = {
      E: 2, I: 1,
      S: 1, N: 2,
      T: 2, F: 1,
      J: 1, P: 2,
    };

    const type = determinePersonalityType(scores);
    expect(type).toBe('ENTP');
  });
});

describe('calculateResult', () => {
  it('should calculate complete test result for ENFJ', () => {
    const answers: Record<number, 'A' | 'B'> = {
      1: 'A', 2: 'A', 3: 'A',
      4: 'B', 5: 'B', 6: 'B',
      7: 'B', 8: 'B', 9: 'B',
      10: 'A', 11: 'A', 12: 'A',
    };

    const result = calculateResult(answers, testScoringRules, testTypesData);

    expect(result).not.toBeNull();
    expect(result?.type).toBe('ENFJ');
    expect(result?.typeName).toBe('主人公');
    expect(result?.scores.E).toBe(3);
    expect(result?.typeData.code).toBe('ENFJ');
  });

  it('should calculate complete test result for ISTP', () => {
    const answers: Record<number, 'A' | 'B'> = {
      1: 'B', 2: 'B', 3: 'B',
      4: 'A', 5: 'A', 6: 'A',
      7: 'A', 8: 'A', 9: 'A',
      10: 'B', 11: 'B', 12: 'B',
    };

    const result = calculateResult(answers, testScoringRules, testTypesData);

    expect(result).not.toBeNull();
    expect(result?.type).toBe('ISTP');
    expect(result?.typeName).toBe('鉴赏家');
  });

  it('should return null for empty answers', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = calculateResult({}, testScoringRules, testTypesData);

    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });

  it('should return null when type data is not found', () => {
    const answers: Record<number, 'A' | 'B'> = {
      1: 'A', 2: 'A', 3: 'A',
      4: 'A', 5: 'A', 6: 'A', // This creates ESTJ which is not in testTypesData
      7: 'A', 8: 'A', 9: 'A',
      10: 'A', 11: 'A', 12: 'A',
    };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = calculateResult(answers, testScoringRules, testTypesData);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('No type data found for personality type: ESTJ');
    consoleSpy.mockRestore();
  });

  it('should return null for empty scoring rules', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = calculateResult({ 1: 'A' }, [], testTypesData);

    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });

  it('should return null for empty types data', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = calculateResult({ 1: 'A' }, testScoringRules, []);

    expect(result).toBeNull();
    consoleSpy.mockRestore();
  });
});
