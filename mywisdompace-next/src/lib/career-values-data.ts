// ==================== 生涯价值观测评数据层 ==================== //
import type { CareerValue, ValueConflict, CareerValuesReport, ValueInterpretation } from '@/types/career-values';

// ==================== 14个职业价值观 ==================== //

export const CAREER_VALUES: CareerValue[] = [
  // ── 内在回报 ──
  {
    id: 'achievement',
    name: '成就感',
    shortName: '成就感',
    description: '能够看到自己工作的成果，感受到努力得到了回报。你享受"把事情做成"的感觉，愿意为有挑战性的目标付出努力，希望自己的工作是有意义的、能带来可见的进步。',
    icon: '🏆',
    category: '内在回报',
  },
  {
    id: 'creativity',
    name: '追求新意',
    shortName: '追求新意',
    description: '工作中能够发挥想象力和创造力，不断尝试新的方法和思路。你不喜欢日复一日的重复，渴望在工作中表达独特性，享受"从零到一"的过程。',
    icon: '🎨',
    category: '内在回报',
  },
  {
    id: 'independence',
    name: '独立性',
    shortName: '独立',
    description: '能够以自己的方式工作，自主决定工作节奏和方法。你不喜欢被微观管理，希望有足够的自由度来安排自己的时间和工作方式，"按自己的方式做事"对你来说很重要。',
    icon: '🕊️',
    category: '内在回报',
  },
  {
    id: 'altruism',
    name: '利他主义',
    shortName: '利他',
    description: '工作能够帮助他人、对社会有积极影响。你希望自己的工作不仅是为了赚钱，而是能让别人的生活变得更好，"做有意义的事"比"做赚钱的事"更让你满足。',
    icon: '🤝',
    category: '内在回报',
  },
  {
    id: 'intellectual-stimulation',
    name: '智力刺激',
    shortName: '智力刺激',
    description: '工作能够持续挑战你的思维，让你不断学习和成长。你享受解决复杂问题的过程，讨厌简单重复的劳动，"大脑被激活"的感觉比"轻松完成"更有吸引力。',
    icon: '🧠',
    category: '内在回报',
  },
  {
    id: 'aesthetics',
    name: '美感',
    shortName: '美感',
    description: '工作环境、工作内容或产出具有美的品质——视觉、感官或创造上的美。你追求工作中能感受到的审美愉悦，无论是设计、艺术、文字还是其他形式的表达，"好看、有质感、令人愉悦的工作"对你而言不是锦上添花，而是基本需求。',
    icon: '🎭',
    category: '内在回报',
  },
  // ── 外在条件 ──
  {
    id: 'economic-return',
    name: '经济报酬',
    shortName: '经济报酬',
    description: '工作能够提供优厚的薪资和物质回报。你看重收入水平、福利待遇和财务安全感，认为"合理的物质回报"是对努力的基本尊重，经济自由也是实现其他价值的基础。',
    icon: '💰',
    category: '外在条件',
  },
  {
    id: 'security',
    name: '安全感',
    shortName: '安全感',
    description: '工作稳定、有保障，不用担心突然失业或收入骤降。你偏好有明确规则和预期的工作环境，"知道明天会怎样"比"一切皆有可能"更让你安心。',
    icon: '🏠',
    category: '外在条件',
  },
  {
    id: 'comfort',
    name: '舒适环境',
    shortName: '舒适',
    description: '工作环境舒适、条件优越，工作强度合理。你不喜欢过度加班或高压环境，希望工作与生活之间有良好的平衡，"舒服地工作"对你来说不是奢侈而是基本需求。',
    icon: '🛋️',
    category: '外在条件',
  },
  {
    id: 'prestige',
    name: '声望地位',
    shortName: '声望',
    description: '工作能带来社会认可、职业声望和地位提升。你希望自己的职业在他人眼中有分量，"被人尊重"和"有影响力"对你很重要，职位头衔和社会评价是你衡量成功的标尺之一。',
    icon: '👑',
    category: '外在条件',
  },
  {
    id: 'management',
    name: '管理',
    shortName: '管理',
    description: '能够领导和管理团队，对资源和决策有影响力。你享受"掌舵"的感觉，愿意承担更大的责任，"由我来决定方向"比"执行别人的决定"更让你有动力。',
    icon: '📋',
    category: '外在条件',
  },
  // ── 人际关系 ──
  {
    id: 'relationships',
    name: '人际关系',
    shortName: '人际关系',
    description: '工作中能与同事建立真诚友好的关系、与上级保持良性互动。团队氛围融洽，上下级之间有信任和尊重。"和喜欢的人一起做事""被看见和支持"都是你在职场的重要能量来源。',
    icon: '💛',
    category: '人际关系',
  },
  {
    id: 'social-interaction',
    name: '社会交往',
    shortName: '社交',
    description: '工作中有机会接触不同的人、参与社交活动、建立广泛的人际网络。你享受与人交流的过程，希望工作不只是面对屏幕或机器，而是能不断认识新朋友、拓展人脉、在互动中获得信息和能量。',
    icon: '🌐',
    category: '人际关系',
  },
  {
    id: 'wellbeing',
    name: '身心健康',
    shortName: '身心健康',
    description: '工作不会严重损害身心健康，有合理的工作节奏和恢复空间。你认为"健康是1，其他是后面的0"，不愿意为了任何职业目标牺牲身体和心理的健康。',
    icon: '🧘',
    category: '人际关系',
  },
];

