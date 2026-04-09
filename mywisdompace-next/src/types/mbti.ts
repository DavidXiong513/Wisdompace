/**
 * MBTI Personality Test Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the MBTI personality test feature.
 * These types ensure type safety across the test implementation.
 */

/**
 * Question data structure from mbti_93_questions.json
 * Represents a single MBTI test question with two options (A and B)
 */
export interface MBTIQuestion {
  id: number;
  section: 'part1' | 'part2' | 'part3' | 'part4';
  question: string;
  options: {
    A: string;
    B: string;
  };
}

/**
 * Scoring rule structure from mbti_93_scoring_rules.json
 * Maps each question's options to their corresponding dimension letters
 */
export interface ScoringRule {
  id: number;
  optionA: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  optionB: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
}

/**
 * Personality type data structure from mbti_16_types.json
 * Contains detailed information about each of the 16 MBTI personality types
 */
export interface PersonalityTypeData {
  code: string;
  name: string;
  dominant: string;
  auxiliary: string;
  tertiary: string;
  inferior: string;
  bestPerformance: string;
  characteristics: string;
  othersView: string;
  growthAreas: string;
}

/**
 * Test state structure for managing the current test session
 * Used by Zustand store and localStorage persistence
 */
export interface TestState {
  testType: 'mbti' | 'big-five';
  currentPage: number;
  answers: Record<number, 'A' | 'B'>;
  startTime: number;
  lastUpdated: number;
}

/**
 * Dimension scores structure
 * Contains the calculated scores for each of the 8 MBTI dimension letters
 */
export interface DimensionScores {
  E: number;
  I: number;
  S: number;
  N: number;
  T: number;
  F: number;
  J: number;
  P: number;
}

/**
 * Calculated test result structure
 * Contains the final personality type and all associated data
 */
export interface TestResult {
  type: string; // e.g., "INTJ"
  scores: DimensionScores;
  typeName: string; // e.g., "建筑师"
  typeData: PersonalityTypeData;
}

/**
 * LocalStorage state structure
 * Used for persisting test progress across browser sessions
 */
export interface LocalStorageState {
  testType: 'mbti' | 'big-five';
  currentPage: number;
  answers: Record<number, 'A' | 'B'>;
  timestamp: number;
}
