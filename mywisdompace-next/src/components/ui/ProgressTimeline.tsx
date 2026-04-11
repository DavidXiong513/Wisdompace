'use client';

/**
 * ProgressTimeline.tsx
 *
 * 一生整理进度时间线组件。
 * 展示用户的阅读进度、测评完成情况、人生里程碑等节点。
 * 数据来源：readingProgressStore + useProgress() hook（TanStack Query）
 */
import { useMemo } from 'react';
import Link from 'next/link';

// ── 类型 ────────────────────────────────────────────────────────────────────

export interface TimelineMilestone {
  id: string;
  category: 'chapter' | 'assessment' | 'milestone' | 'tool';
  title: string;
  description?: string;
  /** ISO 时间戳或 Date string */
  date: string;
  href?: string;
  icon: string;
}

export interface ProgressTimelineProps {
  milestones: TimelineMilestone[];
  /** 空状态提示文字 */
  emptyText?: string;
  className?: string;
}

// ── 常量 ───────────────────────────────────────────────────────────────────

const CATEGORY_STYLES = {
  chapter: {
    color: '#C9A15A',
    bg:    'rgba(201,161,90,0.12)',
    label: '章节阅读',
  },
  assessment: {
    color: '#8B6AA0',
    bg:    'rgba(139,106,160,0.12)',
    label: '测评完成',
  },
  milestone: {
    color: '#5A8E5A',
    bg:    'rgba(90,142,90,0.12)',
    label: '人生里程碑',
  },
  tool: {
    color: '#4A8AB0',
    bg:    'rgba(74,138,176,0.12)',
    label: '工具使用',
  },
} as const;

// ── 工具函数 ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', {
      year:   'numeric',
      month:  'long',
      day:    'numeric',
    });
  } catch {
    return dateStr;
  }
}

function isWithinDays(dateStr: string, days: number): boolean {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    return diff < days * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// ── 组件 ────────────────────────────────────────────────────────────────────

export function ProgressTimeline({
  milestones,
  emptyText = '还没有任何记录，开始你的整理之旅吧',
  className = '',
}: ProgressTimelineProps) {
  const sorted = useMemo(
    () =>
      [...milestones].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [milestones]
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#E8D9C2] bg-[#FAF8F3] py-12 text-center">
        <span className="text-3xl">🌱</span>
        <p className="text-sm text-[#8A7A6A]">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-0 ${className}`}>
      {sorted.map((item, idx) => {
        const style = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.milestone;
        const isNew = isWithinDays(item.date, 7);
        const isLast = idx === sorted.length - 1;

        const content = (
          <div
            className="group flex gap-4 rounded-xl p-3 transition-colors hover:bg-[#F8F2E6]"
          >
            {/* 图标 */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base"
              style={{ backgroundColor: style.bg, color: style.color }}
            >
              {item.icon}
            </div>

            {/* 信息 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: style.bg, color: style.color }}
                >
                  {style.label}
                </span>
                {isNew && (
                  <span className="rounded-full bg-[#C9A15A]/20 px-2 py-0.5 text-[10px] font-medium text-[#8A6A3A]">
                    新
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium leading-snug text-[#3D2B1F]">
                {item.title}
              </p>
              {item.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-[#7A6A52]">
                  {item.description}
                </p>
              )}
              <p className="mt-1 text-xs text-[#A09080]">{formatDate(item.date)}</p>
            </div>

            {/* 箭头指示 */}
            {item.href && (
              <div className="flex shrink-0 items-center text-[#C9A15A] opacity-0 transition-opacity group-hover:opacity-100">
                <span className="text-lg">→</span>
              </div>
            )}
          </div>
        );

        return (
          <div key={item.id} className="relative flex gap-4">
            {/* 垂直连线 */}
            {!isLast && (
              <div
                className="absolute left-[18px] top-10 bottom-0 w-px"
                style={{ backgroundColor: `${style.color}30` }}
              />
            )}

            {/* 左侧留白（对齐图标） */}
            <div className="w-9 shrink-0" />

            {/* 内容 */}
            <div className="min-w-0 flex-1 pb-6">
              {item.href ? (
                <Link href={item.href} className="block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
