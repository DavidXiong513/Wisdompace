'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Layout, Button, Drawer, Space, Dropdown } from 'antd';
import {
  BookOutlined,
  SearchOutlined,
  UserOutlined,
  MenuOutlined,
  CloseOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '@/stores/preferencesStore';
import type { Language } from '@/stores/preferencesStore';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { SkipLink } from './SkipLink';
import { CursorGlow } from './CursorGlow';

const { Header, Content, Footer } = Layout;

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const isHome      = pathname === '/';
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t, i18n } = useTranslation('common');
  const { setPreference } = usePreferencesStore();
  const { user, isLoggedIn, logout } = useCurrentUser();

  // Announce route changes to screen readers
  useEffect(() => {
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      announcer.textContent = '';
      // Small delay so the DOM update is picked up by screen readers
      const timer = setTimeout(() => {
        announcer.textContent = document.title || t('nav.siteTitle');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, t]);

  const LANGUAGES: { key: Language; label: string }[] = [
    { key: 'zh-CN', label: t('language.zh-CN') },
    { key: 'zh-TW', label: t('language.zh-TW') },
    { key: 'en',    label: t('language.en') },
  ];

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
    setPreference('language', lang);
  };

  const NAV_ITEMS = [
    { icon: <BookOutlined />,   label: t('nav.chapters'), href: '/#chapters' },
    { icon: <SearchOutlined />, label: t('nav.search'),   href: '/search' },
    { icon: <UserOutlined />,   label: t('nav.progress'), href: '/profile' },
  ];

  return (
    <Layout style={{
      minHeight: '100vh',
      background: 'var(--wp-bg)',
      // 首页锁定高度，防止整体滚动
      ...(isHome ? { height: '100svh', overflow: 'hidden' } : {}),
    }}>
      <SkipLink />

      {/* ── Header ── */}
      {/* 使用原生 header 标签避免 Ant Design Layout.Header 强制覆盖背景色 */}
      <header
        style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          background:     isHome ? 'transparent' : 'var(--wp-bg)',
          backdropFilter: isHome ? 'blur(2px)' : undefined,
          WebkitBackdropFilter: isHome ? 'blur(2px)' : undefined,
          padding:        '0 24px',
          height:         'var(--wp-header-h)',
          flexShrink:     0,
          borderBottom:   isHome ? 'none' : '1px solid var(--wp-border)',
          position:       'sticky',
          top:            0,
          zIndex:         100,
          // 首页：绝对定位叠在背景图上，不占据文档流高度
          ...(isHome ? {
            position:   'absolute' as const,
            left:       0,
            right:      0,
            top:        0,
          } : {}),
        }}
      >
        {/* Left: Logo + Desktop nav */}
        <Space size="large" align="center">
          <Link
            href="/"
            style={{
              fontFamily:     'var(--wp-font-serif)',
              fontSize:       20,
              fontWeight:     600,
              color:          isHome ? 'rgba(255,255,255,0.9)' : 'var(--wp-ink)',
              letterSpacing:  '0.1em',
              textDecoration: 'none',
              whiteSpace:     'nowrap',
            }}
          >
            {t('nav.siteTitle')}
          </Link>

          {/* Desktop nav — hidden on mobile via CSS */}
          <nav className="nav-desktop" aria-label="主导航">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <Button
                  type="text"
                  icon={item.icon}
                  style={{
                    color:      isHome ? 'rgba(255,255,255,0.8)' : 'var(--wp-ink-muted)',
                    fontSize:   13,
                    fontFamily: 'var(--wp-font-serif)',
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </Space>

        {/* Right: Language selector + Auth + Mobile trigger */}
        <Space size="small" align="center">
          {/* Language dropdown — desktop only */}
          <Dropdown
            menu={{
              items: LANGUAGES.map((l) => ({ key: l.key, label: l.label })),
              onClick: ({ key }) => handleLanguageChange(key as Language),
              selectedKeys: [i18n.resolvedLanguage ?? i18n.language],
            }}
          >
            <Button
              type="text"
              icon={<GlobalOutlined />}
              style={{ color: isHome ? 'rgba(255,255,255,0.85)' : 'var(--wp-ink-muted)', fontSize: 13 }}
              className="nav-desktop"
            >
              {t(`language.${i18n.resolvedLanguage ?? i18n.language}`)}
            </Button>
          </Dropdown>

          {/* Auth — desktop */}
          {isLoggedIn && user ? (
            <Dropdown
              className="nav-desktop"
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出登录',
                    onClick: () => { logout(); router.push('/'); },
                  },
                ],
              }}
            >
              <Button
                type="text"
                icon={<UserOutlined />}
                style={{ color: isHome ? 'rgba(255,255,255,0.85)' : 'var(--wp-ink-muted)', fontSize: 13 }}
              >
                <span className="hidden sm:inline">
                  {user.name || user.email?.split('@')[0] || '用户'}
                </span>
              </Button>
            </Dropdown>
          ) : (
            <Link href="/login" className="nav-desktop" style={{ textDecoration: 'none' }}>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                size="small"
                style={{
                  background:    isHome ? 'rgba(255,255,255,0.15)' : 'var(--wp-accent)',
                  borderColor:   isHome ? 'rgba(255,255,255,0.4)'  : 'var(--wp-accent)',
                  color:         '#fff',
                  backdropFilter: isHome ? 'blur(4px)' : undefined,
                  fontSize:      13,
                }}
              >
                登录 / 注册
              </Button>
            </Link>
          )}

          {/* Mobile hamburger */}
          <Button
            className="nav-mobile-trigger"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setDrawerOpen(true)}
            style={{ color: isHome ? 'rgba(255,255,255,0.85)' : 'var(--wp-ink-muted)' }}
            aria-label={t('nav.openMenu')}
            aria-expanded={drawerOpen}
          />
        </Space>
      </header>

      {/* ── Mobile Drawer ── */}
      <Drawer
        title={
          <span style={{ fontFamily: 'var(--wp-font-serif)', color: 'var(--wp-ink)' }}>
            {t('nav.siteTitle')}
          </span>
        }
        placement="left"
        size="80%"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        closeIcon={<CloseOutlined style={{ color: 'var(--wp-ink-muted)' }} />}
        styles={{
          body:   { padding: '16px 0', background: 'var(--wp-bg)' },
          header: { background: 'var(--wp-bg)', borderBottom: '1px solid var(--wp-border)' },
        }}
      >
        <nav aria-label="移动端导航">
          <Space direction="vertical" style={{ width: '100%' }}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <Button
                  type="text"
                  icon={item.icon}
                  block
                  style={{
                    textAlign:  'left',
                    color:      'var(--wp-ink-light)',
                    fontSize:   15,
                    fontFamily: 'var(--wp-font-serif)',
                    height:     48,
                    paddingLeft: 24,
                  }}
                >
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Language selector in drawer */}
            <div style={{ padding: '8px 24px', borderTop: '1px solid var(--wp-border)', marginTop: 8 }}>
              <p style={{ fontSize: 11, color: 'var(--wp-ink-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>
                语言 / Language
              </p>
              <Space wrap>
                {LANGUAGES.map((l) => (
                  <Button
                    key={l.key}
                    size="small"
                    type={i18n.resolvedLanguage === l.key ? 'primary' : 'default'}
                    onClick={() => { handleLanguageChange(l.key); setDrawerOpen(false); }}
                    style={{ fontSize: 12 }}
                  >
                    {l.label}
                  </Button>
                ))}
              </Space>
            </div>

            {/* Auth in drawer */}
            <div style={{ padding: '8px 24px', borderTop: '1px solid var(--wp-border)', marginTop: 4 }}>
              {isLoggedIn && user ? (
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 13, color: 'var(--wp-ink-light)' }}>
                    {user.name || user.email?.split('@')[0] || '用户'}
                  </span>
                  <Button
                    size="small"
                    danger
                    onClick={() => { logout(); router.push('/'); setDrawerOpen(false); }}
                    style={{ fontSize: 12 }}
                  >
                    退出登录
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setDrawerOpen(false)} style={{ textDecoration: 'none' }}>
                  <Button type="primary" block icon={<LoginOutlined />} style={{ fontSize: 13 }}>
                    登录 / 注册
                  </Button>
                </Link>
              )}
            </div>
          </Space>
        </nav>
      </Drawer>

      {/* ── Main content ── */}
      <Content
        id="main-content"
        style={{
          flex:       1,
          background: isHome ? 'transparent' : 'var(--wp-bg)',
          // 首页：填满整个容器（header 已绝对定位，不占文档流）
          height:     isHome ? '100%' : undefined,
          overflow:   isHome ? 'hidden' : undefined,
        }}
      >
        {children}
      </Content>

      {/* ── Footer — 首页不显示 ── */}
      {!isHome && (
        <Footer
          style={{
            textAlign:   'center',
            fontSize:    12,
            fontFamily:  'var(--wp-font-serif)',
            color:       'var(--wp-ink-muted)',
            background:  'var(--wp-bg)',
            borderTop:   '1px solid var(--wp-border)',
            padding:     '16px 24px',
          }}
        >
          {t('footer.copyright')}
        </Footer>
      )}

      {/* Cursor glow — homepage only */}
      {isHome && <CursorGlow />}
    </Layout>
  );
}
