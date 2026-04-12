// ==================== 人生角色饼图数据层 ==================== //
import type {
  PresetRole,
  RoleAssessment,
  RolePieChartReport,
  DeviationItem,
  CoreRoleInterpretation,
  LowIdentityAlert,
} from '@/types/role-pie-chart';

// ==================== 预置角色（20个，3类） ==================== //

export const PRESET_ROLES: PresetRole[] = [
  // ── 家庭 ──
  {
    id: 'mother',
    name: '母亲',
    description: '承担生育和养育子女的责任，给予孩子情感支持和照顾。',
    icon: '👩',
    category: '家庭',
  },
  {
    id: 'father',
    name: '父亲',
    description: '承担养育和保护子女的责任，给予家庭方向感和支持。',
    icon: '👨',
    category: '家庭',
  },
  {
    id: 'child-son',
    name: '儿子',
    description: '作为男性子女，承担对父母的陪伴、赡养和情感支持。',
    icon: '🧑',
    category: '家庭',
  },
  {
    id: 'child-daughter',
    name: '女儿',
    description: '作为女性子女，承担对父母的陪伴、赡养和情感支持。',
    icon: '👧',
    category: '家庭',
  },
  {
    id: 'spouse',
    name: '配偶/伴侣',
    description: '与伴侣共同经营亲密关系，承担情感陪伴和相互支持的责任。',
    icon: '💑',
    category: '家庭',
  },
  {
    id: 'grandchild',
    name: '孙辈',
    description: '作为祖父母或外祖父母的孙辈，传承家庭纽带。',
    icon: '👶',
    category: '家庭',
  },
  {
    id: 'sibling',
    name: '兄弟姐妹',
    description: '与同胞之间的相互陪伴、支持和竞争关系。',
    icon: '👫',
    category: '家庭',
  },
  {
    id: 'caregiver',
    name: '照顾者',
    description: '长期照料家庭中需要帮助的成员（老人、病患、残障人士）。',
    icon: '🫂',
    category: '家庭',
  },
  {
    id: 'daughter-in-law',
    name: '儿媳/女婿',
    description: '融入对方家庭，承担新家庭角色的责任与义务。',
    icon: '🤱',
    category: '家庭',
  },
  // ── 工作 ──
  {
    id: 'subordinate',
    name: '下属/员工',
    description: '在组织中接受上级领导，完成工作任务并寻求发展。',
    icon: '📎',
    category: '工作',
  },
  {
    id: 'team-leader',
    name: '团队领导',
    description: '对团队成员的工作方向和成果负责，协调资源和决策。',
    icon: '📋',
    category: '工作',
  },
  {
    id: 'client-contact',
    name: '甲方客户',
    description: '代表公司与客户沟通，理解需求并推动合作达成。',
    icon: '🤝',
    category: '工作',
  },
  {
    id: 'vendor',
    name: '供应商/合作方',
    description: '为他人或组织提供产品或服务，建立商业合作关系。',
    icon: '📦',
    category: '工作',
  },
  {
    id: 'freelancer',
    name: '自由职业者/创业者',
    description: '自主经营、以自己的专业能力为客户提供价值。',
    icon: '🚀',
    category: '工作',
  },
  {
    id: 'mentor',
    name: '导师/师傅',
    description: '将经验和知识传授给他人，指导后辈成长和发展。',
    icon: '🏫',
    category: '工作',
  },
  // ── 社交 ──
  {
    id: 'friend',
    name: '朋友',
    description: '与志同道合的人建立真诚的友谊，彼此陪伴和支持。',
    icon: '🍻',
    category: '社交',
  },
  {
    id: 'club-member',
    name: '社团成员/骨干',
    description: '在兴趣社团或组织中承担一定职责，推动共同活动。',
    icon: '🏅',
    category: '社交',
  },
  {
    id: 'volunteer',
    name: '志愿者',
    description: '无偿为社会或他人提供服务，不求物质回报。',
    icon: '🌍',
    category: '社交',
  },
  {
    id: 'neighbor',
    name: '邻居',
    description: '与周边社区的人建立日常互助，守望相邻。',
    icon: '🏡',
    category: '社交',
  },
  {
    id: 'learner',
    name: '学习者/学生',
    description: '持续学习和自我提升，主动探索新知识和技能。',
    icon: '📖',
    category: '社交',
  },
  {
    id: 'citizen',
    name: '公民',
    description: '作为社会成员，享有权利并承担公民义务。',
    icon: '🌐',
    category: '社交',
  },
];

