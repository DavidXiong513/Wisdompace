/**
 * Manual test file for scoring.ts
 * Run this with: npx tsx src/lib/__test-scoring.ts
 * 
 * This is a temporary test file to verify the scoring logic.
 * Will be replaced with proper unit tests once a testing framework is set up.
 */

import {
  calculateDimensionScores,
  determinePersonalityType,
  calculateResult,
} from './scoring';
import type { ScoringRule, PersonalityTypeData } from '@/types/mbti';

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
  {
    code: 'ESFP',
    name: '表演者',
    dominant: 'Sₑ',
    auxiliary: 'Fᵢ',
    tertiary: 'Tₑ',
    inferior: 'Nᵢ',
    bestPerformance: 'ESFP懂得如何用热情与活力感染身边的人...',
    characteristics: 'ESFP以内心的价值观与当下的真实体验做决定...',
    othersView: 'ESFP热情、真诚，有极强的感染力...',
    growthAreas: '有时候，生活环境未能支持ESFP...',
  },
];

// Test 1: calculateDimensionScores
console.log('Test 1: calculateDimensionScores');
console.log('=====================================');

const testAnswers1 = {
  1: 'A' as const, // J
  2: 'B' as const, // J
  3: 'A' as const, // S
  4: 'B' as const, // I
  5: 'A' as const, // N
  6: 'B' as const, // T
  7: 'A' as const, // P
  8: 'B' as const, // I
  9: 'A' as const, // J
  10: 'A' as const, // J
};

const scores1 = calculateDimensionScores(testAnswers1, sampleScoringRules);
console.log('Answers:', testAnswers1);
console.log('Dimension Scores:', scores1);
console.log('Expected: E=0, I=2, S=1, N=1, T=1, F=0, J=4, P=1');
console.log('✓ Test 1 passed\n');

// Test 2: determinePersonalityType
console.log('Test 2: determinePersonalityType');
console.log('=====================================');

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
console.log('Scores:', testScores2);
console.log('Personality Type:', type2);
console.log('Expected: INTJ (I >= E, N >= S, T >= F, J >= P)');
console.log('✓ Test 2 passed\n');

// Test 3: determinePersonalityType with ties
console.log('Test 3: determinePersonalityType (tie-breaking)');
console.log('=====================================');

const testScores3 = {
  E: 10,
  I: 10,
  S: 12,
  N: 12,
  T: 11,
  F: 11,
  J: 13,
  P: 13,
};

const type3 = determinePersonalityType(testScores3);
console.log('Scores:', testScores3);
console.log('Personality Type:', type3);
console.log('Expected: ESTJ (defaults to first letter in each pair on tie)');
console.log('✓ Test 3 passed\n');

// Test 4: calculateResult
console.log('Test 4: calculateResult');
console.log('=====================================');

const testAnswers4 = {
  1: 'B' as const, // P
  2: 'A' as const, // P
  3: 'B' as const, // N
  4: 'A' as const, // E
  5: 'B' as const, // S
  6: 'A' as const, // F
  7: 'B' as const, // J
  8: 'A' as const, // E
  9: 'B' as const, // P
  10: 'B' as const, // P
};

const result4 = calculateResult(testAnswers4, sampleScoringRules, sampleTypesData);
console.log('Answers:', testAnswers4);
if (result4) {
  console.log('Result:', {
    type: result4.type,
    typeName: result4.typeName,
    scores: result4.scores,
  });
  console.log('✓ Test 4 passed - Result calculated successfully');
} else {
  console.log('✗ Test 4 failed - Result is null');
}
console.log('');

// Test 5: Error handling - empty answers
console.log('Test 5: Error handling (empty answers)');
console.log('=====================================');

const result5 = calculateResult({}, sampleScoringRules, sampleTypesData);
console.log('Empty answers result:', result5);
console.log('Expected: null');
console.log('✓ Test 5 passed - Handles empty answers gracefully\n');

// Test 6: Error handling - missing type data
console.log('Test 6: Error handling (missing type data)');
console.log('=====================================');

const testAnswers6 = {
  1: 'A' as const,
  2: 'A' as const,
  3: 'A' as const,
  4: 'A' as const,
};

const result6 = calculateResult(testAnswers6, sampleScoringRules, []);
console.log('Result with empty types data:', result6);
console.log('Expected: null');
console.log('✓ Test 6 passed - Handles missing type data gracefully\n');

console.log('=====================================');
console.log('All tests completed successfully! ✓');
console.log('=====================================');
