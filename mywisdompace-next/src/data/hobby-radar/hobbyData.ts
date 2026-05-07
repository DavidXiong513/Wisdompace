// ── 爱好分类数据 ──

export type HobbyCategory = "physical" | "creative" | "cognitive";

export type HobbyItem = {
  id: string;
  label: string;
  category: HobbyCategory;
};

export type InterestLevel = "sensory" | "conscious" | "aspiration";

export const categoryMeta: Record<
  HobbyCategory,
  { label: string; subtitle: string; color: string; healthValue: string }
> = {
  physical: {
    label: "肉身基座",
    subtitle: "体能型爱好",
    color: "#059669",
    healthValue: "改善代谢，增加脑供血，延缓生理衰老",
  },
  creative: {
    label: "创作能力",
    subtitle: "创作型爱好",
    color: "#D97706",
    healthValue: "提供心流体验，产出具体作品，对抗抑郁与孤独",
  },
  cognitive: {
    label: "认知储备",
    subtitle: "智力型爱好",
    color: "#6366F1",
    healthValue: "挑战认知边界，增强神经连接，构建认知防火墙",
  },
};

export const interestLevelOptions: {
  value: InterestLevel;
  label: string;
  description: string;
  score: number;
}[] = [
  {
    value: "sensory",
    label: "感官兴趣",
    description: "主要是为了放松、打发时间或获得即时快乐，不太需要深入思考",
    score: 2,
  },
  {
    value: "conscious",
    label: "自觉兴趣",
    description: "会主动学习和研究，想要做得更好，有明确的进步目标",
    score: 6,
  },
  {
    value: "aspiration",
    label: "志趣兴趣",
    description: "它已成为我表达自我、实现价值的重要方式，遇到困难也会坚持",
    score: 10,
  },
];

// ── 爱好清单 ──

export const hobbies: HobbyItem[] = [
  // 体能型
  { id: "running", label: "跑步/慢跑", category: "physical" },
  { id: "walking", label: "散步/徒步", category: "physical" },
  { id: "swimming", label: "游泳", category: "physical" },
  { id: "yoga", label: "瑜伽/普拉提", category: "physical" },
  { id: "gym", label: "健身房锻炼", category: "physical" },
  { id: "ball-sports", label: "球类运动", category: "physical" },
  { id: "dance", label: "舞蹈", category: "physical" },
  { id: "cycling", label: "骑行", category: "physical" },
  { id: "climbing", label: "登山/攀岩", category: "physical" },
  { id: "tai-chi", label: "太极拳/八段锦", category: "physical" },

  // 创作型
  { id: "writing", label: "写作/日记", category: "creative" },
  { id: "painting", label: "绘画/素描", category: "creative" },
  { id: "photography", label: "摄影/摄像", category: "creative" },
  { id: "cooking", label: "烹饪/烘焙", category: "creative" },
  { id: "diy", label: "手工DIY", category: "creative" },
  { id: "music", label: "音乐演奏/创作", category: "creative" },
  { id: "gardening", label: "园艺/插花", category: "creative" },
  { id: "short-video", label: "短视频制作", category: "creative" },
  { id: "calligraphy", label: "书法/篆刻", category: "creative" },
  { id: "scrapbook", label: "手账/拼贴", category: "creative" },

  // 智力型
  { id: "reading", label: "阅读（书籍/深度文章）", category: "cognitive" },
  { id: "chess", label: "下棋（围棋/象棋等）", category: "cognitive" },
  { id: "sudoku", label: "数独/填字游戏", category: "cognitive" },
  { id: "language", label: "学习新语言", category: "cognitive" },
  { id: "new-skill", label: "学习新技能（编程/乐器等）", category: "cognitive" },
  { id: "strategy-game", label: "策略游戏", category: "cognitive" },
  { id: "documentary", label: "看纪录片并做笔记", category: "cognitive" },
  { id: "debate", label: "参加辩论/讨论", category: "cognitive" },
  { id: "research", label: "研究一个课题", category: "cognitive" },
  { id: "puzzle", label: "解谜游戏", category: "cognitive" },
];

export const DEFAULT_VISIBLE_COUNT = 6; // 每类默认展示数量

export function getHobbiesByCategory(category: HobbyCategory): HobbyItem[] {
  return hobbies.filter((h) => h.category === category);
}
