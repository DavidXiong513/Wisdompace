'use client';

import { useEffect, useRef } from 'react';
import type { Chapter, ChapterSection } from '@/data/chapters';
import { useReadingProgressStore } from '@/stores/readingProgressStore';
import { ToolContainer } from '@/components/tools/ToolContainer';

// ── Section card ───────────────────────────────────────────────────────────

function SectionCard({ section }: { section: ChapterSection }) {
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
          >
            {para}
          </p>
        ))}
      </div>

      {/* Reflection questions */}
      {section.questions && section.questions.length > 0 && (
        <div
          className="mt-6 rounded-lg p-4"
          style={{
            background: 'var(--wp-bg-alt)',
            border:     '1px solid var(--wp-border)',
          }}
        >
          <p
            className="mb-3 text-sm font-semibold"
            style={{ color: 'var(--wp-ink-muted)', letterSpacing: '0.05em' }}
          >
            思考题
          </p>
          <ul className="space-y-2">
            {section.questions.map((q, i) => (
              <li
                key={i}
                className="text-sm"
                style={{ color: 'var(--wp-ink-light)', lineHeight: 1.7 }}
              >
                {i + 1}. {q}
              </li>
            ))}
          </ul>
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
  const { saveProgress } = useReadingProgressStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionIds = chapter.sections.map((s) => s.id);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            if (id) saveProgress(chapter.slug, id);
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
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}
