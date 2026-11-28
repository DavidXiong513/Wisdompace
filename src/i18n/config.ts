'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCN from './locales/zh-CN.json';
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

/**
 * i18n configuration for Wisdompace.
 * Default language: zh-CN (Simplified Chinese).
 * Supported: zh-CN, zh-TW, en.
 *
 * Language preference is persisted via LanguageDetector reading from
 * localStorage key 'i18nextLng' (set by LanguageSwitcher / NavBar).
 *
 * ── 服务端 / 客户端分离（性能关键）────────────────────────────
 * Node 18+ 存在全局 navigator 对象，Vercel 容器 locale 为 en-US，
 * 若让 LanguageDetector 在服务端运行，SSR 会探测成英文并输出英文 HTML；
 * 客户端 hydration 后才切回中文，表现为「刷新先闪一下英文」，
 * 并且整棵组件树要重算两次（二次渲染 + hydration mismatch）。
 *
 * 因此：服务端固定 zh-CN，仅客户端启用探测器。
 * 中文用户（绝大多数）SSR 与首帧完全一致，无闪烁、无重复渲染。
 *
 * initImmediate: false —— 三套语言资源已静态打包，无需异步加载，
 * 同步完成初始化可避免「首次渲染时翻译键缺失」的空窗期。
 */
const isServer = typeof window === 'undefined';

if (!i18n.isInitialized) {
  if (!isServer) {
    i18n.use(LanguageDetector);
  }

  i18n.use(initReactI18next).init({
    resources: {
      'zh-CN': { common: zhCN },
      'zh-TW': { common: zhTW },
      en: { common: en },
    },
    // 服务端固定中文；客户端交给 LanguageDetector 探测
    lng: isServer ? 'zh-CN' : undefined,
    defaultNS: 'common',
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'zh-TW', 'en'],

    // 资源是本地静态 JSON，同步初始化，首次渲染即有翻译
    // （i18next v25+ 将该选项由 initImmediate 更名为 initAsync）
    initAsync: false,

    detection: isServer
      ? undefined
      : {
          order: ['localStorage', 'navigator'],
          caches: ['localStorage'],
          lookupLocalStorage: 'i18nextLng',
        },

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    react: {
      // App Router 下避免 Suspense 导致的空白首帧
      useSuspense: false,
    },
  });
}

export default i18n;
