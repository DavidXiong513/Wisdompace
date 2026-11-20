// ─────────────────────────────────────────────────────────────
// 今生称重 · 数据地基
//
// 与「来生设计」的根本差别：
//   来生 = 50 分零和分配，测的是「你愿意怎么取舍」（价值排序）
//   今生 = 八项独立自评，测的是「你现在有多少」（存量状态）
//
// 每人两问，都必答：
//   ① 现状 —— 11 档选一句最像现在的自己。初始为空，不给默认起点。
//   ② 弹性 —— 这一项往后还能往上走多少。它独立测量，不用现状倒推上限，
//      所以不会落进「用现状推上限、再用上限评价现状」的循环论证。
//
// 由此得到三个刻度（下限不展示给用户，只在报告里转成提醒）：
//   现状 score = 用户选的档位（0–10）
//   上限 cap   = score + 弹性增益，封顶 10，决定这一项的分母份额
//   下限 floor = score − 固有易退幅度，只用来生成「不管就会滑到哪」的场景句
//
// 总势用绝对存量：八项 × 十分 = 80 满分，不与来生的 50 分对齐。
// 潜力进度用区间完成度均值：在自己这一项的 floor→cap 之间走到了几成。
// ─────────────────────────────────────────────────────────────

export type AttributeKey =
  | 'looks'
  | 'wealth'
  | 'fame'
  | 'health'
  | 'intelligence'
  | 'family'
  | 'longevity'
  | 'spirituality';

/** 扁平分数字典，只给目标落差分析用（要求八项已答完） */
export type Scores = Record<AttributeKey, number>;

/** 往后还能往上走多少 */
export type Elasticity = 'high' | 'some' | 'none';

/** 说「基本就这样了」时，追问一句是哪一种「不动」 */
export type CeilingReason = 'enough' | 'stuck';

export type Entry = {
  /** null = 还没定位 */
  score: number | null;
  elasticity: Elasticity | null;
  reason: CeilingReason | null;
};

export type Assessment = Record<AttributeKey, Entry>;

export type Attribute = {
  key: AttributeKey;
  name: string;
  icon: string;
  /** 可控面：这一项真正在测什么（避免用评价性词汇制造焦虑） */
  control: string;
  /** 0–10 档的行为锚点，描述现状而非命运 */
  anchors: string[];
};

