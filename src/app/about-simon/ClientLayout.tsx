'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  /** about-simon 子站导航项（使用翻译 key） */
  const NAV_ITEMS = [
    { labelKey: 'about.navWho', href: '/about-simon' },
    { labelKey: 'about.navPhilosophy', href: '/about-simon/philosophy' },
    { labelKey: 'about.navServices', href: '/about-simon/services' },
    { labelKey: 'about.navContent', href: '/about-simon/content' },
    { labelKey: 'about.navConnect', href: '/about-simon/connect' },
  ];

  return (
    <div className="min-h-screen bg-[var(--as-bg-primary)] font-[var(--as-font-sans)]">
      {/* ... (keep existing header and main) ... */}
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--as-gray-100)] bg-[var(--as-bg-primary)]/90 backdrop-blur-md">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo / 返回主站 */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              scroll={false}
              className="text-sm text-[var(--as-gray-500)] transition-colors hover:text-[var(--as-primary-600)]"
            >
              {t('about.backToMain')}
            </Link>
            <span className="text-[var(--as-gray-300)]">|</span>
            <Link
              href="/about-simon"
              scroll={false}
              className="font-serif text-base font-bold text-[var(--as-primary-700)]"
            >
              {t('about.siteName')}
            </Link>
          </div>

          {/* 导航链接 */}
          <div className="flex items-center gap-4">
            <ul className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      scroll={false}
                      className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? 'bg-[var(--as-primary-50)] font-semibold text-[var(--as-primary-700)]'
                          : 'text-[var(--as-gray-600)] hover:bg-[var(--as-primary-50)] hover:text-[var(--as-primary-700)]'
                      }`}
                    >
                      {t(item.labelKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* 语言切换 */}
            <LanguageSwitcher className="hidden text-[var(--as-gray-500)] sm:flex" />

            {/* 移动端菜单按钮 */}
            <MobileMenuButton pathname={pathname} />
          </div>
        </nav>
      </header>

      {/* ── 内容区域 ── */}
      <main className="pt-14">{children}</main>

      {/* ── 底部签名 ── */}
      <footer className="border-t border-[var(--as-gray-100)] bg-[var(--as-bg-secondary)]">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center sm:px-6">
          <p className="font-serif text-lg text-[var(--as-primary-600)]">
            {t('about.footerQuote')}
          </p>
          <p className="mt-2 text-sm text-[var(--as-gray-400)]">
            {t('about.footerCredit', { year: currentYear || '...' })}
          </p>
        </div>
      </footer>
    </div>
  );
}

/** 移动端汉堡菜单 */
function MobileMenuButton({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  /** about-simon 子站导航项（使用翻译 key） */
  const NAV_ITEMS = [
    { labelKey: 'about.navWho', href: '/about-simon' },
    { labelKey: 'about.navPhilosophy', href: '/about-simon/philosophy' },
    { labelKey: 'about.navServices', href: '/about-simon/services' },
    { labelKey: 'about.navContent', href: '/about-simon/content' },
    { labelKey: 'about.navConnect', href: '/about-simon/connect' },
  ];

  // 点击外部关闭菜单
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-mobile-menu]')) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  // 路由变化时关闭菜单（异步避免级联渲染警告）
  useEffect(() => {
    const timer = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="relative sm:hidden" data-mobile-menu>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--as-gray-600)] transition-colors hover:bg-[var(--as-primary-50)]"
        aria-label={t('about.mobileMenu')}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 rounded-lg border border-[var(--as-gray-100)] bg-white py-2 shadow-lg">
          <div className="border-b border-[var(--as-gray-100)] px-4 py-2">
            <LanguageSwitcher variant="full" className="text-[var(--as-gray-600)]" />
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--as-primary-50)] font-semibold text-[var(--as-primary-700)]'
                    : 'text-[var(--as-gray-700)] hover:bg-[var(--as-primary-50)] hover:text-[var(--as-primary-700)]'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