// ==================== 6组价值观冲突对 ==================== //

export const VALUE_CONFLICTS: ValueConflict[] = [
  {
    left: 'economic-return',
    right: 'independence',
    reason: '高收入往往意味着承担更多责任、接受更多约束——老板付你更多，也往往要求你更听话。真正自由的工作方式，收入天花板可能更低。',
  },
  {
    left: 'comfort',
    right: 'creativity',
    reason: '创新和突破几乎不会在舒适区里发生。追求新鲜体验意味着面对不确定和风险，而舒适环境恰恰是它的反面。',
  },
  {
    left: 'prestige',
    right: 'wellbeing',
    reason: '地位越高，压力越大——这是职场的基本规律。攀登金字塔意味着牺牲休息、承受焦虑，身体和心理的账单迟早会来。',
  },
  {
    left: 'altruism',
    right: 'economic-return',
    reason: '帮助他人的工作（教育、公益、社工）往往不是高薪领域，而追逐高回报的行业（金融、商业）通常以利润而非善意为导向。两者很难兼得。',
  },
  {
    left: 'management',
    right: 'independence',
    reason: '管理意味着对他人负责、协调各方需求，你的时间不再只属于自己。越是管人，越没有"以自己的方式做事"的自由。',
  },
];

// ==================== 造句引导 ==================== //

export const SENTENCE_TEMPLATE = '我期望理想的职业或工作形态是____，它能让我____，同时____，这样我就能____';

export const CONNECTORS = ['因此', '从而', '使得', '在...的同时', '不仅...还', '因为', '所以'];

// ==================== 工具函数 ==================== //

/** 根据id获取价值观 */
export function getValueById(id: string): CareerValue | undefined {
  return CAREER_VALUES.find(v => v.id === id);
}

/** 根据id列表获取价值观列表 */
export function getValuesByIds(ids: string[]): CareerValue[] {
  return ids.map(id => getValueById(id)).filter(Boolean) as CareerValue[];
}

/** 检测价值观冲突 */
export function detectConflicts(ranked3: [string, string, string]): ValueConflict[] {
  const selected = new Set(ranked3);
  return VALUE_CONFLICTS.filter(
    c => (selected.has(c.left) && selected.has(c.right))
  );
}