export const ATTRIBUTES: Attribute[] = [
  {
    key: 'looks',
    name: '颜值身材',
    icon: '◐',
    control: '体态、精力，以及你对自己身体的管理感',
    anchors: [
      '几乎不照镜子，身体长期被忽略',
      '很少关注体态与精力，常年疲惫',
      '知道该管，但一年里几乎没有行动',
      '偶尔运动，作息不稳定',
      '有基本习惯，常被工作打断',
      '体态与精力中等，谈不上满意也说不上糟',
      '作息基本规律，每周有固定的运动',
      '体态自觉可控，别人常说你状态不错',
      '长期稳定管理，精力充沛',
      '体格与精神状态在同龄人中靠前',
      '身体像一件长期保养的器具，随心可用',
    ],
  },
  {
    key: 'wealth',
    name: '财富财商',
    icon: '◇',
    control: '收入结构、储蓄率，以及你对钱的理解',
    anchors: [
      '没有储蓄，负债且不清楚总额',
      '月光，对自己的收支没有概念',
      '有收入但无规划，抗风险能力很弱',
      '开始记账，储蓄刚刚起步',
      '有稳定储蓄，但只有单一收入来源',
      '收支平衡，有一笔能应急的钱',
      '有储蓄与基础配置，能承受短期波动',
      '收入多元，资产有结构',
      '被动收入能覆盖一部分生活成本',
      '资产配置成熟，抗风险能力强',
      '钱是工具而不是目标，能选择做或不做',
    ],
  },
  {
    key: 'fame',
    name: '名誉地位',
    icon: '◈',
    control: '专业口碑，以及别人愿意把事交给你的程度',
    anchors: [
      '在所在领域几乎没有可被识别的名字',
      '只在很小的圈子里被知道',
      '同事知道你能做什么，出了公司没人知道',
      '在团队内有口碑',
      '在公司内有专业声誉',
      '行业内有一些认识你的人',
      '同行会主动来找你',
      '在细分领域有可被引用的观点',
      '被认为是某个方向的代表人物之一',
      '影响力跨出了本行业',
      '名字本身成了一种信任凭证',
    ],
  },
  {
    key: 'health',
    name: '身心健康',
    icon: '◍',
    control: '睡眠、体检、情绪调节与恢复力',
    anchors: [
      '长期失眠或疼痛，一直没有就医',
      '身体频繁报警，靠硬撑',
      '有明确的问题，但一直拖着',
      '亚健康，靠咖啡和意志维持',
      '大体正常，但情绪起伏明显',
      '体检无大问题，偶有失眠或焦虑',
      '睡眠稳定，情绪能自我调节',
      '有规律的运动与放松方式',
      '身心状态稳定，恢复力好',
      '长期健康管理，很少生病',
      '身心如静水，应对压力几乎不耗损',
    ],
  },
  {
    key: 'intelligence',
    name: '学习能力',
    icon: '◎',
    control: '学习习惯、信息处理，把学到的迁移到新场景',
    anchors: [
      '离开学校后几乎不再学习',
      '只学工作当场就要用的',
      '想学，但总开不了头',
      '偶尔看书或上课，很难坚持',
      '有学习习惯，但不系统',
      '每年能学完一两件新东西',
      '有稳定的输入渠道与整理方法',
      '能把学过的东西迁移到新场景',
      '持续输出，用输出倒逼输入',
      '跨领域连接能力强，能自建框架',
      '学习成了生活方式，学什么像什么',
    ],
  },
  {
    key: 'family',
    name: '和睦家庭',
    icon: '⌂',
    control: '与家人的沟通质量，以及冲突之后能不能修复',
    anchors: [
      '与家人几乎断联，或长期冲突',
      '一说话就吵，索性回避接触',
      '表面平静，实际问题从不谈',
      '有联系，但只谈事务不谈感受',
      '关系尚可，重要的话说不出口',
      '家人之间能正常相处，偶有摩擦',
      '有固定的相处时间与沟通习惯',
      '冲突之后能修复，不必冷战',
      '家人是支持系统而不是负担',
      '彼此能说真话，也能各自独立',
      '家是可以卸下盔甲的地方',
    ],
  },
  {
    key: 'longevity',
    name: '长寿善终',
    icon: '◌',
    control: '对衰老与终局的准备度，不是寿命预测',
    anchors: [
      '从不体检，也没有任何交代',
      '知道要准备，但完全没开始',
      '想过，没有写下来',
      '做过体检，其他一概没管',
      '有体检习惯，仍回避终局话题',
      '大致想过晚年怎么过',
      '有基本的健康管理，也跟家人聊过',
      '有明确的晚年安排与财务准备',
      '医疗意愿、财务、身后事都有交代',
      '该写的都写了，家人也知道放在哪',
      '对死亡不恐惧，走得从容',
    ],
  },
  {
    key: 'spirituality',
    name: '修行善根',
    icon: '◉',
    control: '价值锚点、独处能力，以及面对无常时的稳定性',
    anchors: [
      '没有精神生活，只被欲望推着走',
      '偶尔空虚，但不去看它',
      '用忙碌填满，不敢停下来',
      '有模糊的困惑，找不到入口',
      '偶尔读一点，但不成体系',
      '有自己的思考方式，遇事能自省',
      '有稳定的独处与反思习惯',
      '有一套能自洽的价值锚点',
      '面对无常时能保持稳定',
      '修行融进日常，不必刻意',
      '顺逆一如，心如止水',
    ],
  },
];

// ── 常量与刻度 ─────────────────────────────────────────────────────────

export const MAX_PER_ATTR = 10;
export const TOTAL_MAX = MAX_PER_ATTR * ATTRIBUTES.length; // 80
export const GAIN_HIGH = 4;

/** 弹性三档对应的向上增益 */
export const ELASTICITY_OPTIONS: { value: Elasticity; label: string; hint: string }[] = [
  { value: 'high', label: '还能往上走很多', hint: '有明显空间，只是一直没动' },
  { value: 'some', label: '还能往上走一些', hint: '能改善，但大概就一两档' },
  { value: 'none', label: '基本就这样了', hint: '再投入也不会有大变化' },
];

