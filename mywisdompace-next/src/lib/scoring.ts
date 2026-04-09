/**
 * MBTI Scoring Engine
 * 
 * This module implements the scoring logic for the MBTI personality test.
 * It calculates dimension scores from user answers and determines the final personality type.
 */

import type {
  DimensionScores,
  ScoringRule,
  PersonalityTypeData,
  TestResult,
} from '@/types/mbti';

/**
 * Calculate dimension scores from user answers
 * 
 * Maps each answer (A or B) to its corresponding dimension letter (E, I, S, N, T, F, J, P)
 * and counts the total score for each dimension.
 * 
 * @param answers - Record of question IDs to selected answers ('A' or 'B')
 * @param scoringRules - Array of scoring rules mapping options to dimensions
 * @returns DimensionScores object with counts for each of the 8 dimensions
 * 
 * @example
 * const scores = calculateDimensionScores(
 *   { 1: 'A', 2: 'B', 3: 'A' },
 *   scoringRules
 * );
 * // Returns: { E: 2, I: 1, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
 */
export function calculateDimensionScores(
  answers: Record<number, 'A' | 'B'>,
  scoringRules: ScoringRule[]
): DimensionScores {
  // Initialize all dimension scores to 0
  const scores: DimensionScores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  // Iterate through all answered questions
  for (const [questionIdStr, selectedOption] of Object.entries(answers)) {
    const questionId = parseInt(questionIdStr, 10);
    
    // Find the scoring rule for this question
    const rule = scoringRules.find((r) => r.id === questionId);
    
    if (!rule) {
      console.warn(`No scoring rule found for question ${questionId}`);
      continue;
    }

    // Map the selected option to its dimension letter
    const dimensionLetter = selectedOption === 'A' ? rule.optionA : rule.optionB;
    
    // Increment the score for that dimension
    scores[dimensionLetter]++;
  }

  return scores;
}

/**
 * Determine the 4-letter personality type from dimension scores
 * 
 * For each dimension pair (E/I, S/N, T/F, J/P), selects the letter with the higher score.
 * In case of a tie, defaults to the first letter in each pair (E, S, T, J).
 * 
 * @param scores - DimensionScores object with counts for each dimension
 * @returns 4-letter personality type string (e.g., "INTJ", "ESFP")
 * 
 * @example
 * const type = determinePersonalityType({ E: 10, I: 11, S: 12, N: 14, T: 13, F: 11, J: 12, P: 10 });
 * // Returns: "INTJ"
 */
export function determinePersonalityType(scores: DimensionScores): string {
  let type = '';

  // E vs I: Extraversion vs Introversion
  type += scores.E >= scores.I ? 'E' : 'I';

  // S vs N: Sensing vs Intuition
  type += scores.S >= scores.N ? 'S' : 'N';

  // T vs F: Thinking vs Feeling
  type += scores.T >= scores.F ? 'T' : 'F';

  // J vs P: Judging vs Perceiving
  type += scores.J >= scores.P ? 'J' : 'P';

  return type;
}

/**
 * Calculate the complete test result from user answers
 * 
 * This is the main scoring function that orchestrates the entire scoring process:
 * 1. Calculates dimension scores from answers
 * 2. Determines the 4-letter personality type
 * 3. Retrieves the detailed type data
 * 4. Assembles the complete test result
 * 
 * @param answers - Record of question IDs to selected answers ('A' or 'B')
 * @param scoringRules - Array of scoring rules mapping options to dimensions
 * @param typesData - Array of personality type data for all 16 types
 * @returns TestResult object with type, scores, and detailed data, or null if type not found
 * 
 * @throws Will log errors but return null instead of throwing
 * 
 * @example
 * const result = calculateResult(answers, scoringRules, typesData);
 * if (result) {
 *   console.log(`Your type is: ${result.type} (${result.typeName})`);
 * }
 */
export function calculateResult(
  answers: Record<number, 'A' | 'B'>,
  scoringRules: ScoringRule[],
  typesData: PersonalityTypeData[]
): TestResult | null {
  try {
    // Validate inputs
    if (!answers || Object.keys(answers).length === 0) {
      console.error('No answers provided');
      return null;
    }

    if (!scoringRules || scoringRules.length === 0) {
      console.error('No scoring rules provided');
      return null;
    }

    if (!typesData || typesData.length === 0) {
      console.error('No types data provided');
      return null;
    }

    // Step 1: Calculate dimension scores
    const scores = calculateDimensionScores(answers, scoringRules);

    // Step 2: Determine personality type
    const type = determinePersonalityType(scores);

    // Step 3: Find the type data
    const typeData = typesData.find((t) => t.code === type);

    if (!typeData) {
      console.error(`No type data found for personality type: ${type}`);
      return null;
    }

    // Step 4: Assemble the result
    const result: TestResult = {
      type,
      scores,
      typeName: typeData.name,
      typeData,
    };

    return result;
  } catch (error) {
    console.error('Error calculating test result:', error);
    return null;
  }
}