/** 生成价值观解读 */
function generateInterpretation(id: string, rank: 1 | 2 | 3): ValueInterpretation {
  const v = getValueById(id);
  if (!v) return { id, name: id, rank, role: '', interpretation: '' };

  const roleMap: Record<number, string> = { 1: '核心驱动力', 2: '重要支撑', 3: '潜在需求' };
  const role = roleMap[rank];

  const interpretations: Record<string, Record<number, string>> = {
    achievement: {
      1: '成就感是你最核心的职业驱动力。你渴望看到自己努力的成果，需要"做成了"的反馈来维持动力。如果工作长期看不到成效，你会感到强烈的不满和疲惫。选择职业时，优先考虑那些有明确产出和里程碑的岗位。',
      2: '成就感是你职业满足感的重要支柱。你希望努力有所回报，但并非唯一驱动力。当成就感与其他价值观结合时，你的职业选择会更加稳健。',
      3: '成就感在你的价值体系中起着补充作用。它不是你最看重的，但在其他核心需求得到满足时，成就感会让你的工作体验更加充实。',
    },
    creativity: {
      1: '追求新意是你最核心的职业驱动力。你天生需要创造和变化，重复和循规蹈矩会让你迅速失去动力。最适合你的工作，是那些能持续给你发挥想象力空间的环境。',
      2: '追求新意是你职业满足感的重要来源。你欣赏工作中的创新机会，但也能在一定程度上接受常规事务。关键是保持一定比例的创新空间。',
      3: '追求新意在你内心有一定的需求。你可能不会主动追求颠覆性变化，但偶尔的变化和创新会让你的工作更有活力。',
    },
    independence: {
      1: '独立性是你最核心的职业需求。你无法忍受被过度管控，"按自己的方式做事"对你来说不是偏好而是底线。最适合你的，是那些给予高度自主权的工作形态——自由职业、远程办公、或高度授权的岗位。',
      2: '独立性是你职业选择的重要考量。你需要在工作中有足够的自主空间，但也能接受适度的框架和协作。关键是找到"有边界但有弹性"的工作方式。',
      3: '独立性在你内心有一定需求。你并非强烈渴望完全自主，但希望在某些方面能有自己的决策空间。当其他核心需求满足后，适当的自主权会让你更舒服。',
    },
    altruism: {
      1: '利他主义是你最核心的价值取向。你工作的最大动力来自"帮助他人"和"对社会有积极影响"。纯粹的利润驱动会让你感到空虚。最适合你的，是那些直接服务他人或推动社会进步的职业。',
      2: '利他主义是你价值观的重要支柱。你希望工作有意义，但也不排斥其他方面的回报。当"做有意义的事"和"获得合理回报"能够兼顾时，你的职业满意度最高。',
      3: '利他主义在你内心有一定影响力。它不是你最核心的驱动力，但在职业选择中你会考虑工作的社会价值。当其他需求满足后，帮助他人会让你的工作更有意义感。',
    },
    'intellectual-stimulation': {
      1: '智力刺激是你最核心的职业驱动力。你需要不断面对新的思维挑战，解决复杂问题是你的乐趣所在。简单重复的工作会让你感到窒息。最适合你的，是那些需要深度思考和持续学习的领域。',
      2: '智力刺激是你职业满足感的重要来源。你享受有挑战性的工作，但也能在日常任务中找到节奏。关键是保持一定比例的深度思考时间。',
      3: '智力刺激在你内心有一定的需求。你不一定追求最高难度的挑战，但希望工作中能有让你思考和学习的机会。当其他核心需求满足后，适度的智力刺激会让工作更有趣。',
    },
    'aesthetics': {
      1: '美感是你最核心的职业需求。你追求工作中的审美品质——无论是视觉、感官还是创造上的美。工作环境是否好看、产出是否有质感，对你来说不是锦上添花而是基本要求。你可能在设计、艺术、创意等领域最有归属感。',
      2: '美感是你职业满意度的重要因素。你欣赏有质感的工作环境和内容，但也能在功能优先的环境中找到平衡。关键是保留一定的审美空间和创造自由度。',
      3: '美感在你内心有一定分量。你不追求极致的审美体验，但也不希望工作环境粗糙乏味。当其他核心需求满足后，工作中美的元素会让你更有愉悦感和创造力。',
    },
    'economic-return': {
      1: '经济报酬是你最核心的职业考量。你看重收入水平，认为财务自由是其他一切价值实现的基础。你愿意为此承受更高的压力和约束。选择职业时，薪资和福利是你最优先考虑的因素。',
      2: '经济报酬是你职业选择的重要标准。你希望获得与努力匹配的回报，但并非唯一衡量标准。当薪资达到一定水平后，其他价值观会开始发挥更大的影响。',
      3: '经济报酬在你内心有一定分量。它不是你最重要的考量，但也不会被忽视。当其他核心需求满足后，合理的物质回报会让你的职业生活更加安心。',
    },
    security: {
      1: '安全感是你最核心的职业需求。你需要稳定的工作环境和可预期的未来，不确定性和风险会让你焦虑。最适合你的，是那些制度完善、流程规范的组织和岗位。',
      2: '安全感是你职业选择的重要考量。你偏好稳定的环境，但也能在适度不确定中找到节奏。关键是确保最基本的安全感不被打破。',
      3: '安全感在你内心有一定的需求。你并非强烈追求绝对稳定，但也不喜欢过于动荡的环境。当其他核心需求满足后，一定程度的稳定会让你更从容。',
    },
    comfort: {
      1: '舒适环境是你最核心的职业需求。你拒绝"拿命换钱"的模式，相信"舒服地工作"才是可持续的。你愿意为了更好的工作环境和更合理的工作节奏，放弃一些收入或地位。',
      2: '舒适环境是你职业满意度的重要来源。你希望工作条件合理、节奏适度，但也能在必要时承受一些压力。关键是不能长期处于高压和不舒适的状态。',
      3: '舒适环境在你内心有一定的需求。你不追求极致的舒适，但也不希望工作环境过于恶劣。当其他核心需求满足后，适当的工作舒适度会让你的职业体验更好。',
    },
    prestige: {
      1: '声望地位是你最核心的职业驱动力。你需要被社会认可、被他人尊重，职位头衔和行业影响力是你衡量自我价值的重要标尺。你愿意为此付出更多的努力和承受更大的压力。',
      2: '声望地位是你职业选择的重要考量。你希望自己的职业有分量，但不是唯一的追求。当声望与其他价值观能兼顾时，你的职业满意度最高。',
      3: '声望地位在你内心有一定影响。它不是你最看重的，但在职业选择中会考虑社会评价。当其他核心需求满足后，适度的社会认可会让你更有成就感。',
    },
    management: {
      1: '管理是你最核心的职业追求。你享受领导团队、做出决策、影响他人的感觉。"由我来掌舵"比"执行别人的决定"更能激发你的热情。最适合你的，是那些能持续扩大管理范围和影响力的岗位。',
      2: '管理是你职业发展的重要方向。你有领导意愿，但也重视其他方面的价值。当管理职责与其他价值观能平衡时，你的职业体验最佳。',
      3: '管理在你内心有一定的吸引力。你不一定强烈渴望领导角色，但在合适的机会下愿意承担管理责任。当其他核心需求满足后，适度的管理权限会让你更有影响力。',
    },
    relationships: {
      1: '人际关系是你最核心的职业需求。你工作的幸福感很大程度来自"和谁一起做事"。融洽的团队关系、真诚的同事友谊是你持续投入的动力。如果团队氛围糟糕，再好的薪资和机会你也难以忍受。',
      2: '人际关系是你职业满意度的重要来源。你重视工作中的社交联结，但也能在必要时独立工作。关键是团队中至少有几个合得来的伙伴。',
      3: '人际关系在你内心有一定分量。你并非强烈依赖团队社交，但也不喜欢完全孤立的工作环境。当其他核心需求满足后，良好的同事关系会让工作更愉快。',
    },
    'social-interaction': {
      1: '社会交往是你最核心的职业需求。你天生需要与人互动，工作对你而言不只是完成任务，更是认识人、连接人的过程。你无法忍受长期孤立的工作环境，最适合你的，是那些需要频繁沟通、协作、面对客户或公众的岗位。',
      2: '社会交往是你职业满意度的重要因素。你欣赏工作中的人际接触机会，但也能在需要专注的时候独处工作。关键是保持一定比例的社交互动。',
      3: '社会交往在你内心有一定的需求。你不追求极致热闹的工作环境，但也不希望完全与外界隔绝。当其他核心需求满足后，适当的社交互动会让你的工作更有活力和归属感。',
    },
    wellbeing: {
      1: '身心健康是你最核心的职业底线。你坚信"健康是1，其他是后面的0"，任何损害身心健康的工作都不在你的考虑范围内。你愿意为此放弃收入、地位、甚至发展机会。',
      2: '身心健康是你职业选择的重要考量。你关注工作对身心的影响，但也能在必要时承受一定压力。关键是不能长期处于损害健康的工作状态。',
      3: '身心健康在你内心有一定的分量。你不追求绝对的"佛系"工作，但也不希望工作严重损害健康。当其他核心需求满足后，合理的工作节奏会让你更安心。',
    },
  };

  return {
    id,
    name: v.name,
    rank,
    role,
    interpretation: interpretations[id]?.[rank] ?? `${v.name}在你的价值观中排名第${rank}。`,
  };
}

