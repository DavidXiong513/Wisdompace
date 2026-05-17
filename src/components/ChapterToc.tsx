'use no memo';
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ChapterSection } from '@/data/chapters';
import { useReadingProgressStore } from '@/stores/readingProgressStore';

type TocVariant = 'bar' | 'sidebar';

/**
 * 顶部导航栏 + prev/next bar 的总高度约 110–120px。
 * rootMargin 顶部留出 -120px 排除遮挡区，底部 -25% 避免选中刚露出一点的 section，
 * 只检测内容区中部的 section，高亮更精确。
 */
const ROOT_MARGIN = '-120px 0px -25% 0px';

export function ChapterToc({
  chapterSlug,
  sections,
  variant = 'bar',
}: {
  chapterSlug: string;
  sections: ChapterSection[];
  variant?: TocVariant;
}) {
  const ids = useMemo(() => sections.map(s => s.id), [sections]);
  const [activeId, setActiveId] = useState(ids[0] ?? '');
  const { getProgress, saveProgress } = useReadingProgressStore();
  const { t, i18n } = useTranslation();
  const isChinese = (i18n.language || 'zh-CN').startsWith('zh');

  const getSectionTitle = (section: ChapterSection) => {
    if (isChinese) return section.title;
    // Try structured format first: chapterContent.{slug}.{id}.title
    const structuredKey = `chapterContent.${chapterSlug}.${section.id}.title`;
    const structured = t(structuredKey);
    if (structured !== structuredKey) return structured;
    // Fall back to flat format: chapterContent.{slug}.{id}
    const flatKey = `chapterContent.${chapterSlug}.${section.id}`;
    const flat = t(flatKey);
    if (flat !== flatKey) return flat;
    return section.title;
  };

  /* 记录是否正在执行点击触发的滚动，滚动期间暂停 IntersectionObserver 更新 activeId */
  const isClickScrolling = useRef(false);
  const clickScrollTimer = useRef<number | null>(null);

  const handleClick = useCallback((id: string) => {
    // 1. 立即高亮点击项，不再等 Observer
    setActiveId(id);

    // 2. 标记"正在点击滚动"，暂停 Observer 更新
    isClickScrolling.current = true;
    if (clickScrollTimer.current) {
      window.clearTimeout(clickScrollTimer.current);
    }

    // 3. 执行滚动
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 4. 滚动动画约 500–800ms，结束后恢复 Observer
    clickScrollTimer.current = window.setTimeout(() => {
      isClickScrolling.current = false;
    }, 900);
  }, []);

  useEffect(() => {
    const last = getProgress(chapterSlug);
    if (!last?.sectionId) return;
    const el = document.getElementById(last.sectionId);
    if (!el) return;
    // 恢复阅读进度时也要设 activeId
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 初始化：从阅读进度存储恢复状态
    setActiveId(last.sectionId);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [chapterSlug, getProgress]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // 点击滚动期间，忽略 Observer 更新，避免高亮跳动
        if (isClickScrolling.current) return;

        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

        const first = visible[0];
        const id = first?.target?.id;
        if (!id) return;
        setActiveId(id);
        saveProgress(chapterSlug, id);
      },
      { threshold: [0.35, 0.5, 0.75], rootMargin: ROOT_MARGIN }
    );

    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapterSlug, ids, saveProgress]);

  if (variant === 'sidebar') {
    return (
      <aside
        className="sticky top-[180px] rounded-2xl p-4 text-center"
        style={{
          border: '1px solid var(--wp-border)',
          background: 'var(--wp-card-bg)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-base font-bold tracking-[0.2em] uppercase"
          style={{ color: 'var(--wp-ink-light)' }}
        >
          {isChinese ? '目录导航' : t('chapter.tableOfContents')}
        </div>
        <ul className="mt-4 space-y-3 font-semibold">
          {sections.map(s => {
            const active = s.id === activeId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => handleClick(s.id)}
                  className="w-full rounded-lg px-2 py-3 text-base transition"
                  style={{
                    background: active ? 'var(--wp-bg-alt)' : 'transparent',
                    color: active ? 'var(--wp-accent)' : 'var(--wp-ink-muted)',
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {getSectionTitle(s)}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    );
  }

  return (
    <div className="border-border bg-background/70 sticky top-[64px] z-20 -mx-5 border-y px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <div className="flex items-center gap-2 overflow-auto">
        {sections.map(s => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleClick(s.id)}
              className={
                'rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition ' +
                (active
                  ? 'border-cyberBlue/60 bg-surface text-foreground shadow-[var(--shadow-card)]'
                  : 'border-border bg-surface/70 text-muted hover:text-foreground')
              }
            >
              {getSectionTitle(s)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