// ==================== 工具函数 ==================== //

/** 根据id获取预置角色 */
export function getPresetRoleById(id: string): PresetRole | undefined {
  return PRESET_ROLES.find(r => r.id === id);
}

/** 将所有角色转为评估数据对象（初始化） */
export function initAssessment(roles: { id: string; name: string }[]): RoleAssessment[] {
  return roles.map(r => ({
    roleId: r.id,
    name: r.name,
    importance: 0,
    coreRank: 0,
    hoursPerWeek: 0,
  }));
}

// ==================== 偏差分析 ==================== //

function analyzeDeviations(assessments: RoleAssessment[]): DeviationItem[] {
  const result: DeviationItem[] = [];
  const totalHours = assessments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

  assessments.forEach(a => {
    if (a.importance === 0) return; // 未评分跳过

    const timePercent = totalHours > 0 ? (a.hoursPerWeek / totalHours) * 100 : 0;
    // 重要性归一化到 0-100（1→20, 5→100）
    const importancePercent = a.importance * 20;
    const gap = importancePercent - timePercent;

    let type: DeviationItem['type'] = 'balanced';
    let analysis = '';

    if (gap > 30) {
      type = 'underinvested';
      analysis = `你对这个角色重视程度很高（${a.importance}分），但每周仅投入约${a.hoursPerWeek}小时（占比${timePercent.toFixed(0)}%）。这是你生活中的"隐性缺口"——你重视它，却没有给它足够的时间。`;
    } else if (gap < -30) {
      type = 'overinvested';
      analysis = `你在这个角色上投入了大量时间（${a.hoursPerWeek}小时/周，占比${timePercent.toFixed(0)}%），但重视程度相对较低（${a.importance}分）。你可能在为"别人的期待"而非"自己的价值"付出。`;
    }

    result.push({ ...a, timePercent, type, analysis });
  });

  return result.sort((a, b) => b.importance - a.importance);
}

// ==================== 核心角色深度解读 ==================== //

function generateCoreRoleInterpretation(
  assessment: RoleAssessment,
  rank: 1 | 2 | 3,
  totalHours: number,
): CoreRoleInterpretation {
  const timePercent = totalHours > 0 ? (assessment.hoursPerWeek / totalHours) * 100 : 0;
  // 反转：排名越靠前星越多（第一核心3颗、第二核心2颗、第三核心1颗）
  const stars = '⭐'.repeat(4 - rank);

  // 根据排名和投入生成不同深度的解读
  const baseInterpretation: Record<number, string> = {
    1: `「${assessment.name}」是你人生中最重要的角色——没有任何其他角色比它更贴近你的核心。这个角色代表了最真实的你，或是你最渴望活成的样子。它可能已经成为你身份认同的基石，不只是"做什么"，而是"是谁"的问题。`,
    2: `「${assessment.name}」在你的生命中扮演着关键支撑角色，与第一核心角色共同构成你身份的核心支柱。它可能是你在日常中最常"切换到"的状态，是你安全感或成就感的重要来源。`,
    3: `「${assessment.name}」是你第三核心的角色，是你身份版图中不可或缺的补充。它可能在某些特定场景下才被激活，但一旦被需要，你愿意为它付出大量心血。`,
  };

  // 补充投入分析
  let investmentNote = '';
  if (assessment.hoursPerWeek === 0) {
    investmentNote = '\n\n⚠️ 值得注意的是：你在"重视程度"上给了它最高分，但在时间投入上却是空白。这可能意味着：这个角色对你很重要，但你目前没有条件好好投入它——或者，它在"内心深处"而非"实际生活"中更重要。';
  } else if (assessment.coreRank > 0 && assessment.importance * 20 - timePercent > 25) {
    investmentNote = '\n\n⚠️ 重视程度和实际投入之间存在明显落差。你看重这个角色，但现实生活还没有给它足够的空间。这值得你认真思考。';
  }

  return {
    roleId: assessment.roleId,
    name: assessment.name,
    rank,
    stars,
    importance: assessment.importance,
    hoursPerWeek: assessment.hoursPerWeek,
    timePercent,
    interpretation: baseInterpretation[rank] + investmentNote,
  };
}

