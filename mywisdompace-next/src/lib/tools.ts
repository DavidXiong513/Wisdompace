import React from 'react';

export type ToolStatus = "developing" | "ready" | "maintenance";

export type ToolInfo = {
  id: string;
  name: string;
  label?: string; // alias for name, used by ToolContainer
  status: ToolStatus;
  description: string;
  component?: React.ComponentType<{ toolId: string; initialData: unknown; onSave: (data: unknown) => void }> | null;
};

// 参考旧站 tools-placeholder.js 的定义（不引入 emoji，保持克制）。
export const tools: Record<string, ToolInfo> = {
  "role-pie-chart": {
    id: "role-pie-chart",
    name: "人生角色饼图",
    status: "developing",
    description: "帮助你梳理生活中的各种角色分配",
  },
  "identity-portrait": {
    id: "identity-portrait",
    name: "身份画像",
    status: "developing",
    description: "绘制你的身份画像，深入了解自己",
  },
  "tag-selector": {
    id: "tag-selector",
    name: "标签选择器",
    status: "developing",
    description: "选择并管理你的身份标签",
  },
  "role-stripper": {
    id: "role-stripper",
    name: "角色剥离器",
    status: "developing",
    description: "剥离社会角色，看见真实的自己",
  },
  "life-finder": {
    id: "life-finder",
    name: "生活趣味发现器",
    status: "developing",
    description: "发现生活中的趣味与意义",
  },
  "choice-maker": {
    id: "choice-maker",
    name: "主动选择练习",
    status: "developing",
    description: "练习主动选择，而非被动接受",
  },
  "responsibility-list": {
    id: "responsibility-list",
    name: "责任清单",
    status: "developing",
    description: "整理你的责任与承诺",
  },
  "choice-rights": {
    id: "choice-rights",
    name: "选择权思考",
    status: "developing",
    description: "思考你的选择权与安排",
  },
  "goodbye-list": {
    id: "goodbye-list",
    name: "告别清单",
    status: "developing",
    description: "准备你的告别清单",
  },
};

export function getToolInfo(toolId: string): ToolInfo | null {
  return tools[toolId] ?? null;
}

/**
 * Get tool definition for ToolContainer compatibility.
 * Maps ToolInfo fields to the shape expected by ToolContainer (label, component, etc.)
 */
export function getToolDefinition(toolId: string): ToolInfo | null {
  const info = tools[toolId];
  if (!info) return null;
  return { ...info, label: info.name, component: null };
}

export function getToolStatusText(status: ToolStatus): string {
  switch (status) {
    case "developing":
      return "开发中...";
    case "ready":
      return "可用";
    case "maintenance":
      return "维护中";
    default:
      return status;
  }
}
