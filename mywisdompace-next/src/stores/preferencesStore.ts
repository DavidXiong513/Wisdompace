import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_PREFERENCES_WHITELIST } from '@/config/security.config';

// ── Types ──────────────────────────────────────────────────────────────────

export type Theme    = 'warm' | 'dark' | 'light';
export type FontSize = 'small' | 'medium' | 'large';
export type Language = 'zh-CN' | 'zh-TW' | 'en';

export interface Preferences {
  theme:    Theme;
  fontSize: FontSize;
  language: Language;
}

interface PreferencesState {
  preferences: Preferences;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  resetPreferences: () => void;
}

// ── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_PREFERENCES: Preferences = {
  theme:    'warm',
  fontSize: 'medium',
  language: 'zh-CN',
};

// ── Store ──────────────────────────────────────────────────────────────────

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,

      setPreference: (key, value) => {
        // Whitelist validation before writing
        const whitelist = USER_PREFERENCES_WHITELIST;
        const allowed: Record<keyof Preferences, readonly string[]> = {
          theme:    whitelist.themes    as string[],
          fontSize: whitelist.fontSizes as string[],
          language: whitelist.languages as string[],
        };

        if (!allowed[key].includes(value as string)) {
          console.error(`preferencesStore: invalid value "${value}" for key "${key}"`);
          return;
        }

        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        }));
      },

      resetPreferences: () => set({ preferences: DEFAULT_PREFERENCES }),
    }),
    { name: 'wp-preferences' }
  )
);
