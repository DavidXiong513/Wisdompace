/**
 * API route for testing the scoring functions
 * Access at: http://localhost:3000/api/test-scoring
 * 
 * This is a temporary test endpoint to verify the scoring logic works correctly.
 */

import { NextResponse } from 'next/server';
import {
  calculateDimensionScores,
  determinePersonalityType,
  calculateResult,
} from '@/lib/scoring';
import type { ScoringRule, PersonalityTypeData } from '@/types/mbti';

type TestCaseResult = {
  test: string;
  input: unknown;
  output: unknown;
  expected: string;
  passed: boolean;
};

export async function GET() {
  const results: TestCaseResult[] = [];

  // Sample scoring rules (first 10 questions)
  const sampleScoringRules: ScoringRule[] = [
    { id: 1, optionA: 'J', optionB: 'P' },
    { id: 2, optionA: 'P', optionB: 'J' },
    { id: 3, optionA: 'S', optionB: 'N' },
    { id: 4, optionA: 'E', optionB: 'I' },
    { id: 5, optionA: 'N', optionB: 'S' },
    { id: 6, optionA: 'F', optionB: 'T' },
    { id: 7, optionA: 'P', optionB: 'J' },
    { id: 8, optionA: 'E', optionB: 'I' },
    { id: 9, optionA: 'J', optionB: 'P' },
    { id: 10, optionA: 'J', optionB: 'P' },
  ];

  // Sample personality type data
  const sampleTypesData: PersonalityTypeData[] = [
    {
      code: 'INTJ',
      name: '建筑师',
      dominant: 'Nᵢ',
      auxiliary: 'Tₑ',
      tertiary: 'Fᵢ',
      inferior: 'Sₑ',
      bestPerformance: 'INTJ懂得如何洞察事物的底层逻辑...',
      characteristics: 'INTJ以深层洞察与理性逻辑做决定...',
      othersView: 'INTJ冷静、独立，有极强的洞察力...',
      growthAreas: '有时候，生活环境未能支持INTJ...',
    },
  ];

  // Test 1: calculateDimensionScores
  const testAnswers1 = {
    1: 'A' as const,
    2: 'B' as const,
    3: 'A' as const,
    4: 'B' as const,
    5: 'A' as const,
    6: 'B' as const,
    7: 'A' as const,
    8: 'B' as const,
    9: 'A' as const,
    10: 'A' as const,
  };

  const scores1 = calculateDimensionScores(testAnswers1, sampleScoringRules);
  results.push({
    test: 'calculateDimensionScores',
    input: testAnswers1,
    output: scores1,
    expected: 'E=0, I=2, S=1, N=1, T=1, F=0, J=4, P=1',
    passed: scores1.I === 2 && scores1.J === 4 && scores1.P === 1,
  });

  // Test 2: determinePersonalityType
  const testScores2 = {
    E: 5,
    I: 16,
    S: 10,
    N: 16,
    T: 15,
    F: 9,
    J: 14,
    P: 8,
  };

  const type2 = determinePersonalityType(testScores2);
  results.push({
    test: 'determinePersonalityType',
    input: testScores2,
    output: type2,
    expected: 'INTJ',
    passed: type2 === 'INTJ',
  });

  // Test 3: calculateResult
  const testAnswers3 = {
    1: 'B' as const,
    2: 'A' as const,
    3: 'B' as const,
    4: 'B' as const,
    5: 'B' as const,
    6: 'B' as const,
    7: 'B' as const,
    8: 'B' as const,
    9: 'A' as const,
    10: 'A' as const,
  };

  const result3 = calculateResult(testAnswers3, sampleScoringRules, sampleTypesData);
  results.push({
    test: 'calculateResult',
    input: testAnswers3,
    output: result3 ? {
      type: result3.type,
      typeName: result3.typeName,
      scores: result3.scores,
    } : null,
    expected: 'Valid TestResult object',
    passed: result3 !== null && result3.type.length === 4,
  });

  // Test 4: Error handling - empty answers
  const result4 = calculateResult({}, sampleScoringRules, sampleTypesData);
  results.push({
    test: 'Error handling (empty answers)',
    input: {},
    output: result4,
    expected: 'null',
    passed: result4 === null,
  });

  const allPassed = results.every((r) => r.passed);

  return NextResponse.json({
    success: allPassed,
    message: allPassed ? 'All tests passed! ✓' : 'Some tests failed ✗',
    results,
  });
}
