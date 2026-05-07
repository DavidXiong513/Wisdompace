'use client';

import React, { type ReactNode } from 'react';
import {
  getToolDefinition,
  getToolStatusText,
  getToolInfo,
} from '@/lib/tools';
import PersonalityTestCards from '@/components/PersonalityTestCards';
import { RolePieChartCard } from '@/components/RolePieChartCard';
import CareerValuesCard from '@/components/CareerValuesCard';
import AbilityCard from '@/components/AbilityCard';
import { ToolPlaceholder } from '@/components/ToolPlaceholder';

// ── Error Boundary ─────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ToolErrorBoundary extends React.Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Tool error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-semibold text-red-800">工具加载失败</h3>
              <p className="text-sm text-red-600">请刷新页面重试，或联系管理员</p>
            </div>
          </div>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Pending Card (developing / maintenance) ───────────────────────────────

function PendingCard({ toolId }: { toolId: string }) {
  const info = getToolInfo(toolId);
  const statusText = info ? getToolStatusText(info.status) : '开发中';

  return (
    <div className="mt-8 rounded-xl border border-black/8 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F0E8] text-xl">
          🚧
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#2F2A24]">
            {info?.name ?? toolId}
          </h3>
          <p className="text-sm text-[#8A7E6A]">{statusText}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[#6A6256]">
        {info?.description}
      </p>
    </div>
  );
}

// ── ToolContainer ─────────────────────────────────────────────────────────

interface ToolContainerProps {
  toolId: string;
}

/**
 * ToolContainer
 * Renders tools embedded in chapter pages.
 * - personality-test-cards → MBTI + Big Five cards (ready)
 * - role-pie-chart → role pie chart entry card (ready)
 * - developing/maintenance → placeholder card
 */
export function ToolContainer({ toolId }: ToolContainerProps) {
  const def = getToolDefinition(toolId);

  // Unknown tool
  if (!def) {
    return (
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-400">未知工具：{toolId}</p>
      </div>
    );
  }

  // 特殊处理：使用统一占位逻辑的工具
  const usePlaceholder = [
    'life-clock',
    'preparedness-slider',
    'framework-grid',
    'reminder-list',
    'three-questions-tool',
    'emotional-assessment',
    'choice-rights',
    'dementia-prevention-entry',
    'hobby-radar',
    'responsibility-list',
    'ta-worth-trust',
    'no-regrets',
    'goodbye-list',
    'farewell-style',
  ].includes(toolId);

  return (
    <ToolErrorBoundary>
      {/* 优先使用重构后的 ToolPlaceholder */}
      {usePlaceholder ? (
        <ToolPlaceholder toolId={toolId} />
      ) : (
        <>
          {/* 兼容旧有硬编码逻辑 */}
          {toolId === 'personality-test-cards' && <PersonalityTestCards />}
          {toolId === 'role-pie-chart' && <RolePieChartCard />}
          {toolId === 'career-values-card' && <CareerValuesCard />}
          {toolId === 'ability-card' && <AbilityCard />}
        </>
      )}

      {/* Developing / Maintenance tools (if not handled by placeholder) */}
      {!usePlaceholder && (def.status === 'developing' || def.status === 'maintenance') && (
        <PendingCard toolId={toolId} />
      )}
    </ToolErrorBoundary>
  );
}