// ==================== 极端情况分析 ==================== //

function analyzeExtremeSituation(
  assessments: RoleAssessment[],
): { alert: LowIdentityAlert; extremeAnalysis: string } {
  const hasCore = assessments.filter(a => a.coreRank > 0).length;
  const hasHours = assessments.filter(a => a.hoursPerWeek > 0).length;

  if (hasCore >= 2 || hasHours >= 2) {
    return {
      alert: { triggered: false, roleCount: hasHours, message: '' },
      extremeAnalysis: '',
    };
  }

  const alert: LowIdentityAlert = {
    triggered: true,
    roleCount: hasHours,
    message: `你目前填写的角色数量较少（${hasHours}个有实际投入的角色）。这可能是因为你正处在人生的特殊阶段，也可能是因为社会角色对你而言本身就不那么重要。无论哪种情况，都值得你花一点时间思考：在这些角色之外，是否还有未被提及的身份？`,
  };

  let extremeAnalysis = '';
  if (hasHours === 0) {
    extremeAnalysis = `你目前没有填写任何有实际时间投入的角色。这可能意味着：\n\n1. 你正处于人生的"角色真空期"——也许是刚结束某个阶段，还没进入下一个；也许是刻意选择了简约的生活方式。\n\n2. 你可能有尚未发现的自我身份。你不只是"某个职业"或"某个家庭成员"——你还有兴趣、热情、和那些还没有被贴上标签的渴望。\n\n3. 也可能，你的社会身份在传统意义上较为有限，但这不代表你没有身份——你的存在本身就是一个身份。\n\n💡 建议：尝试探索一些"为自己而活"的角色，比如"学习者"、"创作者"、"探索者"——它们不需要任何人认证，只需要你自己认可。`;
  } else if (hasHours === 1) {
    const soleRole = assessments.find(a => a.hoursPerWeek > 0);
    extremeAnalysis = `你的生活目前主要围绕"${soleRole?.name ?? '这唯一'}"这一个角色展开。这是一种高度集中的生活形态，可能出现在：全职照顾家庭的阶段、专注于创业的早期、或在某个人生使命非常明确的时期。\n\n💡 建议：问问自己——除了这个角色之外，你是谁？这个问题没有"正确答案"，但它可能帮助你发现生活中一些被忽视的维度，而这些维度，往往是长期幸福感的来源。`;
  } else {
    extremeAnalysis = `你填写的角色数量较少。每个人的人生轨迹不同——有人拥有复杂的社会网络，有人则更专注于少数几个深层关系。没有哪种形态更优越，关键是：你满意现在的状态吗？`;
  }

  return { alert, extremeAnalysis };
}

// ==================== 综合洞察 ==================== //