/**
 * 固有易退幅度：不用就退的项给高值，有粘性的项给低值。
 * 只用于生成提醒句，不展示成「下限几分」——那个数字只会让人不舒服。
 */
export const VOLATILITY: Record<AttributeKey, number> = {
  looks: 2,
  wealth: 1,
  fame: 1,
  health: 3,
  intelligence: 2,
  family: 2,
  longevity: 1,
  spirituality: 2,
};

export const EMPTY_ENTRY: Entry = { score: null, elasticity: null, reason: null };

export const EMPTY_ASSESSMENT: Assessment = ATTRIBUTES.reduce(
  (acc, attr) => ({ ...acc, [attr.key]: { ...EMPTY_ENTRY } }),
  {} as Assessment
);

/** 现状答了、弹性答了、「基本就这样了」时还追问了原因，才算这一项答完 */
export function isAnswered(entry: Entry): boolean {
  if (entry.score === null || entry.elasticity === null) return false;
  if (entry.elasticity === 'none' && entry.reason === null) return false;
  return true;
}

export function filledCount(a: Assessment): number {
  return ATTRIBUTES.filter(attr => isAnswered(a[attr.key])).length;
}

export function isComplete(a: Assessment): boolean {
  return filledCount(a) === ATTRIBUTES.length;
}

export function gainOf(entry: Entry): number {
  if (entry.elasticity === null || entry.elasticity === 'none') return 0;
  return entry.elasticity === 'high' ? GAIN_HIGH : 2;
}

/** 上限：自己声明的空间，封顶 10 */
export function capOf(entry: Entry): number {
  if (entry.score === null) return 0;
  return Math.min(MAX_PER_ATTR, entry.score + gainOf(entry));
}

/** 固有易退 + 情境修正：认命型的、以及「还有大空间」的，都更容易一路滑 */
export function decayOf(attr: Attribute, entry: Entry): number {
  let d = VOLATILITY[attr.key];
  if (entry.elasticity === 'none' && entry.reason === 'stuck') d += 1;
  if (entry.elasticity === 'high') d += 1;
  return d;
}

export function floorOf(attr: Attribute, entry: Entry): number {
  if (entry.score === null) return 0;
  return Math.max(0, entry.score - decayOf(attr, entry));
}

/** 区间完成度：在自己这一项的 floor→cap 之间走到了几成 */
export function ratioOf(attr: Attribute, entry: Entry): number {
  const score = entry.score ?? 0;
  const lo = floorOf(attr, entry);
  const hi = capOf(entry);
  if (hi <= lo) return score >= hi ? 1 : 0;
  return Math.min(1, Math.max(0, (score - lo) / (hi - lo)));
}

export function toScores(a: Assessment): Scores {
  const out = {} as Scores;
  for (const attr of ATTRIBUTES) out[attr.key] = a[attr.key].score ?? 0;
  return out;
}

/** 读本地存储时按当前口径白名单过滤，脏值一律退回空 */
export function parseAssessment(raw: unknown): Assessment {
  const out = {} as Assessment;
  for (const attr of ATTRIBUTES) out[attr.key] = { ...EMPTY_ENTRY };
  if (!raw || typeof raw !== 'object') return out;
  const src = raw as Record<string, unknown>;
  for (const attr of ATTRIBUTES) {
    const item = src[attr.key];
    if (!item || typeof item !== 'object') continue;
    const rec = item as Record<string, unknown>;
    const score =
      typeof rec.score === 'number' && Number.isFinite(rec.score)
        ? Math.min(MAX_PER_ATTR, Math.max(0, Math.round(rec.score)))
        : null;
    const elasticity: Elasticity | null =
      rec.elasticity === 'high' || rec.elasticity === 'some' || rec.elasticity === 'none'
        ? rec.elasticity
        : null;
    const reason: CeilingReason | null =
      rec.reason === 'enough' || rec.reason === 'stuck' ? rec.reason : null;
    out[attr.key] = { score, elasticity, reason: elasticity === 'none' ? reason : null };
  }
  return out;
}

