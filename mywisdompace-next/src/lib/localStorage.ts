/**
 * localStorage.ts
 * 
 * LocalStorage utilities for MBTI and Big Five personality test state persistence.
 * Provides save/load/clear functions with comprehensive error handling for:
 * - Quota exceeded errors
 * - Unavailable storage (private browsing, disabled localStorage)
 * - Invalid or corrupted data
 * 
 * Storage keys:
 * - mbti_test_state: MBTI test progress
 * - big_five_test_state: Big Five test progress
 */

import type { TestState, LocalStorageState } from '@/types/mbti';

// ── Constants ──────────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  mbti: 'mbti_test_state',
  'big-five': 'big_five_test_state',
} as const;

const MAX_STATE_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ── Type Guards ────────────────────────────────────────────────────────────

/**
 * Validates that a value is a valid LocalStorageState object
 */
function isValidStorageState(value: unknown): value is LocalStorageState {
  if (!value || typeof value !== 'object') return false;
  
  const state = value as Record<string, unknown>;
  
  // Check required fields
  if (typeof state.testType !== 'string') return false;
  if (state.testType !== 'mbti' && state.testType !== 'big-five') return false;
  if (typeof state.currentPage !== 'number') return false;
  if (typeof state.timestamp !== 'number') return false;
  if (!state.answers || typeof state.answers !== 'object') return false;
  
  // Validate answers structure
  const answers = state.answers as Record<string, unknown>;
  for (const [key, value] of Object.entries(answers)) {
    if (isNaN(Number(key))) return false;
    if (value !== 'A' && value !== 'B') return false;
  }
  
  return true;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Saves test state to localStorage
 * 
 * @param state - The test state to save
 * @returns true if save succeeded, false if it failed
 * 
 * @example
 * const success = saveTestState({
 *   testType: 'mbti',
 *   currentPage: 2,
 *   answers: { 1: 'A', 2: 'B' },
 *   startTime: Date.now(),
 *   lastUpdated: Date.now()
 * });
 */
export function saveTestState(state: TestState): boolean {
  if (typeof window === 'undefined') return false; // SSR guard
  
  try {
    const storageState: LocalStorageState = {
      testType: state.testType,
      currentPage: state.currentPage,
      answers: state.answers,
      timestamp: Date.now(),
    };
    
    const key = STORAGE_KEYS[state.testType];
    const serialized = JSON.stringify(storageState);
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('[localStorage] Quota exceeded - unable to save test state');
      return false;
    }
    
    // Handle other localStorage errors (disabled, unavailable, etc.)
    console.error('[localStorage] Failed to save test state:', error);
    return false;
  }
}

/**
 * Loads test state from localStorage
 * 
 * @param testType - The type of test to load ('mbti' or 'big-five')
 * @returns The saved state if valid and recent, null otherwise
 * 
 * @example
 * const savedState = loadTestState('mbti');
 * if (savedState) {
 *   console.log('Resuming test from page', savedState.currentPage);
 * }
 */
export function loadTestState(testType: 'mbti' | 'big-five'): LocalStorageState | null {
  if (typeof window === 'undefined') return null; // SSR guard
  
  try {
    const key = STORAGE_KEYS[testType];
    const raw = localStorage.getItem(key);
    
    if (!raw) return null;
    
    const parsed: unknown = JSON.parse(raw);
    
    // Validate structure
    if (!isValidStorageState(parsed)) {
      console.warn('[localStorage] Invalid state structure, clearing corrupted data');
      clearTestState(testType);
      return null;
    }
    
    // Check if state is too old
    if (!isStateValid(parsed)) {
      console.info('[localStorage] State expired (>7 days), clearing old data');
      clearTestState(testType);
      return null;
    }
    
    return parsed;
  } catch (error) {
    // Handle JSON parse errors or localStorage access errors
    console.error('[localStorage] Failed to load test state:', error);
    
    // Clear corrupted data
    try {
      clearTestState(testType);
    } catch {
      // Ignore errors during cleanup
    }
    
    return null;
  }
}

/**
 * Clears test state from localStorage
 * 
 * @param testType - The type of test to clear ('mbti' or 'big-five')
 * 
 * @example
 * clearTestState('mbti'); // Clear MBTI test progress
 */
export function clearTestState(testType: 'mbti' | 'big-five'): void {
  if (typeof window === 'undefined') return; // SSR guard
  
  try {
    const key = STORAGE_KEYS[testType];
    localStorage.removeItem(key);
  } catch (error) {
    console.error('[localStorage] Failed to clear test state:', error);
  }
}

/**
 * Validates that a saved state is recent enough to be used
 * 
 * @param state - The state to validate
 * @returns true if state is less than 7 days old, false otherwise
 * 
 * @example
 * const state = loadTestState('mbti');
 * if (state && isStateValid(state)) {
 *   // State is valid and recent
 * }
 */
export function isStateValid(state: LocalStorageState): boolean {
  const age = Date.now() - state.timestamp;
  return age < MAX_STATE_AGE_MS;
}

/**
 * Checks if localStorage is available in the current environment
 * 
 * @returns true if localStorage is available and writable, false otherwise
 * 
 * @example
 * if (isLocalStorageAvailable()) {
 *   saveTestState(state);
 * } else {
 *   console.warn('localStorage not available, state will not persist');
 * }
 */
export function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
