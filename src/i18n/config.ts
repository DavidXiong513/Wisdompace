'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import en   from './locales/en.json';

/**
 * i18n configuration for Wisdompace.
 * Default language: zh-CN (Simplified Chinese).
 * Supported: zh-CN, zh-TW, en.
 *
 * Language preference is persisted via LanguageDetector reading from
 * localStorage key 'wp-preferences' (set by preferencesStore).
 */
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        'zh-CN': { common: zhCN },
        'zh-TW': { common: zhTW },
        en:      { common: en  },
      },
      defaultNS:  'common',
      fallbackLng: 'zh-CN',
      supportedLngs: ['zh-CN', 'zh-TW', 'en'],

      detection: {
        // Read language from localStorage key 'i18nextLng' (standard key)
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      interpolation: {
        escapeValue: false, // React already escapes values
      },
    });
}

export default i18n;
