/**
 * storage-migration.ts
 *
 * One-time migration from the legacy vanilla-JS localStorage format
 * (key: "mywisdompace") to the new Zustand store keys:
 *   wp-reading-progress  ←  readingProgress
 *   wp-tool-states       ←  toolStates
 *   wp-preferences       ←  userPreferences
 *
 * Runs once on first load; sets "wp-migrated" flag to prevent re-running.
 * All localStorage access is wrapped in try-catch.
 * Raw data is validated via validateStorageData before writing.
 */

import { validateStorageData } from '@/lib/security';

const LEGACY_KEY   = 'mywisdompace';
const MIGRATED_KEY = 'wp-migrated';

// ── New store key names (must match persist({ name }) in each store) ───────
const PROGRESS_KEY    = 'wp-reading-progress';
const TOOL_STATES_KEY = 'wp-tool-states';
const PREFS_KEY       = 'wp-preferences';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Runs the migration if it hasn't been done yet.
 * Safe to call on every app startup — exits immediately if already migrated.
 */
export function migrateFromLegacyStorage(): void {
  if (typeof window === 'undefined') return; // SSR guard

  try {
    if (localStorage.getItem(MIGRATED_KEY) === 'true') return;
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      // No legacy data — mark as migrated and exit
      localStorage.setItem(MIGRATED_KEY, 'true');
      return;
    }

    const parsed: unknown = JSON.parse(raw);
    const { valid, sanitized, errors } = validateStorageData(parsed);

    if (errors.length > 0) {
      console.warn('[migration] Some legacy data was skipped:', errors);
    }

    // Migrate readingProgress → wp-reading-progress
    if (sanitized.readingProgress && Object.keys(sanitized.readingProgress).length > 0) {
      const zustandShape = {
        state: { progress: sanitized.readingProgress },
        version: 0,
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(zustandShape));
    }

    // Migrate userPreferences → wp-preferences
    if (sanitized.userPreferences) {
      const prefs = {
        theme:    sanitized.userPreferences.theme    ?? 'warm',
        fontSize: sanitized.userPreferences.fontSize ?? 'medium',
        language: sanitized.userPreferences.language ?? 'zh-CN',
      };
      const zustandShape = {
        state: { preferences: prefs },
        version: 0,
      };
      localStorage.setItem(PREFS_KEY, JSON.stringify(zustandShape));
    }

    // toolStates: intentionally not migrated (security policy)
    // The wp-tool-states key starts fresh.

    // Mark migration complete
    localStorage.setItem(MIGRATED_KEY, 'true');

    if (valid) {
      console.info('[migration] Legacy data migrated successfully.');
    } else {
      console.info('[migration] Legacy data partially migrated (some entries skipped).');
    }
  } catch (err) {
    // Never crash the app due to migration failure
    console.error('[migration] Failed to migrate legacy storage:', err);
    try {
      localStorage.setItem(MIGRATED_KEY, 'true'); // prevent retry loops
    } catch {
      // localStorage may be unavailable (private browsing, quota exceeded)
    }
  }
}

/**
 * Resets the migration flag — useful for testing only.
 * Do NOT call in production code.
 */
export function _resetMigrationFlag(): void {
  try {
    localStorage.removeItem(MIGRATED_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(TOOL_STATES_KEY);
    localStorage.removeItem(PREFS_KEY);
  } catch {
    // ignore
  }
}