/** 生成综合分析文字 */
function generateOverallAnalysis(
  ranked3: [string, string, string],
  sentence: string,
  realityScore: number,
  conflicts: ValueConflict[],
): string {
  const v1 = getValueById(ranked3[0]);
  const v2 = getValueById(ranked3[1]);
  const v3 = getValueById(ranked3[2]);
  const names = [v1?.name, v2?.name, v3?.name].filter(Boolean);

  let analysis = '';

  // 价值观体系总结
  const categories = [v1?.category, v2?.category, v3?.category].filter(Boolean) as string[];
  const uniqueCategories = [...new Set(categories)];

  if (uniqueCategories.length === 1) {
    analysis += `你的核心价值观高度集中在"${uniqueCategories[0]}"领域——${names.join('、')}都指向同一方向。这说明你在职业选择上有非常清晰和统一的倾向，但也要注意可能忽略了其他维度的需求。`;
  } else if (uniqueCategories.length === 3) {
    const catStr = uniqueCategories.map(c => `"${c}"`).join('、').replace(/、([^、]*)$/, '和$1');
    analysis += `你的核心价值观横跨了${catStr}三个维度——${names.join('、')}构成了一个多元的价值体系。这说明你在职业选择上追求全面满足，但也可能面临不同需求之间的拉扯。`;
  } else {
    const catStr = uniqueCategories.map(c => `"${c}"`).join('和');
    analysis += `你的核心价值观分布在${catStr}两个维度——${names.join('、')}形成了一个有重点但不偏废的价值体系。这种组合通常意味着你在职业选择上既有明确的优先级，也兼顾了不同方面的需求。`;
  }

  analysis += '\n\n';

  // 冲突提醒
  if (conflicts.length > 0) {
    analysis += '⚠️ 需要注意的价值观张力：\n';
    conflicts.forEach((c, i) => {
      const lv = getValueById(c.left);
      const rv = getValueById(c.right);
      analysis += `${i + 1}. ${lv?.name} ↔ ${rv?.name}：${c.reason}\n`;
    });
    analysis += '\n好的价值观陈述不是许愿清单，而是你愿意为之付出代价的选择。冲突本身不是问题——不知道自己在做取舍才是。\n\n';
  }

  // 现实锚定
  if (realityScore <= 2) {
    analysis += '你的自我评估分数较低，说明你对自己造句中的描述还不太确信。这可能意味着你的价值观还在形成过程中，或者你发现自己在描述"理想"而非"真实选择"。建议重新审视——真正重要的东西，是你愿意为之放弃其他的那种。';
  } else if (realityScore >= 4) {
    analysis += `你的自我评估分数较高，说明你对"${names.join('、')}"这组价值观有较强的确信度。这是一个好迹象——它意味着你的选择是经过深思熟虑的，而非随波逐流。接下来的挑战是：如何在现实职业中，为这些价值观找到着陆点。`;
  } else {
    analysis += `你对这组价值观的确信度处于中间水平。这很正常——价值观澄清本就是一个渐进的过程。建议你多留意日常决策中的倾向：你实际做出的选择，往往比你以为的更能说明你真正看重什么。`;
  }

  return analysis;
}

