// ── 告别清单数据 ──

export type ListCategory =
  | "experience"
  | "relationship"
  | "growth"
  | "legacy"
  | "courage";

export const categoryMeta: Record<
  ListCategory,
  { label: string; icon: string; color: string }
> = {
  experience: { label: "人生体验", icon: "🌍", color: "#2563EB" },
  relationship: { label: "关系修复", icon: "💝", color: "#DC2626" },
  growth: { label: "自我成长", icon: "🌱", color: "#059669" },
  legacy: { label: "留下印记", icon: "✨", color: "#7C3AED" },
  courage: { label: "勇敢尝试", icon: "🔥", color: "#D97706" },
};

// ── 预设灵感项 ──

export type InspirationItem = {
  id: string;
  text: string;
  category: ListCategory;
};

export const inspirations: InspirationItem[] = [
  // 人生体验
  { id: "exp-1", text: "去一个从未去过的国家旅行", category: "experience" },
  { id: "exp-2", text: "看一次极光", category: "experience" },
  { id: "exp-3", text: "学会一道拿手菜，做给重要的人吃", category: "experience" },
  { id: "exp-4", text: "在海边看完一整场日出", category: "experience" },
  { id: "exp-5", text: "住一次星空下的帐篷", category: "experience" },
  { id: "exp-6", text: "坐一次长途火车，看沿途风景", category: "experience" },
  { id: "exp-7", text: "学一门外语到能日常对话的程度", category: "experience" },
  { id: "exp-8", text: "体验一次完全的数字断联（48小时无手机）", category: "experience" },

  // 关系修复
  { id: "rel-1", text: "对父母说一次「谢谢你，我爱你」", category: "relationship" },
  { id: "rel-2", text: "和一个久未联系的老朋友重新对话", category: "relationship" },
  { id: "rel-3", text: "向曾经伤害过的人真诚道歉", category: "relationship" },
  { id: "rel-4", text: "给伴侣写一封认真的情书", category: "relationship" },
  { id: "rel-5", text: "原谅一个一直放不下的人", category: "relationship" },
  { id: "rel-6", text: "和孩子进行一次深度对话，听听 TA 的心声", category: "relationship" },
  { id: "rel-7", text: "组织一次全家福拍摄", category: "relationship" },

  // 自我成长
  { id: "grow-1", text: "学会一项全新的技能（乐器/绘画/编程等）", category: "growth" },
  { id: "grow-2", text: "读完一本改变人生观的书", category: "growth" },
  { id: "grow-3", text: "独自完成一次长途徒步", category: "growth" },
  { id: "grow-4", text: "学会冥想或正念，坚持一个月", category: "growth" },
  { id: "grow-5", text: "写下自己的人生故事", category: "growth" },
  { id: "grow-6", text: "参加一次志愿服务", category: "growth" },

  // 留下印记
  { id: "leg-1", text: "写一封信给未来的自己或下一代", category: "legacy" },
  { id: "leg-2", text: "种一棵树，看它慢慢长大", category: "legacy" },
  { id: "leg-3", text: "创作一件属于自己的作品（文章/画/视频）", category: "legacy" },
  { id: "leg-4", text: "整理一本家庭相册或回忆录", category: "legacy" },
  { id: "leg-5", text: "资助一个需要帮助的人或项目", category: "legacy" },

  // 勇敢尝试
  { id: "cou-1", text: "做一件一直想做但不敢做的事", category: "courage" },
  { id: "cou-2", text: "在公众面前做一次演讲或表演", category: "courage" },
  { id: "cou-3", text: "对不合理的请求说一次「不」", category: "courage" },
  { id: "cou-4", text: "裸辞一次，给自己一个 Gap 期", category: "courage" },
  { id: "cou-5", text: "去蹦极、跳伞或做一次极限运动", category: "courage" },
  { id: "cou-6", text: "穿上一直想穿但不敢穿的衣服", category: "courage" },
];

// ── 清单项类型 ──

export type GoodbyeItem = {
  id: string;
  text: string;
  category: ListCategory;
  completed: boolean;
  createdAt: string; // ISO date
  completedAt?: string;
  isCustom: boolean;
};

const STORAGE_KEY = "wisdompace-goodbye-list";

export function loadList(): GoodbyeItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveList(items: GoodbyeItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function generateId() {
  return `item_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
