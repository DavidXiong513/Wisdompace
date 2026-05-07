import { Scenario } from '@/types/three-questions';

/**
 * ThreeQSA (三思清单) 全量标准化题库
 * 涵盖：生活、交易、学业、关系、职业、精神 六大领域 15 个重大决策场景
 */

export const scenarios: Scenario[] = [
  // ==================== 1. 生活领域 (Life) ==================== //
  {
    id: "life_child",
    name: "生育抉择",
    category: "生活",
    icon: "🍼",
    description: "在决定是否迎接新生命之前，进行深度自省。",
    questions: [
      { id: "life_q1", text: "你和你的伴侣都非常喜欢小孩吗？", dimension: "价值观维度", weight: 0.14, risk: 0.3 },
      { id: "life_q2", text: "你成长环境偏传统传宗接代，且你内心认同并不抗拒吗？", dimension: "价值观维度", weight: 0.14, risk: 0.35 },
      { id: "life_q3", text: "你和你的伴侣内心都非常认可那些有孩子的家庭的生活方式吗？", dimension: "价值观维度", weight: 0.14, risk: 0.4 },
      { id: "life_q4", text: "你对当下生活与世界的体验感较好，也愿意让孩子来体验这个世界吗？", dimension: "心理预期维度", weight: 0.14, risk: 0.45 },
      { id: "life_q5", text: "你认同生育孩子其实是其他完全无法替代的人生重要事件吗？", dimension: "稀缺性维度", weight: 0.14, risk: 0.5 },
      { id: "life_q6", text: "你能去接受孩子生下来后必然面临的疾病、衰老、无常与死亡吗？", dimension: "心理预期维度", weight: 0.14, risk: 0.7 },
      { id: "life_q7", text: "如果现在不生，等未来到了不可生育年龄，你会大概率后悔吗？", dimension: "稀缺性维度", weight: 0.14, risk: 0.6 }
    ]
  },
  {
    id: "life_medical",
    name: "重大医疗",
    category: "生活",
    icon: "🏥",
    description: "面对高风险治疗或手术决策时的理性权衡。",
    questions: [
      { id: "life_medical_q1", text: "我非常清楚这个医疗决定对我未来生活质量的核心影响是什么。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "life_medical_q2", text: "我对治疗可能带来的最好结果和最坏结果都有充分的心理准备。", dimension: "心理预期维度", weight: 0.17, risk: 0.4 },
      { id: "life_medical_q3", text: "这个医疗方案是当前情况下无法回避或替代的关键选择。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "life_medical_q4", text: "我能够接受治疗后可能出现的并发症、后遗症或生活改变。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "life_medical_q5", text: "如果不做这个治疗，未来病情恶化时我大概率会后悔现在的决定。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "life_medical_q6", text: "这个医疗决定与我对生命意义和尊严的理解是一致的。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },
  {
    id: "life_relocate",
    name: "城市定居",
    category: "生活",
    icon: "🏙️",
    description: "选择迁徙或在一个新城市扎根前的深度考量。",
    questions: [
      { id: "life_relocate_q1", text: "我非常清楚选择这个新地方能给我的生活带来什么样的核心价值。", dimension: "价值观维度", weight: 0.14, risk: 0.3 },
      { id: "life_relocate_q2", text: "我对异地生活的文化差异、节奏和社交重建有充分心理准备。", dimension: "心理预期维度", weight: 0.14, risk: 0.35 },
      { id: "life_relocate_q3", text: "这个地方提供的机遇和体验是我的家乡或其他城市无法替代的。", dimension: "稀缺性维度", weight: 0.14, risk: 0.4 },
      { id: "life_relocate_q4", text: "我能接受离开熟悉环境带来的孤独感、不确定性和家人分离。", dimension: "心理预期维度", weight: 0.14, risk: 0.5 },
      { id: "life_relocate_q5", text: "如果一直留在原地不去尝试，未来我大概率会后悔没有把握机会。", dimension: "稀缺性维度", weight: 0.14, risk: 0.6 },
      { id: "life_relocate_q6", text: "我的职业发展和个人成长在这个新地方有更好的土壤和空间。", dimension: "价值观维度", weight: 0.14, risk: 0.65 },
      { id: "life_relocate_q7", text: "异地生活的困难和挑战是我愿意去承受和克服的。", dimension: "心理预期维度", weight: 0.14, risk: 0.7 }
    ]
  },
  {
    id: "life_legacy",
    name: "身后托付",
    category: "生活",
    icon: "📜",
    description: "关于遗嘱、预嘱及重要托付的提前安排。",
    questions: [
      { id: "life_legacy_q1", text: "我非常明确我想通过身后托付传递什么样的价值观和人生态度。", dimension: "价值观维度", weight: 0.17, risk: 0.3 },
      { id: "life_legacy_q2", text: "我对家人可能对我的决定产生的情绪反应有充分的预期。", dimension: "心理预期维度", weight: 0.17, risk: 0.4 },
      { id: "life_legacy_q3", text: "现在做这个安排是合适的时机，拖延可能会带来不确定性。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "life_legacy_q4", text: "我的托付安排（遗嘱/预嘱）清晰明确，能够减少未来的争议。", dimension: "价值观维度", weight: 0.17, risk: 0.55 },
      { id: "life_legacy_q5", text: "我能平静地面对和讨论死亡，以及我离开后的世界。", dimension: "心理预期维度", weight: 0.17, risk: 0.65 },
      { id: "life_legacy_q6", text: "如果现在不做安排，未来意外来临时我会后悔没有保护好在意的人。", dimension: "稀缺性维度", weight: 0.17, risk: 0.7 }
    ]
  },

  // ==================== 2. 交易领域 (Trade) ==================== //
  {
    id: "trade_home",
    name: "房产买卖",
    category: "交易",
    icon: "🏠",
    description: "涉及高额资金的房产置换或购入决策。",
    questions: [
      { id: "trade_buy_q1", text: "我非常明确即将购入的这套房对我而言的核心价值是什么。", dimension: "价值观维度", weight: 0.2, risk: 0.5 },
      { id: "trade_buy_q2", text: "目前的价格相对合理我可以接受（历史+区域对比）。", dimension: "心理预期维度", weight: 0.2, risk: 0.5 },
      { id: "trade_buy_q3", text: "该房产地段、小区、房型综合下来我都很满意。", dimension: "心理预期维度", weight: 0.2, risk: 0.5 },
      { id: "trade_buy_q4", text: "未来3-5年期间这个区域的保值情况和增值空间我大体心里有底。", dimension: "心理预期维度", weight: 0.2, risk: 0.55 },
      { id: "trade_buy_q5", text: "购房后，我们家庭目前的现金流压力是可持续的。", dimension: "心理预期维度", weight: 0.2, risk: 0.55 }
    ]
  },
  {
    id: "trade_invest",
    name: "重磅投资",
    category: "交易",
    icon: "📈",
    description: "面对高风险、高回报投资标的时的冷静分析。",
    questions: [
      { id: "trade_heavy_invest_q1", text: "我非常清楚这笔投资的核心理由（逻辑/价值/趋势）是什么。", dimension: "价值观维度", weight: 0.17, risk: 0.4 },
      { id: "trade_heavy_invest_q2", text: "我对这笔投资可能出现的最好和最坏结果都有充分预期。", dimension: "心理预期维度", weight: 0.17, risk: 0.45 },
      { id: "trade_heavy_invest_q3", text: "这笔投资标的的当前价格是合理的，或被低估的。", dimension: "心理预期维度", weight: 0.17, risk: 0.5 },
      { id: "trade_heavy_invest_q4", text: "我能接受这笔投资可能损失50%甚至全部本金。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "trade_heavy_invest_q5", text: "如果现在不买入，未来价格上涨后我大概率会后悔错过。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "trade_heavy_invest_q6", text: "即使这笔投资完全亏损，也不会影响我的基本生活和家庭稳定。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },
  {
    id: "trade_debt",
    name: "负债借贷",
    category: "交易",
    icon: "💳",
    description: "判断一笔债务是否值得承载，以及未来的偿还能力。",
    questions: [
      { id: "trade_debt_q1", text: "我非常清楚这笔债务的核心用途和预期回报/价值。", dimension: "价值观维度", weight: 0.17, risk: 0.4 },
      { id: "trade_debt_q2", text: "我对未来还款能力和还款计划有清晰的规划。", dimension: "心理预期维度", weight: 0.17, risk: 0.45 },
      { id: "trade_debt_q3", text: "如果不借这笔钱，我会错过当前不可多得的机会。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "trade_debt_q4", text: "我能接受最坏情况下的债务违约风险和信用影响。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "trade_debt_q5", text: "这笔债务带来的杠杆收益大于利息成本。", dimension: "价值观维度", weight: 0.17, risk: 0.65 },
      { id: "trade_debt_q6", text: "债务期限和还款节奏与我的收入预期是匹配的。", dimension: "心理预期维度", weight: 0.17, risk: 0.7 }
    ]
  },

  // ==================== 3. 学业领域 (Study) ==================== //
  {
    id: "study_major",
    name: "专业/择校",
    category: "学业",
    icon: "🎓",
    description: "关乎未来职业赛道的重大教育方向选择。",
    questions: [
      { id: "study_major_q1", text: "我非常清楚这个专业/学校能给我的未来带来什么样的核心价值。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "study_major_q2", text: "我对学习内容、难度和环境有充分的心理准备。", dimension: "心理预期维度", weight: 0.17, risk: 0.4 },
      { id: "study_major_q3", text: "这个方向是我真正感兴趣且愿意投入的，而不是随大流的选择。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "study_major_q4", text: "我能接受可能带来的就业压力、薪资水平和工作强度。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "study_major_q5", text: "如果为了稳妥而错过，未来我会大概率后悔。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "study_major_q6", text: "这个选择与我的人生目标和长期规划是高度契合的。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },
  {
    id: "study_resign",
    name: "脱产深造",
    category: "学业",
    icon: "📚",
    description: "放弃现有职业，全力投入学业或研究的风险扫描。",
    questions: [
      { id: "study_resign_q1", text: "我非常清楚放弃现有收入去读书能给我带来的核心价值是什么。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "study_resign_q2", text: "我对脱产期间的经济压力和职业断档有充分准备。", dimension: "心理预期维度", weight: 0.17, risk: 0.45 },
      { id: "study_resign_q3", text: "脱产读书的时机是合适的，拖延会让这个机会窗口关闭。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "study_resign_q4", text: "我能接受脱产后可能面临的社交孤立和家庭压力。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "study_resign_q5", text: "如果现在不脱产读书，未来我大概率会后悔错过提升机会。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "study_resign_q6", text: "这个投入产出比（ROI）在我的可接受范围内，且值得投资。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },

  // ==================== 4. 关系领域 (Relation) ==================== //
  {
    id: "relation_commit",
    name: "长久契约",
    category: "关系",
    icon: "💍",
    description: "婚姻、定终身或深度合伙关系前的灵魂考问。",
    questions: [
      { id: "relation_commit_q1", text: "我非常清楚和Ta在一起/合作能给我的生活带来什么样的核心价值。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "relation_commit_q2", text: "我对关系中的责任、妥协和失去部分自由有充分的心理准备。", dimension: "心理预期维度", weight: 0.17, risk: 0.45 },
      { id: "relation_commit_q3", text: "Ta的价值观、人生目标和性格与我高度契合，是难得的伴侣/伙伴。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "relation_commit_q4", text: "我能接受关系中的平淡、争吵和可能的分开风险。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "relation_commit_q5", text: "如果现在不确立关系，未来我大概率会错过这个『对的人』。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "relation_commit_q6", text: "这个决定与我内心对理想关系和道德底线的理解是一致的。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },
  {
    id: "relation_end",
    name: "结束关系",
    category: "关系",
    icon: "💔",
    description: "面对一段不再成长的关系，判断是否该按下止损键。",
    questions: [
      { id: "relation_end_q1", text: "我非常清楚结束这段关系能给我的身心健康和未来带来什么价值。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "relation_end_q2", text: "我对关系结束后的孤独感、社交变化和情绪反扑有充分预期。", dimension: "心理预期维度", weight: 0.17, risk: 0.4 },
      { id: "relation_end_q3", text: "现在结束是止损的最佳时机，拖延会让伤害进一步加深。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "relation_end_q4", text: "我能接受结束带来的社会评价、共同朋友选择和现实分割。", dimension: "心理预期维度", weight: 0.17, risk: 0.55 },
      { id: "relation_end_q5", text: "如果继续维持，未来我大概率会后悔浪费更多时间和感情。", dimension: "稀缺性维度", weight: 0.17, risk: 0.6 },
      { id: "relation_end_q6", text: "这段关系已经违背了我对尊重、信任和成长的基本需求。", dimension: "价值观维度", weight: 0.17, risk: 0.65 }
    ]
  },

  // ==================== 5. 职业领域 (Career) ==================== //
  {
    id: "career_hop",
    name: "跳槽跃迁",
    category: "职业",
    icon: "🚀",
    description: "新机会摆在面前，是由于平台更替还是能力增长？",
    questions: [
      { id: "career_jobhop_q1", text: "我非常清楚跳槽能给我的职业和生活带来什么样的核心价值。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "career_jobhop_q2", text: "我对新公司的文化、氛围和工作强度有清晰且客观的预期。", dimension: "心理预期维度", weight: 0.17, risk: 0.45 },
      { id: "career_jobhop_q3", text: "这个offer提供的薪资和发展空间是目前市场上极具稀缺性的。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "career_jobhop_q4", text: "我能接受跳槽后可能面临的不适应、绩效压力和试用期风险。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "career_jobhop_q5", text: "如果现在不走，未来我大概率会后悔错过这个跃迁窗口。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "career_jobhop_q6", text: "这个选择符合我的长期职业锚和自我价值实现目标。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },
  {
    id: "career_startup",
    name: "辞职创业",
    category: "职业",
    icon: "🛠️",
    description: "从受雇到自主创业，不仅仅是职业变更，更是生活方式的切换。",
    questions: [
      { id: "career_startup_q1", text: "我非常清楚创业能给我的人生和事业带来什么样的核心价值。", dimension: "价值观维度", weight: 0.17, risk: 0.4 },
      { id: "career_startup_q2", text: "我对创业可能面临的失败、债务和巨大精神压力有充分准备。", dimension: "心理预期维度", weight: 0.17, risk: 0.45 },
      { id: "career_startup_q3", text: "我已经有了核心专长或资源，这不是一次仅凭冲动的赌博。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "career_startup_q4", text: "我能接受创业失败带来的经济损失、时间浪费和家庭影响。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "career_startup_q5", text: "如果现在不尝试，未来我大概率会后悔从未真正主宰过事业。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "career_startup_q6", text: "即使创业失败，这段经历本身也是我人生简历中极具价值的财富。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  },
  {
    id: "career_side",
    name: "副业投入",
    category: "职业",
    icon: "📅",
    description: "在主业之外开启第二曲线，是精力透支还是未来保险？",
    questions: [
      { id: "career_side_q1", text: "我非常清楚副业投入能给我的收入、成长和安全感带来什么价值。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "career_side_q2", text: "我对副业占用的休息时间、精力透支和生活质量下降有预期。", dimension: "心理预期维度", weight: 0.17, risk: 0.4 },
      { id: "career_side_q3", text: "现在开始做副业的时机是合适的，错过了该领域的红利期会很难。", dimension: "稀缺性维度", weight: 0.17, risk: 0.5 },
      { id: "career_side_q4", text: "我能平衡好主副业关系，避免对现有工作稳定性和声誉造成负面影响。", dimension: "心理预期维度", weight: 0.17, risk: 0.55 },
      { id: "career_side_q5", text: "如果现在不开启『B计划』，未来主业出现危机时我会后悔没留退路。", dimension: "稀缺性维度", weight: 0.17, risk: 0.6 },
      { id: "career_side_q6", text: "副业方向与我的天赋、技能和市场真实需求的匹配度非常高。", dimension: "价值观维度", weight: 0.17, risk: 0.65 }
    ]
  },

  // ==================== 6. 精神领域 (Spirit) ==================== //
  {
    id: "spirit_faith",
    name: "信仰皈依",
    category: "精神",
    icon: "🧘",
    description: "涉及深层世界观与生命终极归宿的重大精神转向。",
    questions: [
      { id: "spirit_faith_q1", text: "这一信仰/精神路径与我内心最底层的生命哲学和道德感高度契合。", dimension: "价值观维度", weight: 0.17, risk: 0.35 },
      { id: "spirit_faith_q2", text: "我对皈依后可能面临的生活方式改变、社交圈更迭以及他人的误解有充分准备。", dimension: "心理预期维度", weight: 0.17, risk: 0.5 },
      { id: "spirit_faith_q3", text: "这一特定的精神路径或社群提供了我在其他地方未曾发现的、对灵魂成长的独特价值。", dimension: "稀缺性维度", weight: 0.17, risk: 0.55 },
      { id: "spirit_faith_q4", text: "我能够接受并践行这一信仰所要求的戒律、仪式或精神约束。", dimension: "心理预期维度", weight: 0.17, risk: 0.6 },
      { id: "spirit_faith_q5", text: "如果现在不做出正式的承诺或连接，我会感到生命在精神层面错失了核心锚点。", dimension: "稀缺性维度", weight: 0.17, risk: 0.65 },
      { id: "spirit_faith_q6", text: "这一决定完全基于我长期的内在共鸣，而非外界压力或暂时的情感冲动。", dimension: "价值观维度", weight: 0.17, risk: 0.7 }
    ]
  }
];

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find(s => s.id === id);
}
