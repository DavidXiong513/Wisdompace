/**
 * user-data.ts
 *
 * Export and import utilities for user data (reading progress, preferences).
 * All imports are validated via validateStorageData before writing to stores.
 * Never throws — always returns { success, errors }.
 */

import { validateStorageData } from '@/lib/security';
import { useReadingProgressStore } from '@/stores/readingProgressStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { Theme, FontSize, Language } from '@/stores/preferencesStore';

// ── Export ─────────────────────────────────────────────────────────────────

/**
 * Serializes all user data to a JSON file and triggers a browser download.
 * Safe to call from any client component.
 */
export function exportUserData(): void {
  if (typeof window === 'undefined') return;

  const progress    = useReadingProgressStore.getState().progress;
  const preferences = usePreferencesStore.getState().preferences;

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    readingProgress: progress,
    userPreferences: preferences,
  };

  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = `wisdompace-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Import ─────────────────────────────────────────────────────────────────

/**
 * Imports user data from a raw unknown value (e.g. parsed JSON from a file).
 * Validates with validateStorageData before writing to stores.
 * Returns { success, errors } — never throws.
 */
export function importUserData(raw: unknown): {
  success: boolean;
  errors: string[];
} {
  const { valid, sanitized, errors } = validateStorageData(raw);

  if (!valid && errors.length > 0 && !sanitized.readingProgress && !sanitized.userPreferences) {
    return { success: false, errors };
  }

  try {
    // Restore reading progress
    if (sanitized.readingProgress) {
      const { saveProgress } = useReadingProgressStore.getState();
      for (const [slug, entry] of Object.entries(sanitized.readingProgress)) {
        saveProgress(slug, entry.sectionId);
      }
    }

    // Restore preferences
    if (sanitized.userPreferences) {
      const { setPreference } = usePreferencesStore.getState();
      const prefs = sanitized.userPreferences;
      if (prefs.theme)    setPreference('theme',    prefs.theme    as Theme);
      if (prefs.fontSize) setPreference('fontSize', prefs.fontSize as FontSize);
      if (prefs.language) setPreference('language', prefs.language as Language);
    }

    return { success: true, errors };
  } catch (err) {
    console.error('[importUserData] Failed to write to stores:', err);
    return { success: false, errors: ['导入时发生内部错误，请重试。'] };
  }
}

/**
 * Reads a File object and calls importUserData with the parsed JSON.
 * Returns { success, errors } — never throws.
 */
export async function importUserDataFromFile(file: File): Promise<{
  success: boolean;
  errors: string[];
}> {
  try {
    const text = await file.text();
    const raw: unknown = JSON.parse(text);
    return importUserData(raw);
  } catch {
    return { success: false, errors: ['文件格式无效，请选择正确的备份文件。'] };
  }
}
