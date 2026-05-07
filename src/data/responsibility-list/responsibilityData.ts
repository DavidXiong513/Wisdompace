// ── 责任分类数据 ──

export type ResponsibilityCategory =
  | "work"
  | "family"
  | "grandparent"
  | "social"
  | "self";

export type ResponsibilityItem = {
  id: string;
  label: string;
  category: ResponsibilityCategory;
};

export const categoryMeta: Record<
  ResponsibilityCategory,
  { label: string; subtitle: string; color: string; icon: string }
> = {
  work: {
    label: "工作责任",
    subtitle: "职业与事业",
    color: "#2563EB",
    icon: "💼",
  },
  family: {
    label: "家庭责任",
    subtitle: "家人与至亲",
    color: "#DC2626",
    icon: "🏠",
  },
  grandparent: {
    label: "隔代养育",
    subtitle: "孙辈与传承",
    color: "#7C3AED",
    icon: "👶",
  },
  social: {
    label: "社会责任",
    subtitle: "朋友与社群",
    color: "#059669",
    icon: "🤝",
  },
  self: {
    label: "对己责任",
    subtitle: "自己与未来",
    color: "#D97706",
    icon: "🌱",
  },
};

export const responsibilities: ResponsibilityItem[] = [
  // 工作责任
  { id: "work-duties", label: "岗位职责与日常工作", category: "work" },
  { id: "work-projects", label: "负责的项目或产品", category: "work" },
  { id: "work-team", label: "团队管理与下属培养", category: "work" },
  { id: "work-clients", label: "客户关系与合作协议", category: "work" },
  { id: "work-finance", label: "财务审批权与资金管理", category: "work" },
  { id: "work-ip", label: "知识产权与核心资料", category: "work" },
  { id: "work-succession", label: "岗位继任与交接安排", category: "work" },
  { id: "work-contracts", label: "未完成的合同或承诺", category: "work" },

  // 家庭责任
  { id: "family-income", label: "养家糊口与经济来源", category: "family" },
  { id: "family-children", label: "子女教育与成长陪伴", category: "family" },
  { id: "family-parents", label: "赡养父母与照护安排", category: "family" },
  { id: "family-mortgage", label: "房贷/车贷/大额负债", category: "family" },
  { id: "family-insurance", label: "保险配置与受益人", category: "family" },
  { id: "family-assets", label: "家庭资产与财产管理", category: "family" },
  { id: "family-decisions", label: "家庭重大决策参与", category: "family" },
  { id: "family-pets", label: "宠物照料", category: "family" },

  // 隔代养育
  { id: "gp-daily", label: "孙辈日常照料与接送", category: "grandparent" },
  { id: "gp-finance", label: "孙辈经济资助（教育基金等）", category: "grandparent" },
  { id: "gp-education", label: "孙辈教育规划与辅导", category: "grandparent" },
  { id: "gp-values", label: "家风传承与价值观引导", category: "grandparent" },
  { id: "gp-emergency", label: "紧急情况下的孙辈看护", category: "grandparent" },

  // 社会责任
  { id: "social-friends", label: "朋友互助与承诺", category: "social" },
  { id: "social-community", label: "社群/组织中的义务", category: "social" },
  { id: "social-guarantee", label: "借贷担保或联带责任", category: "social" },
  { id: "social-volunteer", label: "志愿服务或公益承诺", category: "social" },
  { id: "social-mentor", label: "师徒/指导关系", category: "social" },

  // 对己责任
  { id: "self-health", label: "个人健康管理", category: "self" },
  { id: "self-finance", label: "个人财务与退休规划", category: "self" },
  { id: "self-emotional", label: "情感需求与心理健康", category: "self" },
  { id: "self-legacy", label: "个人遗产与遗愿", category: "self" },
  { id: "self-growth", label: "个人成长与未完成的心愿", category: "self" },
];

export const DEFAULT_VISIBLE_COUNT = 5;

export function getResponsibilitiesByCategory(
  cat: ResponsibilityCategory
): ResponsibilityItem[] {
  return responsibilities.filter((r) => r.category === cat);
}

// ── 紧急/重要评估选项 ──

export type UrgencyLevel = "urgent" | "not-urgent";
export type ImportanceLevel = "important" | "not-important";

export const urgencyOptions: { value: UrgencyLevel; label: string }[] = [
  { value: "urgent", label: "紧急" },
  { value: "not-urgent", label: "不紧急" },
];

export const importanceOptions: { value: ImportanceLevel; label: string }[] = [
  { value: "important", label: "重要" },
  { value: "not-important", label: "不重要" },
];

// 四象限定义
export type Quadrant = "do-first" | "schedule" | "delegate" | "eliminate";

export const quadrantDefs: Record<
  Quadrant,
  { label: string; description: string; color: string }
> = {
  "do-first": {
    label: "立即行动",
    description: "紧急且重要 — 需要你亲自、优先处理的责任",
    color: "#DC2626",
  },
  schedule: {
    label: "重点规划",
    description: "重要不紧急 — 需要长期关注和规划，不能拖延",
    color: "#2563EB",
  },
  delegate: {
    label: "考虑委托",
    description: "紧急不重要 — 可以考虑委托或移交他人",
    color: "#D97706",
  },
  eliminate: {
    label: "审视取舍",
    description: "不紧急不重要 — 需要审视是否值得继续承担",
    color: "#6B7280",
  },
};

export function getQuadrant(
  urgency: UrgencyLevel,
  importance: ImportanceLevel
): Quadrant {
  if (urgency === "urgent" && importance === "important") return "do-first";
  if (urgency === "not-urgent" && importance === "important") return "schedule";
  if (urgency === "urgent" && importance === "not-important") return "delegate";
  return "eliminate";
}
