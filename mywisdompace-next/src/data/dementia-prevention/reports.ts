import type { RiskLevel, RiskResult } from "./calculation";
import { lifestyleQuestions } from "./questions";

// ── 风险等级定义 ──

export interface RiskLevelDef {
  level: RiskLevel;
  label: string;
  emoji: string;
  colorClass: string; // Tailwind class
  summary: string;
  advice: string;
}

export const riskLevelDefs: Record<RiskLevel, RiskLevelDef> = {
  attention: {
    level: "attention",
    label: "关注级",
    emoji: "🟢",
    colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    summary: "您的综合风险处于较低水平，继续保持！",
    advice: "当前生活方式对大脑有很好的保护作用。请继续保持健康习惯，定期关注脑健康。",
  },
  alert: {
    level: "alert",
    label: "警惕级",
    emoji: "🟡",
    colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    summary: "您的风险处于中等水平，存在可改善空间。",
    advice: "您的生活方式中有一些因素正在增加风险。优先改善下方列出的待改进项，可以有效降低风险。",
  },
  action: {
    level: "action",
    label: "行动级",
    emoji: "🟠",
    colorClass: "text-orange-700 bg-orange-50 border-orange-200",
    summary: "您的风险偏高，需要立即开始预防行动。",
    advice: "结合年龄或家族史，您的风险不容忽视。请认真对待下方的行动建议，逐步调整生活方式。",
  },
  critical: {
    level: "critical",
    label: "警报级",
    emoji: "🔴",
    colorClass: "text-red-700 bg-red-50 border-red-200",
    summary: "您的风险较高，强烈建议就医咨询。",
    advice: "本测评结果已超出一般预防范围。建议您尽快前往神经内科或记忆门诊做专业评估。",
  },
};

// ── 先天风险描述 ──

export function getGeneticDescription(coefficient: number): string {
  if (coefficient <= 1.0) return "较低水平，家族中无明显遗传因素";
  if (coefficient <= 2.0) return "中等水平，家族史带来了一定风险增加";
  return "较高水平，家族中有明显的遗传风险因素";
}

export function getAgeDescription(coefficient: number): string {
  if (coefficient <= 1.0) return "年龄尚未构成显著风险因素";
  if (coefficient <= 1.5) return "随着年龄增长，风险正在逐步累积";
  if (coefficient <= 2.0) return "已进入高风险年龄段，需要更加关注";
  return "年龄已是重要风险因素，请定期进行认知筛查";
}

export function getLifestyleDescription(score: number): string {
  if (score <= 3) return "非常良好，您的健康习惯正在有效保护大脑";
  if (score <= 7) return "一般，部分习惯有待改进以增强保护效果";
  return "有待加强，多个生活习惯正在增加您的风险";
}

// ── 分项行动建议 ──

export interface ActionItem {
  dimension: string;
  suggestion: string;
}

export function getActionItems(worstIds: string[]): ActionItem[] {
  const questionMap = new Map(lifestyleQuestions.map((q) => [q.id, q]));

  const suggestionMap: Record<string, string> = {
    "mental-activity":
      "建议每天留出15-30分钟进行脑力活动：阅读、数独、学习一门新语言或乐器。研究表明，持续的大脑刺激能增强大脑代偿能力。",
    "chronic-disease":
      "建议预约一次体检，检查血压、血脂和血糖三项指标。如果是已确诊患者，请开始每天按时服药并记录指标。",
    "diet":
      "从明天开始做三件事：每天吃够5份蔬菜水果、用全谷物替代精制碳水、减少加工肉类的摄入。均衡的营养是大脑健康的基础。",
    "bmi":
      "BMI 超标会通过三高等途径间接增加痴呆风险。设定合理减重目标（每月减0.5-1公斤），结合饮食调整和运动。BMI 偏低则需加强营养摄入。",
    "smoking":
      "戒烟是你能做的最有效的健康投资之一。设定一个戒烟日期，寻求家人支持，或考虑使用尼古丁替代疗法辅助戒烟。",
    "alcohol":
      "长期过量饮酒会加速认知衰退。男性每天不超过2份标准饮品，女性不超过1份。建议用无酒精饮料替代。",
    "mental-health":
      "长期高压和情绪低落会升高体内皮质醇水平，损害血管健康。建议每天留出10分钟进行正念冥想或深呼吸练习。如果情绪持续低落三个月以上，请考虑寻求心理咨询支持。",
    "social-activity":
      "社交孤立是痴呆的重要风险因素。建议每周至少安排一次线下社交活动——加入兴趣小组、参加社区课程、或约朋友面对面聊天。",
    "sleep":
      "设定固定的作息时间，每晚保证7-8小时的睡眠。睡前避免使用电子设备，保持卧室安静、黑暗、温度适宜。",
    "exercise":
      "每周至少进行150分钟中等强度运动（每天30分钟，每周5天），快走、游泳、骑自行车都是好选择。坚持运动是保护大脑最有效的方式之一。",
    "hearing":
      "听力下降会减少外界信息输入，加速认知衰退。建议尽快预约耳科检查，如需佩戴助听器请尽早配备。",
    "vision":
      "视力下降会影响活动和社交参与。建议定期做眼科检查，并根据验光结果佩戴合适的眼镜。",
    "head-trauma":
      "头部重创会增加痴呆风险。日常生活中请注意安全防护，避免高风险运动或活动中做好保护措施。如多次头部受伤，建议咨询神经内科医生。",
  };

  return worstIds
    .map((id) => {
      const question = questionMap.get(id);
      if (!question) return null;
      return {
        dimension: question.title.length > 20 ? question.title.slice(0, 20) + "…" : question.title,
        suggestion: suggestionMap[id] || "请关注此项风险因素，并逐步调整改善。",
      };
    })
    .filter((item): item is ActionItem => item !== null);
}
