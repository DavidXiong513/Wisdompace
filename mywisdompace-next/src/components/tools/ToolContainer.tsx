'use client';

import React, { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getToolDefinition, getToolStatusText, type ToolStatus } from '@/lib/tools';
import { useToolStateStore } from '@/stores/toolStateStore';

// ── Error Boundary ─────────────────────────────────────────────────────────

interface ErrorBoundaryState { hasError: boolean }

class ToolErrorBoundary extends Component<
  { children: ReactNode; toolId: string },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; toolId: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="rounded-lg p-4 text-sm"
          style={{
            background: 'var(--wp-bg-alt)',
            border:     '1px solid var(--wp-border)',
            color:      'var(--wp-ink-muted)',
          }}
        >
          工具加载失败，请刷新页面重试。
        </div>
      );
    }
    return this.props.children;
  }}

// ── Status badge ───────────────────────────────────────────────────────────

const STATUS_STYLES: Record<ToolStatus, { bg: string; color: string }> = {
  developing:  { bg: 'rgba(176,141,87,0.12)', color: 'var(--wp-gold)' },
  ready:       { bg: 'rgba(82,196,26,0.10)',  color: '#52c41a' },
  maintenance: { bg: 'rgba(154,142,122,0.12)', color: 'var(--wp-ink-muted)' },
};

function StatusBadge({ status, label }: { status: ToolStatus; label: string }) {
  const style = STATUS_STYLES[status];
  return (
    <div
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.color}30` }}
    >
      <span
        style={{
          width: 6, height: 6, borderRadius: '50%',
          background: style.color, display: 'inline-block',
        }}
      />
      {label} · {getToolStatusText(status)}
    </div>
  );
}

// ── ToolContainer ──────────────────────────────────────────────────────────

interface ToolContainerProps {
  toolId: string;
}

/**
 * ToolContainer
 * Looks up the tool in TOOL_REGISTRY and renders:
 * - A status badge if status is 'developing' or 'maintenance'
 * - The actual tool component if status is 'ready'
 * Wrapped in an error boundary so a broken tool never crashes the page.
 */
export function ToolContainer({ toolId }: ToolContainerProps) {
  const def = getToolDefinition(toolId);
  const { getToolState, saveToolState } = useToolStateStore();
  const { t } = useTranslation('common');

  if (!def) {
    return (
      <div
        className="rounded-lg p-3 text-xs"
        style={{ color: 'var(--wp-ink-muted)', background: 'var(--wp-bg-alt)' }}
      >
        {t('tool.unknown')}：{toolId}
      </div>
    );
  }

  return (
    <ToolErrorBoundary toolId={toolId}>
      <div
        className="rounded-xl p-4"
        style={{
          background: 'var(--wp-card-bg)',
          border:     '1px solid var(--wp-border)',
        }}
      >
        {/* Tool header */}
        <div className="mb-3 flex items-center justify-between">
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: 'var(--wp-font-serif)', color: 'var(--wp-ink)' }}
          >
            {def.label}
          </span>
          <StatusBadge status={def.status} label={def.label ?? def.name} />
        </div>

        {/* Description */}
        <p className="mb-3 text-xs" style={{ color: 'var(--wp-ink-muted)', lineHeight: 1.6 }}>
          {def.description}
        </p>

        {/* Tool component or placeholder */}
        {def.status === 'ready' && def.component ? (
          <def.component
            toolId={toolId}
            initialData={getToolState(toolId)?.data}
            onSave={(data) => saveToolState(toolId, data)}
          />
        ) : (
          <div
            className="rounded-md py-6 text-center text-xs"
            style={{ background: 'var(--wp-bg-alt)', color: 'var(--wp-ink-muted)' }}
          >
            {def.status === 'maintenance' ? t('tool.underMaintenance') : t('tool.comingSoon')}
          </div>
        )}
      </div>
    </ToolErrorBoundary>
  );
}