export const ACTION_BY_KEY: Record<AttributeKey, string> = {  looks: '拍一张正面全身照，三个月后再拍一张，只对比体态，不对比脸。',
  wealth: '这个月把收入结构写下来：几份来源、各占多少、哪一份最脆。',
  fame: '挑一件你做过的事，写成八百字发出去，别只留在简历里。',
  health: '把体检预约排进日历，定一个具体日期，不是「有空去」。',
  intelligence: '选一个主题，连续四周每周输出一篇笔记，写不出来就说明还没学会。',
  family: '约一次不谈事务的饭，只问对方最近怎么样，然后闭嘴听完。',
  longevity: '把体检报告和一份意愿清单放进同一个文件夹，告诉家人放在哪。',
  spirituality: '每天留十五分钟不看屏幕，只坐着，什么也不做。',
};

/** 不管就会滑到哪 —— 不叫「下限」，叫「本来就保不住的部分」 */
export function watchText(attr: Attribute, score: number, floor: number, index = 0): string {
  if (index === 0) {
    return `「${attr.name}」现在是 ${score} 分。接下来半年如果什么都不做，它大概会滑到 ${floor} 分——不是因为你做错了什么，只是这一项本来就不会自己维持。`;
  }
  return `「${attr.name}」${score} 分，滑到 ${floor} 分只需要你什么都不做。这项的底子比它看起来薄。`;
}

export type Report = {
  /** 绝对存量，满分 80 */
  total: number;
  max: number;
  /** 自己声明的上限之和，是「潜力进度」的分母 */
  ceiling: number;
  /** 区间完成度均值，0–100 */
  potential: number;
  headline: string;
  summary: string;
  /** 最该动：离上限远 + 还有空间，每项配一件具体可做的事 */
  actions: { attr: Attribute; score: number; cap: number; ratio: number; room: number; action: string }[];
  /** 复利区：完成度高 + 还有空间 */
  compound: { attr: Attribute; score: number }[];
  /** 天赋红利：完成度高 + 没什么空间了 */
  gift: { attr: Attribute; score: number }[];
  /** 该放下：完成度低 + 空间也窄 */
  release: { attr: Attribute; score: number }[];
  /** 守住提醒：现在还行，但不用就会掉 */
  watch: { attr: Attribute; score: number; floor: number; text: string }[];
  /** 复测指引，不是行动建议——行动已经在 actions 里逐项给出 */
  nextStep: string;
  /** 八项都说「已经够好了」——可能是真打通，也可能在回避变化 */
  allCapped: boolean;
};

export function generateReport(a: Assessment): Report {
  const rows = ATTRIBUTES.map(attr => {
    const entry = a[attr.key];
    const score = entry.score ?? 0;
    const cap = capOf(entry);
    return {
      attr,
      entry,
      score,
      cap,
      floor: floorOf(attr, entry),
      ratio: ratioOf(attr, entry),
      room: Math.max(0, cap - score),
      decay: decayOf(attr, entry),
    };
  });

  const total = rows.reduce((s, r) => s + r.score, 0);
  const ceiling = rows.reduce((s, r) => s + r.cap, 0);
  const potential = Math.round((rows.reduce((s, r) => s + r.ratio, 0) / rows.length) * 100);

  const movable = rows.filter(r => r.room >= 2);
  const stuck = rows.filter(r => r.room < 2);

  const actions = movable
    .filter(r => r.ratio < 0.6)
    .sort((x, y) => y.room - x.room || x.ratio - y.ratio)
    .slice(0, 2)
    .map(r => ({
      attr: r.attr,
      score: r.score,
      cap: r.cap,
      ratio: r.ratio,
      room: r.room,
      action: ACTION_BY_KEY[r.attr.key],
    }));

  const compound = movable.filter(r => r.ratio >= 0.6).map(r => ({ attr: r.attr, score: r.score }));
  const gift = stuck.filter(r => r.ratio >= 0.6).map(r => ({ attr: r.attr, score: r.score }));
  const release = stuck.filter(r => r.ratio < 0.6).map(r => ({ attr: r.attr, score: r.score }));

  const watch = rows
    .filter(r => r.decay >= 2 && r.score >= 4 && r.entry.reason !== 'enough')
    .sort((x, y) => y.decay - x.decay || y.score - x.score)
    .slice(0, 2)
    .map((r, i) => ({
      attr: r.attr,
      score: r.score,
      floor: r.floor,
      text: watchText(r.attr, r.score, r.floor, i),
    }));

  const allCapped = ATTRIBUTES.every(
    attr => a[attr.key].elasticity === 'none' && a[attr.key].reason === 'enough'
  );

  let headline: string;
  if (allCapped) {
    headline = '八项你都给了「已经够好」。要么你真的打通了，要么你在替自己关掉所有向上的门。';
  } else if (potential >= 80) {
    headline = '你把自己的空间用掉了大半，剩下的那几处都很具体。';
  } else if (potential >= 60) {
    headline = '你在自己的区间里走过了多半，剩下哪里还空着，已经看得见。';
  } else if (potential >= 40) {
    headline = '你在自己的区间里走到一半，形状已经清楚了。';
  } else {
    headline = '你离自己的底不远，这意味着能挪的地方比你以为的多。';
  }

  const roomTotal = rows.reduce((s, r) => s + r.room, 0);
  const moveNames = actions.map(x => x.attr.name).join('、');

  const summary =
    actions.length > 0
      ? `八项加在一起 ${total} 分，满分 80。你自己给每一项定的上限加起来是 ${ceiling} 分——离那里还有 ${roomTotal} 分的空间，其中最多的是「${moveNames}」，这两项你都说了还能往上走。`
      : `八项加在一起 ${total} 分，满分 80。你自己给每一项定的上限加起来是 ${ceiling} 分，但没有哪一项还留着明显空间——这种时候，把已经好的地方再加厚，比补短板更划算。`;

  const nextStep =
    '把这份称重单留在这台设备里就行，不用另存。半年后回来只改一项——看它挪了几格，别重填全部。这一项如果没动，那才是真正需要面对的地方。';

  return {
    total,
    max: TOTAL_MAX,
    ceiling,
    potential,
    headline,
    summary,
    actions,
    compound,
    gift,
    release,
    watch,
    nextStep,
    allCapped,
  };
}