function generateOverallInsights(assessments: RoleAssessment[], deviations: DeviationItem[]): string {
  const coreRoles = assessments.filter(a => a.coreRank > 0).sort((a, b) => a.coreRank - b.coreRank);
  const totalHours = assessments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

  const workRoles = assessments.filter(a => {
    const preset = getPresetRoleById(a.roleId);
    return preset?.category === '工作' && a.hoursPerWeek > 0;
  });
  const familyRoles = assessments.filter(a => {
    const preset = getPresetRoleById(a.roleId);
    return preset?.category === '家庭' && a.hoursPerWeek > 0;
  });
  const socialRoles = assessments.filter(a => {
    const preset = getPresetRoleById(a.roleId);
    return preset?.category === '社交' && a.hoursPerWeek > 0;
  });

  const workHours = workRoles.reduce((sum, a) => sum + a.hoursPerWeek, 0);
  const familyHours = familyRoles.reduce((sum, a) => sum + a.hoursPerWeek, 0);
  const socialHours = socialRoles.reduce((sum, a) => sum + a.hoursPerWeek, 0);

  const insights: string[] = [];

  // 角色分布洞察
  if (workHours > 0 && familyHours > 0 && socialHours > 0) {
    const workPct = ((workHours / totalHours) * 100).toFixed(0);
    const familyPct = ((familyHours / totalHours) * 100).toFixed(0);
    const socialPct = ((socialHours / totalHours) * 100).toFixed(0);
    insights.push(`你的时间分布在三大领域：工作/事业（${workPct}%）、家庭/亲密关系（${familyPct}%）、社交/社群（${socialPct}%）。这是一个相对均衡的多元结构，你的人生半径比较宽广。`);
  } else if (workHours > 0 && familyHours > 0) {
    insights.push('你的生活主要在"工作"和"家庭"两个领域之间往返——这是很多人真实的生活写照。但别忘了：你是谁的朋友？你有自己的社群和归属感吗？');
  } else if (workHours > 0 && socialHours > 0) {
    insights.push('你的生活以"工作"和"社交/社群"为主——这是一个偏向外向和成就导向的配置。家庭角色在你的时间表中可能处于次要位置，你与亲密关系的连接深度如何？');
  } else if (familyHours > 0 && socialHours > 0) {
    insights.push('你的生活以"家庭"和"社交/社群"为核心——这是一个重视关系和归属感的配置。在职场之外，你的专业能力和职业发展是否得到足够的关注？');
  } else if (workHours > 0) {
    insights.push('工作是你目前唯一有实际投入的社会角色。这可能是创业初期的专注，也可能是职场高压期的现实。无论如何，请留意：身份过度集中，意味着抗风险能力较低。');
  } else if (familyHours > 0) {
    insights.push('你目前的社会角色以家庭为主。这在某些人生阶段是完全正常的，但如果你感到身份的单薄感——也许可以尝试在工作或社群中，找到一个新的角色。');
  }

  // 核心角色洞察
  if (coreRoles.length >= 1) {
    const top = coreRoles[0];
    const topPreset = getPresetRoleById(top.roleId);
    const topCategory = topPreset?.category ?? '社会';

    if (topCategory === '家庭') {
      insights.push('你的第一核心角色来自家庭——亲密关系和血脉纽带是你最深的归属。这是一种"向内"的身份认同，你的力量源泉来自与他人的深度连接。');
    } else if (topCategory === '工作') {
      insights.push('你的第一核心角色来自工作/事业——成就和能力是你身份的核心支柱。这是一种"向外"的身份认同，你的自我价值与所做之事紧密相连。');
    } else {
      insights.push('你的第一核心角色来自社群/社交——朋友、社群、志愿者身份构成了你生命的重要部分。这是一种"关系型"的身份认同，你从与他人的互动中获得意义感。');
    }
  }

  // 偏差提醒
  const underinvested = deviations.filter(d => d.type === 'underinvested');
  const overinvested = deviations.filter(d => d.type === 'overinvested');

  if (underinvested.length > 0) {
    insights.push(`\n💡 值得关注的落差：你重视"${underinvested[0].name}"，却没有给它足够的时间。这种"高看低投"的角色如果持续存在，可能会带来长期的不满足感。`);
  }

  if (overinvested.length > 0) {
    insights.push(`\n💡 值得反思的角色：你大量时间投入在"${overinvested[0].name}"上，但它的重要性并不在你的前列。花时间之前，先想清楚：这个时间，是为谁花的？`);
  }

  return insights.join('\n\n');
}

