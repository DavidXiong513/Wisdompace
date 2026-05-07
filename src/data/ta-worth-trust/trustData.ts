// ── 意定人选择工具数据 ──

// ── 社交状况 ──

export type MaritalStatus = "married" | "partner" | "single" | "divorced" | "widowed";
export type ChildrenStatus = "yes" | "no" | "estranged";
export type ParentsStatus = "grandparents" | "both" | "one" | "none";
export type RelationQuality = "close" | "normal" | "distant" | "none";

export const maritalOptions: { value: MaritalStatus; label: string }[] = [
  { value: "married", label: "已婚" },
  { value: "partner", label: "有伴侣（未婚）" },
  { value: "single", label: "未婚单身" },
  { value: "divorced", label: "离异" },
  { value: "widowed", label: "丧偶" },
];

export const childrenOptions: { value: ChildrenStatus; label: string }[] = [
  { value: "yes", label: "有子女，关系良好" },
  { value: "estranged", label: "有子女，但关系疏远" },
  { value: "no", label: "无子女" },
];

export const parentsOptions: { value: ParentsStatus; label: string }[] = [
  { value: "grandparents", label: "祖辈都还健在" },
  { value: "both", label: "双方都健在" },
  { value: "one", label: "一方还健在" },
  { value: "none", label: "均已不在" },
];

export const relationOptions: { value: RelationQuality; label: string }[] = [
  { value: "close", label: "关系亲密" },
  { value: "normal", label: "关系尚可" },
  { value: "distant", label: "关系疏远" },
  { value: "none", label: "已无联系" },
];

// ── 候选人类型 ──

export type CandidateRelation =
  | "spouse"
  | "child"
  | "parent"
  | "sibling"
  | "friend"
  | "lawyer"
  | "social-worker"
  | "institution"
  | "custom";

export type Candidate = {
  id: string;
  name: string;
  relation: CandidateRelation;
  phone?: string;
};

export const relationTypeOptions: {
  value: CandidateRelation;
  label: string;
  icon: string;
}[] = [
  { value: "spouse", label: "配偶/伴侣", icon: "💑" },
  { value: "child", label: "子女", icon: "👧" },
  { value: "parent", label: "父母", icon: "👨‍👩‍👧" },
  { value: "sibling", label: "兄弟姐妹", icon: "👫" },
  { value: "friend", label: "亲密朋友", icon: "🤝" },
  { value: "lawyer", label: "律师/法律顾问", icon: "⚖️" },
  { value: "social-worker", label: "社工/专业护理", icon: "🩺" },
  { value: "institution", label: "专业机构/信托", icon: "🏛️" },
  { value: "custom", label: "其他", icon: "✏️" },
];

// ── 评估维度 ──

export type EvalDimension = {
  id: string;
  label: string;
  question: string;
  description: string;
};

export const evalDimensions: EvalDimension[] = [
  {
    id: "values",
    label: "价值观理解",
    question: "TA 是否理解你的价值观和人生观？",
    description: "当你无法表达时，TA 能否按照你的真实意愿做出符合你价值观的决定？",
  },
  {
    id: "capability",
    label: "决策能力",
    question: "TA 是否有能力在压力下替你做决定？",
    description: "面对突发状况和复杂局面，TA 能否冷静分析、果断决策，而非逃避或情绪化？",
  },
  {
    id: "willingness",
    label: "承担责任",
    question: "TA 是否愿意承担这份责任？",
    description: "意定人是一份沉甸甸的责任。TA 是否真正理解这份托付的分量，并愿意接受？",
  },
  {
    id: "availability",
    label: "时间精力",
    question: "TA 是否有足够的时间和精力？",
    description: "TA 当前的生活状态是否允许在关键时刻为你投入必要的时间和精力？",
  },
];

export const scoreOptions: { value: number; label: string }[] = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "不太符合" },
  { value: 3, label: "基本符合" },
  { value: 4, label: "比较符合" },
  { value: 5, label: "完全符合" },
];

// ── 权宜方案（独居者路径） ──