// ─────────────────────────────────────────────────────────────
// 目标类型（参考用，不做硬标签）
//
// 它不是测评，是一张「词库」：让用户在给完分之后，认领自己
// 想追的东西，从而把「想要」和「拥有」接起来 —— 落差才有方向。
// 允许一条都不选（none），因为硬选必然失真。
// ─────────────────────────────────────────────────────────────

export const GOAL_NONE = 'none';

export type GoalType = {
  id: string;
  name: string;
  desc: string;
  /** 这一类型主要落在八项里的哪几项 */
  maps: AttributeKey[];
};

export const GOAL_TYPES: GoalType[] = [
  { id: 'opus', name: '作品型', desc: '通过创作留下长期价值，形成独特影响', maps: ['fame', 'spirituality'] },
  { id: 'experience', name: '体验型', desc: '通过丰富经历获得持久感受和满足', maps: ['looks', 'wealth'] },
  { id: 'public', name: '公益型', desc: '通过服务改善他人生活，产生长期影响', maps: ['fame', 'spirituality'] },
  { id: 'achievement', name: '成就型', desc: '在专业或事业上达成标杆地位和认可', maps: ['fame', 'intelligence'] },
  { id: 'inspire', name: '启发型', desc: '通过思想和教导启发他人认知和行动', maps: ['spirituality', 'fame'] },
  { id: 'idea', name: '理念型', desc: '持续构建和实践价值观与理念体系', maps: ['spirituality', 'intelligence'] },
  { id: 'dream', name: '追梦型', desc: '不断推进愿景和梦想，实现落地目标', maps: ['intelligence', 'fame'] },
  { id: 'inner', name: '内修型', desc: '通过自我成长和修炼积累内在成熟', maps: ['spirituality'] },
  { id: 'enjoy', name: '享受型', desc: '追求高品质生活与长期愉悦感', maps: ['wealth', 'looks'] },
  { id: 'relation', name: '关系型', desc: '建立稳定联结，创造长期情感安全', maps: ['family'] },
  { id: 'steady', name: '稳健型', desc: '保障财务与职业稳定，实现可控生活', maps: ['wealth', 'longevity'] },
  { id: 'skill', name: '技能型', desc: '持续精进专业能力，形成长期影响力', maps: ['intelligence', 'fame'] },
  { id: 'reputation', name: '声望型', desc: '通过形象和口碑获得长期社会认知', maps: ['fame', 'looks'] },
  { id: 'enterprise', name: '企业型', desc: '经营与创新推动组织持续发展和增长', maps: ['fame', 'wealth'] },
  { id: 'money', name: '赚钱型', desc: '积累财富，实现资本和收益长期增长', maps: ['wealth'] },
  { id: 'power', name: '权力型', desc: '掌控决策与资源，实现长期系统影响', maps: ['fame', 'wealth'] },
];

