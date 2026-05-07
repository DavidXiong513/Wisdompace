// ── 阶段一：不可改变的基准风险 ──

export interface Option {
  label: string;
  coefficient: number;
  coefficientRange?: [number, number]; // 用于区间随机取中间值
}

export interface BaselineQuestion {
  id: string;
  title: string;
  description: string;
  options: Option[];
}

export const baselineQuestions: BaselineQuestion[] = [
  {
    id: "family-direct",
    title: "您的父母、亲兄弟姐妹中，是否有人被明确诊断为阿尔茨海默病或其他类型的痴呆？",
    description: "",
    options: [
      { label: "没有", coefficient: 1.0 },
      { label: "有一位", coefficient: 1.65, coefficientRange: [1.5, 1.8] },
      { label: "有两位或以上", coefficient: 2.5, coefficientRange: [2.0, 3.0] },
    ],
  },
  {
    id: "family-indirect",
    title: "您的（外）祖父母、亲叔叔/姑姑、亲舅舅/姨中，是否有人被明确诊断为阿尔茨海默病或其他类型的痴呆？",
    description: "",
    options: [
      { label: "没有", coefficient: 1.0 },
      { label: "有一位", coefficient: 1.2 },
      { label: "有两位或以上", coefficient: 1.5 },
    ],
  },
  {
    id: "age-group",
    title: "您目前的年龄段是？",
    description: "流行病学数据显示，65岁后每5年风险约翻一番",
    options: [
      { label: "40岁以下", coefficient: 1.0 },
      { label: "40-49岁", coefficient: 1.2 },
      { label: "50-59岁", coefficient: 1.5 },
      { label: "60-69岁", coefficient: 2.0 },
      { label: "70岁及以上", coefficient: 2.75, coefficientRange: [2.5, 3.0] },
    ],
  },
];

// ── 阶段二：可改变的生活方式（基于柳叶刀14因素） ──

export interface LifestyleQuestion {
  id: string;
  title: string;
  description?: string;
  factors: string[]; // 覆盖的柳叶刀因素
  options: {
    label: string;
    score: number;
  }[];
}

