'use client';

import { useEffect, useRef } from 'react';
import type { Chapter, ChapterSection } from '@/data/chapters';
import { ToolContainer } from '@/components/tools/ToolContainer';
import { ReflectionAnswerBox } from './ReflectionAnswerBox';
import { useReflectionAnswers } from '@/hooks/useReflectionAnswers';
import { useChapterReadingProgress } from '@/hooks/useChapterReadingProgress';

// ── Section card ───────────────────────────────────────────────────────────

function SectionCard({ chapterSlug, section }: { chapterSlug: string; section: ChapterSection }) {
  const { answers, saveAnswer, statuses } = useReflectionAnswers(
    chapterSlug,
    section.id,
    section.questions?.length ?? 0
  );

  return (
    <div
      id={section.id}
      className="scroll-mt-[120px]"
      style={{ paddingBottom: '2.5rem' }}
    >
      <h2
        className="mb-4 text-2xl font-semibold"
        style={{
          fontFamily: 'var(--wp-font-serif)',
          color:      'var(--wp-ink)',
          borderLeft: '3px solid var(--wp-accent)',
          paddingLeft: '0.75rem',
        }}
      >
        {section.title}
      </h2>

      <div className="space-y-4">
        {section.paragraphs.map((para, i) => (
          <p
            key={i}
            style={{
              color:      'var(--wp-ink-light)',
              lineHeight: 1.9,
              fontSize:   '1.05rem',
              textAlign:  'justify',
              fontFamily: 'var(--wp-font-sans)',
            }}
            dangerouslySetInnerHTML={{ __html: para }}
          />
        ))}
      </div>

      {/* Reflection questions — 思考题模块 */}
      {section.questions && section.questions.length > 0 && (
        <div
          className="relative mt-10 overflow-hidden rounded-2xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #FDF8F0 0%, #F5EDE0 100%)',
            border: '1px solid #E8D9C2',
            boxShadow: '0 4px 20px rgba(200, 150, 80, 0.08)',
          }}
        >
          {/* 左上装饰角标 */}
          <div
            className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, #C9A15A 0%, transparent 70%)' }}
          />
          {/* 右上装饰角标 */}
          <div
            className="pointer-events-none absolute -right-4 -top-4 h-12 w-12 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #C9A15A 0%, transparent 70%)' }}
          />

          {/* 标题区 */}
          <div className="relative mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: '#C9A15A' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </span>
            <h3
              className="font-serif text-lg font-bold tracking-wide"
              style={{ color: '#6B4226' }}
            >
              思考题
            </h3>
            <div className="flex-1" />
            <span
              className="hidden rounded-full px-3 py-0.5 text-[11px] font-medium tracking-wider sm:inline-block"
              style={{ background: '#E8D9C2', color: '#8B6F4A' }}
            >
              不必一次答完 · 诚实即好
            </span>
          </div>

          {/* 题目列表 + 回答框 */}
          <ul className="relative space-y-4">
            {section.questions.map((q, i) => (
              <li
                key={i}
                className="rounded-xl bg-white/70 px-4 py-3 transition-colors hover:bg-white/90"
                style={{
                  color: '#4A3728',
                  border: '1px solid #F0E6D6',
                }}
              >
                {/* 题目文字 */}
                <div className="flex items-start gap-3 text-sm leading-relaxed">
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ background: '#C9A15A' }}
                  >
                    {i + 1}
                  </span>
                  <span className="pt-0.5" style={{ lineHeight: 1.8 }}>
                    {q}
                  </span>
                </div>

                {/* 回答框 */}
                <div className="pl-9">
                  <ReflectionAnswerBox
                    questionIndex={i}
                    initialValue={answers[i]}
                    onSave={saveAnswer}
                    status={statuses[i]}
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* 底部提示 */}
          <p
            className="relative mt-4 text-center text-xs italic"
            style={{ color: '#A8927A' }}
          >
            💭 这些问题没有标准答案，只有属于你的答案
          </p>
        </div>
      )}

      {/* Interactive tool */}
      {section.toolId && (
        <div className="mt-6">
          <ToolContainer toolId={section.toolId} />
        </div>
      )}
    </div>
  );
}

// ── ChapterReader ──────────────────────────────────────────────────────────

interface ChapterReaderProps {
  chapter: Chapter;
}

/**
 * ChapterReader
 * Renders all sections of a chapter and wires IntersectionObserver
 * to automatically save reading progress via readingProgressStore.
 */
export function ChapterReader({ chapter }: ChapterReaderProps) {
  const { saveProgress } = useChapterReadingProgress(chapter.slug);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionIds = chapter.sections.map((s) => s.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id) saveProgress(id);
          }
        }
      },
      { threshold: 0.5 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapter.slug, chapter.sections, saveProgress]);

  return (
    <div ref={containerRef} className="space-y-2">
      {chapter.sections.map((section) => (
        <SectionCard key={section.id} chapterSlug={chapter.slug} section={section} />
      ))}
    </div>
  );
}
