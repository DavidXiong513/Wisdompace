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
  "life-clock": {
    id: "life-clock",
    name: "生命余光",
    status: "ready",
    description: "看见时间的刻度，直面生命的有限，激发积极生活的紧迫感。",
  },
  "emotional-assessment": {
    id: "emotional-assessment",
    name: "情绪与压力测评",
    status: "ready",
    description: "三维综合评估：情绪、紧张与生活压力，发现隐藏的心理状态。",
  },
  "role-pie-chart": {
    id: "role-pie-chart",
    name: "人生角色饼图",
    status: "ready",
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
  "personality-test-cards": {
    id: "personality-test-cards",
    name: "性格自测工具",
    status: "ready",
    description: "通过 MBTI 和大五人格测试，从不同角度认识自己的性格特质。",
  },
  "preparedness-slider": {
    id: "preparedness-slider",
    name: "预备自测",
    status: "ready",
    description: "自测你对人生重大事项的准备程度。",
  },
  "framework-grid": {
    id: "framework-grid",
    name: "人生框架",
    status: "ready",
    description: "了解本站两大部分与四大篇章的逻辑框架。",
  },
  "reminder-list": {
    id: "reminder-list",
    name: "使用提醒",
    status: "ready",
    description: "在使用本站工具过程中的五点重要提醒。",
  },
  "career-values-card": {
    id: "career-values-card",
    name: "生涯价值观测评",
    status: "ready",
    description: "14种职业价值取向 → 筛选 → 排序 → 锁定3个核心价值观。",
  },
  "ability-card": {
    id: "ability-card",
    name: "社会能力自评",
    status: "ready",
    description: "42项核心能力扫描，基于麦肯锡社会能力体系，发现优势与潜力。",
  },
  "role-stripper": {
    id: "role-stripper",
    name: "角色剥离器",
    status: "developing",
    description: "（已整合到角色饼图）剥离社会角色，看见真实的自己",
  },
  "life-finder": {
    id: "life-finder",
    name: "生活趣味发现器",
    status: "developing",
    description: "发现生活中的趣味与意义",
  },
  "hobby-radar": {
    id: "hobby-radar",
    name: "爱好健康雷达",
    status: "ready",
    description: "评估你的爱好组合对身心健康的影响，发现盲点，获得个性化优化建议。",
  },
  "three-questions-tool": {
    id: "three-questions-tool",
    name: "三思清单",
    status: "ready",
    description: "通过价值观、心理预期、稀缺性三个维度的追问，辅助你理清重大人生决策。",
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
    status: "ready",
    description: "梳理你的人生责任，评估优先级，规划交接方案。",
  },
  "choice-rights": {
    id: "choice-rights",
    name: "生前预嘱",
    status: "ready",
    description: "保护您最后时刻的尊严与选择",
  },
  "ta-worth-trust": {
    id: "ta-worth-trust",
    name: "Ta值得托付吗？",
    status: "ready",
    description: "系统评估你的意定人是否值得托付——TA理解你的价值观吗？TA有压力下决策的能力吗？",
  },
  "goodbye-list": {
    id: "goodbye-list",
    name: "告别清单",
    status: "ready",
    description: "写下你在离开这个世界之前想做的事，一件件去完成它们。",
  },
  "farewell-style": {
    id: "farewell-style",
    name: "告别的方式",
    status: "ready",
    description: "设计属于你的告别——仪式形式、归处选择、告别语、背景音乐，用你喜欢的方式留给世界最后一份创意简报。",
  },
  "no-regrets": {
    id: "no-regrets",
    name: "不留遗憾 · 生命自洽评估",
    status: "ready",
    description: "融合东西方临终关怀研究，从7个维度评估你的生命质量，生成个性化的生命自洽指数和改善路线图。",
  },
  "dementia-prevention-entry": {
    id: "dementia-prevention-entry",
    name: "预防痴呆·风险自测",
    status: "ready",
    description: "基于《柳叶刀》14因素，3分钟自测你的老年痴呆风险，获取个性化预防指南。",
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
