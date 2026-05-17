'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const NavBar = () => {
  const { user, isLoggedIn, logout } = useCurrentUser();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 p-4 sm:p-6">
      <nav className="mx-auto flex max-w-7xl items-center justify-between overflow-hidden">
        <div>
          {/* Placeholder for logo or site title if needed in the future */}
          <Link href="/" className="text-lg font-bold text-white">
            {t('nav.siteTitle')}
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* 极简型语言切换 A方案: 中 | EN */}
          <div className="flex items-center text-xs font-medium text-[#F8EBD5]/60">
            <button
              onClick={() => changeLanguage('zh-CN')}
              className={`transition-colors hover:text-[#F8EBD5] ${
                currentLanguage.startsWith('zh') ? 'font-bold text-[#F8EBD5]' : ''
              }`}
            >
              中
            </button>
            <span className="mx-1.5 opacity-30">|</span>
            <button
              onClick={() => changeLanguage('en')}
              className={`transition-colors hover:text-[#F8EBD5] ${
                currentLanguage.startsWith('en') ? 'font-bold text-[#F8EBD5]' : ''
              }`}
            >
              EN
            </button>
          </div>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              {/* 用户信息展示 */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7A96A]/20 text-sm font-medium text-[#F8EBD5]">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="hidden text-sm font-medium text-[#F8EBD5] sm:inline">
                  {user.name || user.email?.split('@')[0] || t('nav.visitor')}
                </span>
              </div>

              {/* 退出按钮 */}
              <button
                onClick={() => {
                  logout();
                  // 当前为内存模拟，未来接入真实后端时会清除服务端 session + Cookie
                }}
                className="focus-visible:ring-opacity-75 rounded-md border border-[#E8D9C2] px-3 py-1.5 text-xs font-medium text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="focus-visible:ring-opacity-75 rounded-md border border-[#E8D9C2] px-4 py-2 text-sm font-semibold text-[#F8EBD5] transition duration-300 hover:bg-[#F6E9D2] hover:text-[#3D2B1F] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {t('nav.login')}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