export type Goals = {
  picked: string[];
  custom: string;
};

export const DEFAULT_GOALS: Goals = { picked: [], custom: '' };

export function parseGoals(raw: unknown): Goals {
  if (!raw || typeof raw !== 'object') return DEFAULT_GOALS;
  const src = raw as Record<string, unknown>;
  const known = new Set(GOAL_TYPES.map(g => g.id).concat(GOAL_NONE));
  const picked = Array.isArray(src.picked)
    ? src.picked.filter((x): x is string => typeof x === 'string' && known.has(x))
    : [];
  const custom = typeof src.custom === 'string' ? src.custom.slice(0, 40) : '';
  return { picked, custom };
}

export type GoalInsight = {
  /** 你选的类型落在八项里的那几项 */
  wanted: { attr: Attribute; count: number }[];
  /** 在意、但分数低的（错位） */
  tension: { attr: Attribute; score: number; ratio: number }[];
  /** 分数不低，却没出现在任何目标里 */
  unseen: { attr: Attribute; score: number }[];
  text: string;
  /** 一条都没选 */
  empty: boolean;
};

export function buildGoalInsight(a: Assessment, goals: Goals): GoalInsight {
  const active = goals.picked.filter(id => id !== GOAL_NONE);
  const names = (list: { attr: Attribute }[]) => list.map(x => x.attr.name).join('、');

  if (active.length === 0) {
    return {
      wanted: [],
      tension: [],
      unseen: [],
      empty: true,
      text: goals.custom.trim()
        ? `你自己写下的那一句，比这十六种分类都准。就按它来——它指向哪一项，那一项就是你的方向。`
        : '你一条都没有选。这不算失败：很多人要到很晚才发现，自己一直在完成别人的清单。可以先不做选择，回到上面八项，看看哪一项你打分时最犹豫——犹豫的地方，往往就是目标藏着的地方。',
    };
  }

  const counts = new Map<AttributeKey, number>();
  for (const id of active) {
    const goal = GOAL_TYPES.find(g => g.id === id);
    if (!goal) continue;
    for (const key of goal.maps) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const wanted = ATTRIBUTES.filter(a => (counts.get(a.key) ?? 0) > 0)
    .map(a => ({ attr: a, count: counts.get(a.key) ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const tension = wanted
    .map(w => ({
      attr: w.attr,
      score: a[w.attr.key].score ?? 0,
      ratio: ratioOf(w.attr, a[w.attr.key]),
    }))
    .filter(t => t.ratio < 0.5)
    .sort((x, y) => x.ratio - y.ratio)
    .slice(0, 2);

  const unseen = ATTRIBUTES.filter(attr => (counts.get(attr.key) ?? 0) === 0)
    .filter(attr => ratioOf(attr, a[attr.key]) >= 0.6)
    .map(attr => ({ attr, score: a[attr.key].score ?? 0 }))
    .slice(0, 2);

  const wantedNames = names(wanted);
  let text: string;
  if (tension.length > 0) {
    text =
      tension.length >= wanted.length
        ? `你选的目标落在「${wantedNames}」上，而这恰好是你现在分数偏低的那几项——你不是没有方向，是还没开始走。`
        : `你选的目标落在「${wantedNames}」上，其中「${names(tension)}」恰好是你现在分数偏低的那几项——你不是没有方向，是还没开始走。`;
  } else {
    text = `你选的目标落在「${wantedNames}」上，而这几项你都给到了及格线以上。方向和现状是对齐的，接下来是厚度问题，不是方向问题。`;
  }

  if (unseen.length > 0) {
    text += ` 另外，「${unseen.map(u => u.attr.name).join('、')}」你分数不低，却没有出现在你的目标里——这可能是运气，也可能是一项还没被你自己认领的能力。`;
  }

  return { wanted, tension, unseen, empty: false, text };
}

