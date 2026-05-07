import type { HobbyCategory, InterestLevel } from "./hobbyData";
import type { RadarResult, DimensionScore } from "./calculation";
import { categoryMeta } from "./hobbyData";

// ── 维度解读 ──

const dimensionInterpretations: Record<
  HobbyCategory,
  { low: string; mid: string; high: string }
> = {
  physical: {
    low: "体能活动严重不足，身体基座薄弱。缺乏运动直接影响脑供血和代谢水平，是认知衰退的高风险因素。",
    mid: "有一定的运动基础，但尚未形成稳定习惯。建议将运动频率提升至每周3次以上，为大脑提供持续的生理支持。",
    high: "运动习惯良好！规律的体能活动正在为你的大脑供血和代谢提供坚实保障，这是预防认知衰退的重要基石。",
  },
  creative: {
    low: "创作性活动匮乏，心理成就感来源单一。缺乏创作输出可能导致情绪调节能力不足，增加抑郁风险。",
    mid: "有创作兴趣但投入不深。试着将创作变成定期习惯，哪怕每周只花1小时，也能显著提升心理满足感。",
    high: "创作已成为你生活的重要组成部分！持续的创作输出为你提供了稳定的心流体验和成就感来源。",
  },
  cognitive: {
    low: "智力挑战严重不足，认知储备薄弱。大脑长期缺乏有效刺激，神经连接可能逐渐退化。",
    mid: "有主动学习的意愿，但深度和广度都有提升空间。建议将学习与个人兴趣或职业发展深度绑定。",
    high: "认知储备充足！持续的智力挑战正在为你构建强大的认知防火墙，这是对抗认知衰退最有效的防线之一。",
  },
};

export function getDimensionInterpretation(
  dimension: DimensionScore
): string {
  const interp = dimensionInterpretations[dimension.category];
  if (dimension.total <= 3.5) return interp.low;
  if (dimension.total <= 6.5) return interp.mid;
  return interp.high;
}

// ── 兴趣层级诊断 ──

export function getInterestLevelDiagnosis(
  interestLevels: Record<string, InterestLevel>
): string {
  const values = Object.values(interestLevels);
  if (values.length === 0) return "您尚未选择具体的兴趣层级，建议补充自测以获得更精准的评估。";

  const counts = { sensory: 0, conscious: 0, aspiration: 0 };
  values.forEach((v) => counts[v]++);

  const total = values.length;
  const aspirationRatio = counts.aspiration / total;
  const consciousRatio = counts.conscious / total;

  if (aspirationRatio >= 0.6) {
    return "您的主要爱好已进入「志趣」阶段——与个人价值观深度绑定。这是最稳定、最有驱动力的兴趣形态，也是大脑最强的认知保护层。请继续保持这种深度投入。";
  }
  if (consciousRatio + aspirationRatio >= 0.6) {
    return '您的爱好大多处于「自觉兴趣」阶段，有明确的进步目标和学习意愿。建议向「志趣」发展——思考这些爱好如何与你的人生意义或长期目标产生连接，让动力从"想做好"升级为"必须做好"。';
  }
  return '您的爱好主要停留在「感官兴趣」阶段，以放松和即时快乐为主。这没有问题，但如果想获得更持久的健康收益，建议选择1-2个爱好深入下去——从"随便玩玩"变成"认真研究"，你会发现完全不同的体验维度。';
}

// ── 爱好处方 ──

type Prescription = {
  title: string;
  steps: string[];
};

const prescriptionMap: Record<HobbyCategory, Prescription> = {
  physical: {
    title: "提升肉身基座",
    steps: [
      "入门：每天散步30分钟，或每周3次20分钟快走",
      "进阶：尝试加入一个运动社群（跑步团/瑜伽班），让运动带有社交属性",
      "升级：将运动与智力活动结合——边跑步边听播客，或在徒步中观察记录植物种类",
    ],
  },
  creative: {
    title: "激活创作能力",
    steps: [
      "入门：每周尝试1次「创意烹饪」，拍下成品记录感受",
      "进阶：将阅读心得写成300字短评，发表在社交平台",
      "升级：参加「城市漫步摄影」社群，同时满足体能+创作+社交三重需求",
    ],
  },
  cognitive: {
    title: "强化认知储备",
    steps: [
      "入门：每天花15分钟阅读深度文章或学习一个新知识点",
      "进阶：选择一个感兴趣的课题，进行为期一个月的主题式学习",
      "升级：将学到的知识输出——写笔记、做分享、或教给别人",
    ],
  },
};

export function getPrescriptions(weakestCategory: HobbyCategory): Prescription {
  return prescriptionMap[weakestCategory];
}

// ── 完整报告文本 ──

export function generateReportText(result: RadarResult): string {
  const lines: string[] = [];
  lines.push(`健康画像：${result.profileName}`);
  lines.push(result.profileDescription);
  lines.push("");
  lines.push("各维度评估：");
  result.dimensions.forEach((d) => {
    const meta = categoryMeta[d.category];
    lines.push(
      `  ${meta.label}（${meta.subtitle}）：${d.total}/10 — ${getDimensionInterpretation(d)}`
    );
  });
  return lines.join("\n");
}