export type AlternativePlan = {
  id: string;
  title: string;
  icon: string;
  description: string;
  steps: string[];
  contactTemplate?: string;
};

export const alternativePlans: AlternativePlan[] = [
  {
    id: "notary",
    title: "意定监护公证",
    icon: "📜",
    description: "通过公证处办理意定监护协议，指定信任的人或机构在您丧失行为能力时代为决策。这是法律效力最强的方式。",
    steps: [
      "联系当地公证处，咨询意定监护公证办理流程",
      "准备身份证、户口本、健康证明等材料",
      "与被监护人（您指定的人）一同前往公证处签署协议",
      "公证处出具公证书，具有法律约束力",
    ],
    contactTemplate: "公证处咨询电话：12348（法律服务热线）",
  },
  {
    id: "lawyer",
    title: "律师/法律顾问",
    icon: "⚖️",
    description: "委托专业律师作为您的法律代理人，在您无法自理时代为处理法律、财务和医疗决策。",
    steps: [
      "寻找擅长老年人权益或意定监护的律师事务所",
      "签订委托代理协议，明确代理范围和权限",
      "指定律师在特定条件下代为行使决策权",
      "定期（每年）更新委托协议，确保有效性",
    ],
    contactTemplate: "当地律师协会：可查询专业领域律师名单",
  },
  {
    id: "community",
    title: "社区/民政服务",
    icon: "🏘️",
    description: "社区居委会和民政部门可以提供意定监护的指导和协助，部分地区已建立独居老人关爱机制。",
    steps: [
      "前往所在社区居委会或街道办事处咨询",
      "了解当地独居老人关怀服务和意定监护政策",
      "登记个人信息，建立定期联络机制",
      "了解政府购买的养老服务和紧急救助通道",
    ],
    contactTemplate: "社区居委会 / 街道民政科 / 12345市民服务热线",
  },
  {
    id: "mutual",
    title: "互助型意定监护",
    icon: "🤝",
    description: "与志同道合的朋友建立互助关系，互相作为对方的意定监护人。适用于社交圈较窄但有可信赖朋友的情况。",
    steps: [
      "从亲密朋友中筛选 1-2 位值得信任的人",
      "坦诚沟通意定监护的想法和期望",
      "了解对方是否也有类似需求，建立双向互助",
      "共同前往公证处签署互为意定监护人的协议",
    ],
  },
  {
    id: "trust-org",
    title: "信托/专业机构",
    icon: "🏛️",
    description: "部分信托公司和专业养老机构提供「意定监护+财产信托」的一站式服务，适合有一定资产的人群。",
    steps: [
      "咨询当地信托公司或专业养老机构",
      "了解意定监护+财产管理的综合服务方案",
      "评估服务费用和保障范围",
      "签订服务协议，定期审视和更新",
    ],
  },
];

// ── 评分计算 ──

export type CandidateScore = {
  candidateId: string;
  scores: Record<string, number>; // dimensionId → score (1-5)
  total: number;
  average: number;
};

export function calculateCandidateScore(
  candidateId: string,
  scores: Record<string, number>
): CandidateScore {
  const values = Object.values(scores);
  const total = values.reduce((s, v) => s + v, 0);
  const average = values.length > 0 ? +(total / values.length).toFixed(1) : 0;
  return { candidateId, scores, total, average };
}

export function getRecommendation(
  scores: CandidateScore[]
): { topId: string; reason: string } | null {
  if (scores.length === 0) return null;
  const sorted = [...scores].sort((a, b) => b.average - a.average);
  const top = sorted[0];

  if (top.average >= 4) {
    return { topId: top.candidateId, reason: "综合评估优秀，是一位可靠的意定人候选人。建议尽快与 TA 沟通并落实。" };
  }
  if (top.average >= 3) {
    return { topId: top.candidateId, reason: "综合评估良好，但部分维度仍有提升空间。建议深入了解后做出决定。" };
  }
  return { topId: top.candidateId, reason: "当前候选人的综合评分偏低。建议考虑权宜方案（专业机构/公证等），或寻找更合适的人选。" };
}