/** 生成完整报告 */
export function generateReport(
  selected8: string[],
  ranked3: [string, string, string],
  sentence: string,
  realityScore: number,
): CareerValuesReport {
  const allIds = CAREER_VALUES.map(v => v.id);
  const from14to8 = allIds.filter(id => !selected8.includes(id));
  const from8to3 = selected8.filter(id => !ranked3.includes(id));

  const conflicts = detectConflicts(ranked3);

  const coreValues: ValueInterpretation[] = ranked3.map((id, idx) =>
    generateInterpretation(id, (idx + 1) as 1 | 2 | 3),
  );

  const overallAnalysis = generateOverallAnalysis(ranked3, sentence, realityScore, conflicts);

  return {
    coreValues,
    eliminatedPath: { from14to8, from8to3 },
    sentence,
    realityScore,
    detectedConflicts: conflicts,
    overallAnalysis,
    completedAt: new Date().toISOString(),
  };
}

/** 导出Markdown报告 */
export function exportMarkdown(report: CareerValuesReport): string {
  let md = '# 生涯价值观测评报告\n\n';
  md += `- 测评日期：${new Date(report.completedAt).toLocaleDateString('zh-CN')}\n\n`;

  md += '## 核心价值观\n\n';
  report.coreValues.forEach(v => {
    md += `### ${v.rank === 1 ? '🥇' : v.rank === 2 ? '🥈' : '🥉'} 第${v.rank}位：${v.name}（${v.role}）\n\n`;
    md += `${v.interpretation}\n\n`;
  });

  md += '## 造句回顾\n\n';
  md += `> ${report.sentence}\n\n`;

  md += `## 现实锚定评分：${report.realityScore}/5\n\n`;

  if (report.detectedConflicts.length > 0) {
    md += '## ⚠️ 价值观张力提醒\n\n';
    report.detectedConflicts.forEach((c, i) => {
      const lv = getValueById(c.left);
      const rv = getValueById(c.right);
      md += `${i + 1}. **${lv?.name} ↔ ${rv?.name}**：${c.reason}\n\n`;
    });
  }

  md += '## 综合分析\n\n';
  md += report.overallAnalysis.replace(/\n/g, '  \n');
  md += '\n';

  return md;
}
