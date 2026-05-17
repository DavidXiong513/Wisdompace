'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'minimal' | 'full';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'minimal',
}) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language || 'zh-CN';

  if (variant === 'full') {
    return (
      <div className={`flex items-center text-xs font-medium ${className}`}>
        <button
          onClick={() => changeLanguage('zh-CN')}
          className={`transition-colors hover:opacity-100 ${
            currentLanguage.startsWith('zh') ? 'font-bold opacity-100' : 'opacity-60'
          }`}
        >
          简体中文
        </button>
        <span className="mx-3 opacity-30">|</span>
        <button
          onClick={() => changeLanguage('en')}
          className={`transition-colors hover:opacity-100 ${
            currentLanguage.startsWith('en') ? 'font-bold opacity-100' : 'opacity-60'
          }`}
        >
          English
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-xs font-medium ${className}`}>
      <button
        onClick={() => changeLanguage('zh-CN')}
        className={`transition-colors hover:opacity-100 ${
          currentLanguage.startsWith('zh') ? 'font-bold opacity-100' : 'opacity-60'
        }`}
      >
        中
      </button>
      <span className="mx-1.5 opacity-30">|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`transition-colors hover:opacity-100 ${
          currentLanguage.startsWith('en') ? 'font-bold opacity-100' : 'opacity-60'
        }`}
      >
        EN
      </button>
    </div>
  );
};
