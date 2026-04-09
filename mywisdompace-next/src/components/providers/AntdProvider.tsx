'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { I18nextProvider } from 'react-i18next';
import zhCN from 'antd/locale/zh_CN';
import zhTW from 'antd/locale/zh_TW';
import enUS from 'antd/locale/en_US';
import i18n from '@/i18n/config';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { Locale } from 'antd/es/locale';

const ANTD_LOCALES: Record<string, Locale> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en:      enUS,
};

/**
 * AntdProvider
 * Wraps the app with:
 * - I18nextProvider (react-i18next)
 * - Ant Design ConfigProvider with Wisdompace theme tokens
 * Locale is driven by preferencesStore so language changes are reactive.
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  const language  = usePreferencesStore((s) => s.preferences.language);
  const antdLocale = ANTD_LOCALES[language] ?? zhCN;

  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider
        locale={antdLocale}
        theme={{
          token: {
            colorPrimary:  '#8b2500',
            colorBgBase:   '#f8f5ef',
            colorTextBase: '#2b2318',
            colorBorder:   '#d9d0c1',
            colorLink:     '#8b2500',
            fontFamily:    '"Noto Serif SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", serif',
            fontSize:       15,
            borderRadius:   6,
            borderRadiusLG: 8,
            borderRadiusSM: 4,
            motionDurationMid: '0.2s',
          },
          components: {
            Button: { fontWeight: 400, primaryColor: '#ffffff' },
            Drawer: { colorBgElevated: '#f8f5ef' },
            Layout: { headerBg: '#f8f5ef', bodyBg: '#f8f5ef', footerBg: '#f8f5ef' },
            Menu: {
              itemColor:         '#9a8e7a',
              itemHoverColor:    '#2b2318',
              itemSelectedColor: '#8b2500',
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </I18nextProvider>
  );
}
