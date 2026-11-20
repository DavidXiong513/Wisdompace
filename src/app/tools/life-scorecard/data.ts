// ─────────────────────────────────────────────────────────────
// 今生称重 · 数据地基
//
// 与「来生设计」的根本差别：
//   来生 = 50 分零和分配，测的是「你愿意怎么取舍」（价值排序）
//   今生 = 八项独立自评，测的是「你现在有多少」（存量状态）
//
// 因为不再零和，总分必须有新分母 —— 用「你自己的潜力上限」：
//   每项都有 baseline（先天给定）与 ceiling（后天可达上限），
//   ceiling 之和 = 70，就是这个人理论上的天花板。
//   「48 / 70」比「48 / 100」诚实，也不会被误读成不及格。
//
// ceiling 只用于算分母与分类，不限制输入 —— 用户可以自评到 10。
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

export type Scores = Record<AttributeKey, number>;

export type Attribute = {
  key: AttributeKey;
  name: string;
  icon: string;
  /** 可控面：这一项真正在测什么（避免用评价性词汇制造焦虑） */
  control: string;
  /** 先天给定：不是让你自评，是让你知道「我从哪出发」 */
  baseline: number;
  /** 后天可达上限：决定这一项在分母里的份额 */
  ceiling: number;
  /** 0–10 档的行为锚点，描述现状而非命运 */
  anchors: string[];
};

export const ATTRIBUTES: Attribute[] = [
  {
    key: 'looks',
    name: '颜值身材',
    icon: '◐',
    control: '体态、精力，以及你对自己身体的管理感',
    baseline: 5,
    ceiling: 7,
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
    baseline: 3,
    ceiling: 9,
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
    baseline: 3,
    ceiling: 8,
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
    baseline: 5,
    ceiling: 9,
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
    baseline: 4,
    ceiling: 10,
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
    baseline: 4,
    ceiling: 9,
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
    baseline: 6,
    ceiling: 8,
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
    baseline: 3,
    ceiling: 10,
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

export const DEFAULT_SCORES: Scores = {
  looks: 5,
  wealth: 4,
  fame: 4,
  health: 5,
  intelligence: 6,
  family: 6,
  longevity: 5,
  spirituality: 5,
};

export const TOTAL_CEILING = ATTRIBUTES.reduce((s, a) => s + a.ceiling, 0);
export const TOTAL_BASELINE = ATTRIBUTES.reduce((s, a) => s + a.baseline, 0);
export const MAX_PER_ATTR = 10;

export function sumScores(scores: Scores): number {
  return ATTRIBUTES.reduce((s, a) => s + scores[a.key], 0);
}

/** 可动率：这一项有多少比例是后天能挪的 */
export function moveRate(attr: Attribute): number {
  return (attr.ceiling - attr.baseline) / MAX_PER_ATTR;
}

/**
 * 区间完成度：在自己的「给定 → 上限」区间里走到了几成。
 * 比绝对分数公平 —— 起点低的人不该被同一个标准评判。
 * 低于起点时返回负数，调用方负责提示。
 */
export function fillRatio(attr: Attribute, score: number): number {
  const span = attr.ceiling - attr.baseline;
  if (span <= 0) return score >= attr.ceiling ? 1 : 0;
  return (score - attr.baseline) / span;
}

/** 杠杆分：离上限还有多远 × 这项有多能挪 */
export function leverage(attr: Attribute, score: number): number {
  const gap = Math.max(0, attr.ceiling - score);
  return gap * moveRate(attr);
}

export const ACTION_BY_KEY: Record<AttributeKey, string> = {
  looks: '拍一张正面全身照，三个月后再拍一张，只对比体态，不对比脸。',
  wealth: '这个月把收入结构写下来：几份来源、各占多少、哪一份最脆。',
  fame: '挑一件你做过的事，写成八百字发出去，别只留在简历里。',
  health: '把体检预约排进日历，定一个具体日期，不是「有空去」。',
  intelligence: '选一个主题，连续四周每周输出一篇笔记，写不出来就说明还没学会。',
  family: '约一次不谈事务的饭，只问对方最近怎么样，然后闭嘴听完。',
  longevity: '把体检报告和一份意愿清单放进同一个文件夹，告诉家人放在哪。',
  spirituality: '每天留十五分钟不看屏幕，只坐着，什么也不做。',
};

export type Report = {
  total: number;
  ceiling: number;
  percent: number;
  headline: string;
  summary: string;
  /** 最该动：低完成度 + 高可动 */
  actions: { attr: Attribute; score: number; ratio: number; gain: number }[];
  /** 复利区：高完成度 + 高可动 */
  compound: { attr: Attribute; score: number }[];
  /** 天赋红利：高完成度 + 低可动 */
  gift: { attr: Attribute; score: number }[];
  /** 该放下：低完成度 + 低可动 */
  release: { attr: Attribute; score: number }[];
  nextStep: string;
};

export function generateReport(scores: Scores): Report {
  const total = sumScores(scores);
  const percent = Math.round((total / TOTAL_CEILING) * 100);

  const scored = ATTRIBUTES.map(attr => {
    const score = scores[attr.key];
    const ratio = fillRatio(attr, score);
    const rate = moveRate(attr);
    return { attr, score, ratio, rate, gain: leverage(attr, score) };
  });

  const highMove = scored.filter(s => s.rate >= 0.45);
  const lowMove = scored.filter(s => s.rate < 0.45);

  const actions = highMove
    .filter(s => s.ratio < 0.6)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 2)
    .map(s => ({ attr: s.attr, score: s.score, ratio: s.ratio, gain: s.gain }));

  const compound = highMove.filter(s => s.ratio >= 0.6).map(s => ({ attr: s.attr, score: s.score }));
  const gift = lowMove.filter(s => s.ratio >= 0.6).map(s => ({ attr: s.attr, score: s.score }));
  const release = lowMove.filter(s => s.ratio < 0.6).map(s => ({ attr: s.attr, score: s.score }));

  let headline: string;
  if (percent >= 80) headline = '你把自己这条路的潜力，已经用掉了大半。';
  else if (percent >= 65) headline = '你在自己的区间里走过了多半，剩下的空间集中且具体。';
  else if (percent >= 45) headline = '你在自己的区间里走到一半，形状已经清楚。';
  else headline = '你离自己的起点不远，这意味着能动的地方比你以为的多。';

  const gapPoints = Math.round((TOTAL_CEILING - total) * 10) / 10;
  const moveNames = actions.map(a => a.attr.name).join('、');

  const summary =
    actions.length > 0
      ? `按你自己的潜力算，还有 ${gapPoints} 分的空间，其中 ${actions
          .reduce((s, a) => s + Math.round(a.gain * 10) / 10, 0)
          .toFixed(1)} 分集中在「${moveNames}」上——这两项都是后天能挪的，值得先动。`
      : `按你自己的潜力算，还有 ${gapPoints} 分的空间，但没有哪一项既低又容易动。这种时候，把已经好的地方再加厚，比补短板更划算。`;

  const nextStep = actions.length > 0 ? ACTION_BY_KEY[actions[0].attr.key] : '把这份自评存下来，半年后再填一次，只看同一项有没有挪动。';

  return { total, ceiling: TOTAL_CEILING, percent, headline, summary, actions, compound, gift, release, nextStep };
}