// ==================== 饼图数据 ==================== //

function buildPieData(assessments: RoleAssessment[]): {
  importanceData: { name: string; value: number }[];
  timeData: { name: string; value: number }[];
} {
  // 过滤掉未评分的
  const valid = assessments.filter(a => a.importance > 0 || a.hoursPerWeek > 0);

  const importanceData = valid.map(a => ({
    name: a.name,
    value: a.importance,
  }));

  const totalHours = valid.reduce((sum, a) => sum + a.hoursPerWeek, 0);
  const timeData = valid.map(a => ({
    name: a.name,
    value: totalHours > 0 ? Math.round((a.hoursPerWeek / totalHours) * 100) : 0,
  }));

  return { importanceData, timeData };
}

// ==================== 主报告生成函数 ==================== //

export function generateReport(assessments: RoleAssessment[]): RolePieChartReport {
  const totalHours = assessments.reduce((sum, a) => sum + a.hoursPerWeek, 0);

  // 核心角色（按排名）
  const coreAssessments = assessments
    .filter(a => a.coreRank > 0)
    .sort((a, b) => a.coreRank - b.coreRank)
    .slice(0, 3);

  const coreRoles: CoreRoleInterpretation[] = coreAssessments.map((a, idx) =>
    generateCoreRoleInterpretation(a, (idx + 1) as 1 | 2 | 3, totalHours),
  );

  // 偏差分析
  const deviations = analyzeDeviations(assessments);

  // 极端情况
  const { alert, extremeAnalysis } = analyzeExtremeSituation(assessments);

  // 饼图数据
  const { importanceData, timeData } = buildPieData(assessments);

  // 综合洞察
  const overallInsights = generateOverallInsights(assessments, deviations);

  // 按重视程度排序
  const allRoles = [...assessments].filter(a => a.importance > 0).sort((a, b) => b.importance - a.importance);

  return {
    allRoles,
    coreRoles,
    importanceData,
    timeData,
    deviations,
    lowIdentityAlert: alert,
    extremeSituationAnalysis: extremeAnalysis,
    overallInsights,
    completedAt: new Date().toISOString(),
  };
}

// ==================== Markdown 导出 ==================== //

export function exportMarkdown(report: RolePieChartReport): string {
  let md = '# 人生角色饼图测评报告\n\n';
  md += `- 测评日期：${new Date(report.completedAt).toLocaleDateString('zh-CN')}\n\n`;

  if (report.coreRoles.length > 0) {
    md += '## 🌟 核心角色\n\n';
    report.coreRoles.forEach(r => {
      md += `### ${r.stars} ${r.name}\n\n`;
      md += `**重视程度**：${r.importance} / 5\n`;
      md += `**时间投入**：${r.hoursPerWeek} 小时/周\n\n`;
      md += `${r.interpretation}\n\n`;
    });
  }

  if (report.extremeSituationAnalysis) {
    md += '## ⚠️ 身份探索提醒\n\n';
    md += report.extremeSituationAnalysis.replace(/\n/g, '  \n') + '\n\n';
  }

  if (report.deviations.filter(d => d.type !== 'balanced').length > 0) {
    md += '## 📊 偏差分析\n\n';
    report.deviations
      .filter(d => d.type !== 'balanced')
      .forEach(d => {
        const icon = d.type === 'underinvested' ? '🔽' : '🔼';
        md += `### ${icon} ${d.name}\n\n`;
        md += `${d.analysis}\n\n`;
      });
  }

  if (report.overallInsights) {
    md += '## 💡 综合洞察\n\n';
    md += report.overallInsights.replace(/\n/g, '  \n') + '\n\n';
  }

  return md;
}