export const lifestyleQuestions: LifestyleQuestion[] = [
  {
    id: "mental-activity",
    title: "您平均每周进行多少次阅读、学习新技能、下棋等需要动脑的活动？",
    description: "大脑如同肌肉，越用越灵活",
    factors: ["早年教育", "大脑活跃度"],
    options: [
      { label: "几乎每天", score: 0 },
      { label: "每周几次", score: 1 },
      { label: "很少", score: 2 },
    ],
  },
  {
    id: "chronic-disease",
    title: "您是否有确诊的高血压、高血脂或糖尿病，且控制得如何？",
    description: "",
    factors: ["血压管理", "血脂管理", "血糖管理"],
    options: [
      { label: "没有，或控制得很好（按时服药/监测，指标正常）", score: 0 },
      { label: "有，但控制得一般（偶尔监测）", score: 1 },
      { label: "有，基本不控制或不清楚", score: 3 },
    ],
  },
  {
    id: "diet",
    title: "您的饮食结构是否均衡？",
    description: "蔬菜水果充足，少吃加工食品和红肉",
    factors: ["均衡营养饮食"],
    options: [
      { label: "饮食均衡，蔬菜水果充足，少吃加工食品", score: 0 },
      { label: "饮食一般，有时吃得不规律", score: 1 },
      { label: "饮食不健康，很少吃蔬菜水果", score: 2 },
    ],
  },
  {
    id: "bmi",
    title: "您的体重/身高情况如何？",
    description: "BMI = 体重(kg) ÷ 身高²(m²)。正常范围 18.5-24，超过24为超重，低于18.5为偏瘦",
    factors: ["体重管理"],
    options: [
      { label: "BMI在18.5-24正常范围", score: 0 },
      { label: "BMI略高（24-28）或略低（18-18.5）", score: 1 },
      { label: "BMI明显超标（>28）或明显偏低（<18）", score: 2 },
    ],
  },
  {
    id: "smoking",
    title: "您的吸烟情况如何？",
    description: "",
    factors: ["戒烟"],
    options: [
      { label: "从不吸烟", score: 0 },
      { label: "已戒烟", score: 1 },
      { label: "当前吸烟", score: 2 },
    ],
  },
  {
    id: "alcohol",
    title: "您的饮酒情况如何？",
    description: "男性每日不超过2份标准饮品，女性不超过1份",
    factors: ["限制酒精摄入"],
    options: [
      { label: "从不饮酒", score: 0 },
      { label: "偶尔少量饮酒", score: 1 },
      { label: "经常饮酒或酗酒", score: 2 },
    ],
  },
  {
    id: "mental-health",
    title: "您是否长期感到压力大、情绪低落或焦虑？",
    description: "情绪状态会影响大脑健康，长期高压会升高皮质醇水平",
    factors: ["预防抑郁", "压力管理"],
    options: [
      { label: "很少，心态积极平和", score: 0 },
      { label: "偶尔会有情绪波动", score: 1 },
      { label: "经常感到压力大或情绪低落", score: 2 },
    ],
  },
  {
    id: "social-activity",
    title: "您的社交活动频率如何？",
    description: "包括与亲友聚会、参加兴趣小组、社区活动等",
    factors: ["减少社交孤立"],
    options: [
      { label: "每周都有社交活动，朋友较多", score: 0 },
      { label: "偶尔社交，有一些朋友", score: 1 },
      { label: "很少社交，独居为主", score: 2 },
    ],
  },
  {
    id: "sleep",
    title: "您每天的睡眠质量如何？",
    description: "成年人建议每晚保证7-8小时优质睡眠",
    factors: ["对抗睡眠障碍"],
    options: [
      { label: "每天都能保证优质的睡眠", score: 0 },
      { label: "有时睡眠不规律或质量一般", score: 1 },
      { label: "经常睡眠不足或睡眠质量差", score: 2 },
    ],
  },
  {
    id: "exercise",
    title: "您每周进行中等强度运动的时间有多少？",
    description: "中等强度运动如快走、游泳、骑自行车，建议每周至少150分钟",
    factors: ["适度运动锻炼"],
    options: [
      { label: "每周150分钟以上", score: 0 },
      { label: "每周60-150分钟", score: 1 },
      { label: "每周少于60分钟", score: 2 },
    ],
  },
  {
    id: "hearing",
    title: "您是否有未经矫正的听力下降？",
    description: "老年人应定期进行听力测试，确诊后尽早佩戴助听设备",
    factors: ["听力损失治疗"],
    options: [
      { label: "听力正常，或已佩戴合适助听设备", score: 0 },
      { label: "轻微下降，未做处理", score: 1 },
      { label: "明显下降，未佩戴助听设备", score: 2 },
    ],
  },
  {
    id: "vision",
    title: "您是否有未经矫正的视力下降？",
    description: "",
    factors: ["视力损失治疗"],
    options: [
      { label: "视力正常，或已佩戴合适眼镜", score: 0 },
      { label: "轻微下降，未矫正", score: 1 },
      { label: "明显下降，未做矫正处理", score: 2 },
    ],
  },
  {
    id: "head-trauma",
    title: "您是否有过较严重的头部创伤史？",
    description: "如摔跤、车祸、对抗性运动等导致的脑震荡或头部受伤",
    factors: ["头部保护"],
    options: [
      { label: "没有过头部重创", score: 0 },
      { label: "有过一次，已完全恢复", score: 1 },
      { label: "有过多次或严重头部创伤", score: 2 },
    ],
  },
];

export const MAX_LIFESTYLE_SCORE = 27; // 2+3+2+2+2+2+2+2+2+2+2+2+2
