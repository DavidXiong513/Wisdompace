'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  getToolDefinition,
  getToolStatusText,
  getToolInfo,
} from '@/lib/tools';
import PersonalityTestCards from '@/components/PersonalityTestCards';
import { RolePieChartCard } from '@/components/RolePieChartCard';
import CareerValuesCard from '@/components/CareerValuesCard';
import AbilityCard from '@/components/AbilityCard';

// ── Error Boundary ─────────────────────────────────────────────────────────

function ToolErrorBoundary({ children, toolId }: { children: ReactNode; toolId: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="rounded-lg border border-red/20 bg-red/5 p-4 text-sm text-red">
        工具加载失败，请刷新页面重试。
      </div>
    );
  }

  return (
    <ErrorCatcher onError={() => setHasError(true)}>
      {children}
    </ErrorCatcher>
  );
}

function ErrorCatcher({ children, onError }: { children: ReactNode; onError: () => void }) {
  return <>{children}</>;
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

  return (
    <ToolErrorBoundary toolId={toolId}>
      {/* Ready tools: render matching card style */}
      {toolId === 'personality-test-cards' && (
        <PersonalityTestCards />
      )}
      {toolId === 'role-pie-chart' && (
        <RolePieChartCard />
      )}
      {toolId === 'career-values-card' && (
        <CareerValuesCard />
      )}
      {toolId === 'ability-card' && (
        <AbilityCard />
      )}
      {/* Developing / Maintenance tools */}
      {(def.status === 'developing' || def.status === 'maintenance') && (
        <PendingCard toolId={toolId} />
      )}
    </ToolErrorBoundary>
  );
}
