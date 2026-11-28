/**
 * 居家养老还是去养老院 · 数据层
 *
 * 模型：Stage 0 身份分流 → Stage 1 硬约束（红灯）→ Stage 2 五维评估 → 报告 A
 * 设计原则见 docs/居家养老还是去养老院-规划方案.md
 *   1. 不做二元选择，输出三档：居家 / 居家+社区 / 机构
 *   2. 不做打分排名，做「硬约束触发」——默认居家，机构是触发出来的结论
 *   3. 意愿优先：意愿维度单独展示，不并入总分
 *   4. 四套分级（五级护理 / 国标 / 长护险 / 上海统一需求评估）禁止互相换算
 */

export type IdentityType = 'self' | 'child' | 'unable';

export type SignalId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6';

export type Verdict = 'green' | 'amber' | 'red';

export interface IdentityOption {
  value: IdentityType;
  label: string;
  desc: string;
  note: string;
}

export const identityOptions: IdentityOption[] = [
  {
    value: 'self',
    label: '我是本人',
    desc: '我自己在规划往后要在哪儿过',
    note: '报告写给你自己',
  },
  {
    value: 'child',
    label: '我是子女／家属',
    desc: '替父母了解该怎么安排',
    note: '报告可作家庭会议材料',
  },
  {
    value: 'unable',
    label: '长辈已无法表达意愿',
    desc: '现在的照护已经出了问题',
    note: '这一项本身就是一个信号',
  },
];

/** 人称：本人用「你」，代问与失能两种用「长辈」 */
export function subjectOf(identity: IdentityType | null): string {
  return identity === 'self' ? '你' : '长辈';
}

/** 行动主体：报告里的「谁来做」 */
export function actorOf(identity: IdentityType | null): string {
  if (identity === 'self') return '你自己';
  if (identity === 'child') return '你和家人';
  return '现在的照护者';
}

export interface HardSignal {
  id: SignalId;
  title: string;
  detail: string;
  level: 'red' | 'amber';
  pointsTo: string;
  /** 可点跳转（如 H5 指向意定人评估） */
  href?: string;
}

/**
 * Stage 1 六条硬约束。
 * red = 命中即建议转入机构侧判断；amber = 单独提示，不直接改变档位。
 */
export const hardSignals: HardSignal[] = [
  {
    id: 'H1',
    title: '认知上已经不能独处',
    detail: '出现过走失、误服、忘关火或出门迷路，且身边没有 24 小时看护',
    level: 'red',
    pointsTo: '记忆照护单元（养老院／护理院内的专区）',
  },
  {
    id: 'H2',
    title: '需要 24 小时照护',
    detail: '穿衣、进食、如厕、行走转移都需要他人协助',
    level: 'red',
    pointsTo: '护理院',
  },
  {
    id: 'H3',
    title: '需要定期专业医疗',
    detail: '血透、腹透、管路维护、伤口换药或专业康复训练',
    level: 'red',
    pointsTo: '护理院／康复医院',
  },
  {
    id: 'H4',
    title: '独居，且来不及',
    detail: '独居，4 小时内没有能赶到的人，且有跌倒、晕厥或心脑血管病史',
    level: 'red',
    pointsTo: '先做居家改造，同时开始看机构',
  },
  {
    id: 'H5',
    title: '没有医疗代理人',
    detail: '择期手术、特殊检查、转院或签机构协议时，没有人能签字',
    level: 'amber',
    pointsTo: '先补意定监护，不改变居家结论',
    href: '/tools/ta-worth-trust',
  },
  {
    id: 'H6',
    title: '照护者已经撑不住',
    detail: '主要照护者出现辞职、长期失眠、抑郁或自身健康恶化',
    level: 'amber',
    pointsTo: '喘息服务，或转入机构',
  },
];

export type DimensionKey = 'body' | 'people' | 'house' | 'money' | 'will';

export interface DimOption {
  label: string;
  score: number;
}

export interface DimQuestion {
  id: string;
  text: string;
  options: DimOption[];
}

export interface Dimension {
  key: DimensionKey;
  name: string;
  intro: string;
  questions: DimQuestion[];
  /** 该维不达标时的补法 */
  fixes: { title: string; detail: string }[];
}

/**
 * Stage 2 五维。前四维计分（各 4 分，共 16 分）；
 * 第五维「意愿与心理」不并入总分，单独展示并按方案「意愿优先」提示。
 */
export const dimensions: Dimension[] = [
  {
    key: 'body',
    name: '身体与认知',
    intro: '对照五级护理，先看现在落在哪一级。',
    questions: [
      {
        id: 'body-1',
        text: '穿衣、吃饭、洗澡、上厕所这些事，{s}现在能自己做吗？',
        options: [
          { label: '都能自己做', score: 2 },
          { label: '有些需要搭把手', score: 1 },
          { label: '大多要靠别人', score: 0 },
        ],
      },
      {
        id: 'body-2',
        text: '近半年，{s}的走路、记性或体重有明显变化吗？',
        options: [
          { label: '没有', score: 2 },
          { label: '有一点', score: 1 },
          { label: '很明显', score: 0 },
        ],
      },
    ],
    fixes: [
      {
        title: '先做一次能力评估',
        detail: '社区卫生服务中心可做老年人能力评估，结果也是申请长护险与补贴的前置材料。',
      },
      {
        title: '把「变化」记下来',
        detail: '半年内的变化速度比当前等级更能说明问题，复诊时直接给医生看。',
      },
    ],
  },
  {
    key: 'people',
    name: '身边有没有人',
    intro: '关键不是「有没有子女」，而是「几小时内到得了」。',
    questions: [
      {
        id: 'people-1',
        text: '平时同住，或每天能见到的人？',
        options: [
          { label: '有人同住', score: 2 },
          { label: '每天有人上门', score: 1 },
          { label: '基本一个人', score: 0 },
        ],
      },
      {
        id: 'people-2',
        text: '真出了事，最快多久能有人赶到？',
        options: [
          { label: '15 分钟内', score: 2 },
          { label: '4 小时内', score: 1 },
          { label: '超过 4 小时，或说不准', score: 0 },
        ],
      },
    ],
    fixes: [
      {
        title: '定一个紧急联络人',
        detail: '写下来贴在电话旁，同时存进手机紧急联系人。社区探访关爱名单也可以申请。',
      },
      {
        title: '加一层「无人发现」的兜底',
        detail: '跌倒报警器、智能水表或每日一次的电话约定，解决的都是独居最致命的那一环。',
      },
    ],
  },
  {
    key: 'house',
    name: '房子能不能住',
    intro: '适老化改造是投入产出比最高的一件事。',
    questions: [
      {
        id: 'house-1',
        text: '住几楼，有没有电梯？',
        options: [
          { label: '电梯房，或住一楼', score: 2 },
          { label: '楼梯房 2–3 层', score: 1 },
          { label: '楼梯房高层，没电梯', score: 0 },
        ],
      },
      {
        id: 'house-2',
        text: '卫生间的扶手、防滑，和夜间照明？',
        options: [
          { label: '都做了', score: 2 },
          { label: '做了一部分', score: 1 },
          { label: '都没有', score: 0 },
        ],
      },
    ],
    fixes: [
      {
        title: '先改三处',
        detail: '卫生间扶手与防滑垫、床边夜灯、门槛坡化。这三处覆盖了大多数居家跌倒。',
      },
      {
        title: '问一下有没有改造补贴',
        detail: '多地对特殊困难老年人家庭适老化改造有补贴，向社区或街道咨询。',
      },
    ],
  },
  {
    key: 'money',
    name: '钱与支付能力',
    intro: '不是问有多少钱，是问照护这笔钱够不够、能不能报。',
    questions: [
      {
        id: 'money-1',
        text: '每月能用于照护的钱（不含日常吃喝）？',
        options: [
          { label: '5000 元以上', score: 2 },
          { label: '2000–5000 元', score: 1 },
          { label: '2000 元以下', score: 0 },
        ],
      },
      {
        id: 'money-2',
        text: '长护险或本地养老补贴，{s}了解到哪一步？',
        options: [
          { label: '已在申请，或已在领', score: 2 },
          { label: '听过，还没办', score: 1 },
          { label: '没了解过', score: 0 },
        ],
      },
    ],
    fixes: [
      {
        title: '先查两件事的资格',
        detail: '长期护理保险（医保局）与养老服务消费补贴（民政局）是两条线，条件不同，可以叠加。',
      },
      {
        title: '问清「家庭养老床位」',
        detail: '部分城市把机构的床位搬进家，服务与补贴一起给，是居家这一档的关键抓手。',
      },
    ],
  },
  {
    key: 'will',
    name: '意愿与心理',
    intro: '这一维不计入总分。意愿和模型结论冲突时，以意愿为准，只陈述风险。',
    questions: [
      {
        id: 'will-1',
        text: '{s}对入住机构的态度？',
        options: [
          { label: '能接受', score: 2 },
          { label: '抵触，但可以谈', score: 1 },
          { label: '坚决不去', score: 0 },
        ],
      },
      {
        id: 'will-2',
        text: '{s}日常出门和与人来往的情况？',
        options: [
          { label: '每天出门，或常有人来', score: 2 },
          { label: '一周几次', score: 1 },
          { label: '几乎不出门', score: 0 },
        ],
      },
    ],
    fixes: [
      {
        title: '把「坚决不去」当成一个真实约束',
        detail: '它不会因为评估分数而消失。若确实需要机构，先解决信任问题，再谈条件。',
      },
      {
        title: '社交退化要单独看',
        detail: '几乎不出门本身就是健康风险，和去不去机构无关。',
      },
    ],
  },
];

/** 计分维度（不含意愿） */
export const scoredDimensions = dimensions.filter((d) => d.key !== 'will');
export const MAX_SCORE = scoredDimensions.length * 4; // 16

export interface VerdictResult {
  verdict: Verdict;
  score: number;
  maxScore: number;
  redSignals: SignalId[];
  amberSignals: SignalId[];
  ratio: number;
}

/** 主判定：硬信号优先，其次看四维总分 */
export function evaluate(
  signals: Partial<Record<SignalId, boolean>>,
  answers: Partial<Record<string, number>>
): VerdictResult {
  const redSignals = hardSignals
    .filter((s) => s.level === 'red' && signals[s.id])
    .map((s) => s.id);
  const amberSignals = hardSignals
    .filter((s) => s.level === 'amber' && signals[s.id])
    .map((s) => s.id);

  let score = 0;
  scoredDimensions.forEach((d) => {
    d.questions.forEach((q) => {
      score += answers[q.id] ?? 0;
    });
  });

  const ratio = score / MAX_SCORE;

  let verdict: Verdict;
  if (redSignals.length > 0) {
    verdict = 'red';
  } else if (score >= 13) {
    verdict = 'green';
  } else if (score >= 8) {
    verdict = 'amber';
  } else {
    verdict = 'red';
  }

  // H6 照护者耗竭：把绿灯压成黄灯，但不改变红灯
  if (verdict === 'green' && signals.H6) verdict = 'amber';

  return { verdict, score, maxScore: MAX_SCORE, redSignals, amberSignals, ratio };
}

/** 缺口：某维总分 ≤ 2（满分 4）即视为不达标 */
export function gapsOf(answers: Partial<Record<string, number>>): Dimension[] {
  return scoredDimensions.filter((d) => {
    const s = d.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
    return s <= 2;
  });
}

export function dimScore(dim: Dimension, answers: Partial<Record<string, number>>): number {
  return dim.questions.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
}

export interface VerdictCopy {
  tag: string;
  title: string;
  desc: string;
  tone: 'green' | 'amber' | 'red';
}

export function verdictCopy(v: Verdict): VerdictCopy {
  if (v === 'green') {
    return {
      tag: '绿灯',
      title: '现在这个状态，居家撑得住',
      desc: '基础条件都还在。接下来要做的不是准备搬走，而是把家里和身边的支持补得更结实，让它在未来几年里继续撑得住。',
      tone: 'green',
    };
  }
  if (v === 'amber') {
    return {
      tag: '黄灯',
      title: '居家还能撑，但需要有人补上',
      desc: '还没到非搬不可的程度，但至少有一环已经松了。先看社区服务能不能补上这一环——补得上，就在家继续；补不上，就要开始看机构。',
      tone: 'amber',
    };
  }
  return {
    tag: '红灯',
    title: '居家已经开始硬撑了',
    desc: '硬条件上出现了居家难以承接的情况，或者几个维度同时偏弱。这不是说明天就要搬，而是从现在起，把找机构当成一件正经事来办。',
    tone: 'red',
  };
}

export interface AdviceItem {
  title: string;
  detail: string;
  /** 可点跳转（如指向意定人评估工具） */
  href?: string;
  linkLabel?: string;
}

/** 居家注意事项（主交付物） */
export const homeAdvice: AdviceItem[] = [
  {
    title: '把家里改成不容易摔的样子',
    detail: '卫生间扶手与防滑垫、床边夜灯、门槛坡化、常用物品下移到腰部高度。',
  },
  {
    title: '接上社区服务',
    detail: '助餐、助浴、助洁、助医、助行、助急——多数城市有六助服务，与街道或社区养老服务站对接。',
  },
  {
    title: '查长护险与养老补贴的资格',
    detail: '两条线可以叠加：长护险（医保局）看失能等级，养老服务消费补贴（民政局）看经济与失能状况。',
  },
  {
    title: '设一个 4 小时可达的紧急机制',
    detail: '不只写名单，要真正演练一次：谁能到、多久到、钥匙在哪、病历放哪。',
  },
  {
    title: '把医疗代理补上',
    detail: '无人在场时谁替长辈签字，是居家最容易被忽略的一环。先选人，再评估这个人扛不扛得住。',
    href: '/tools/ta-worth-trust',
    linkLabel: '去做意定人评估',
  },
];

/** 什么时候该重新看机构 */
export const referralRules: string[] = [
  '出现走失、误服、忘关火，且无人 24 小时看护',
  '穿衣、进食、如厕、转移都需要他人协助',
  '出现血透、腹透、管路维护、伤口换药等定期专业处置',
  '同一个人一年内跌倒两次以上，或有过夜间急诊',
  '主要照护者出现辞职、长期失眠、抑郁或自身健康恶化',
];

/** 半年后回来看的观察指标 */
export const watchPoints: string[] = [
  '半年内体重与步速的变化',
  '一年内跌倒次数与急诊次数',
  '照护者每周实际投入的小时数',
  '社区服务实际用上了几项',
];

export const DISCLAIMER =
  '本工具提供的是一般性梳理，不构成医疗诊断，也不替代 GB/T 42195-2022 老年人能力评估与长护险失能等级评定。本工具不给具体价格——机构报价随入住率、护理等级、房型浮动，请以当地机构当期报价为准；补贴与政策以当地民政、医保部门口径为准。';

/* ── 价格口径：不给区间 ───────────────────────────────── */

export const pricingNotice = {
  title: '这里不写具体价格',
  desc: '同一家机构的报价是会变的：空床多时打折、甚至免床位费，住满了就涨，还可能收排队费。写死的区间反而误导。下面给的是计价结构和该问的问题，具体数字请在参访时问当期报价。',
  factors: [
    '入住率：空床多时议价空间大，满床时议价空间几乎没有',
    '护理等级：同一家机构，不同护理等级的护理费差价明显',
    '房型：单人间 / 双人间 / 多人间，床位费差一档',
    '是否医保定点：影响医疗部分能不能走医保结算',
    '押金与会员费：退费条款比价格本身更该看清',
  ],
  askTips: [
    '按我这个护理等级，现在一个月总共多少钱？（不要只问床位费）',
    '护理费、餐费、水电、纸尿裤这些是含在内还是另收？',
    '押金多少、什么条件下能退、多久到账？',
    '最近一次调价是什么时候、调了多少？',
  ],
};

/* ── 入口分流：先选一条路 ─────────────────────────────── */

export type Branch = 'home' | 'facility';

export interface BranchOption {
  value: Branch;
  tag: string;
  title: string;
  desc: string;
  cta: string;
}

export const branchOptions: BranchOption[] = [
  {
    value: 'home',
    tag: '约 4 分钟 · 推荐',
    title: '先做居家自测',
    desc: '判断居家还撑不撑得住。撑得住，给一份居家注意事项；差一点，看社区服务能不能补上；真撑不住，再收窄机构类型。',
    cta: '开始自测',
  },
  {
    value: 'facility',
    tag: '跳过自测',
    title: '直接看机构类型',
    desc: '已知要进机构、不想再判断居家。跳过前两步，直接看五类机构各管什么，先弄清自己该找哪一类。',
    cta: '直接看机构',
  },
];

/* ── 机构侧：五类载体 ─────────────────────────────────── */

export interface InstitutionType {
  key: string;
  name: string;
  /** 性质标签 */
  tag: string;
  /** 医疗能力 */
  medical: string;
  /** 适合谁 */
  fitFor: string;
  /**
   * 价位量级（不是报价）。只写数量级，不写区间——
   * 同一家机构报价随入住率浮动，写死数字会误导，见 docs 4.1。
   */
  scale: string;
  /** 一句提醒 */
  caution: string;
}

export const institutionTypes: InstitutionType[] = [
  {
    key: 'nursing-home',
    name: '养老院',
    tag: '生活照料机构',
    medical: '内设基本医疗，可刷医保；不具备抢救能力，急症要转医院',
    fitFor: '自理到二级护理',
    scale: '数千元级／月',
    caution: '门槛最低，但别指望它处理急症。',
  },
  {
    key: 'care-hospital',
    name: '护理院',
    tag: '医疗机构',
    medical: '医生、护士、药剂师齐全，能处理抢救',
    fitFor: '三级以上护理、医疗依赖高',
    scale: '数千元到万元级／月，医疗自费部分另计',
    caution: '属医疗机构、主要走医保，不是「养老院升级版」。',
  },
  {
    key: 'rehab-hospital',
    name: '康复医院',
    tag: '医院（多为二级资质）',
    medical: '专业康复训练，针对中风后、骨折后等功能恢复',
    fitFor: '病后短期集中康复',
    scale: '按疗程计费，医保覆盖比例高于养老机构',
    caution: '有住院周期，通常不是长期养老的地方。',
  },
  {
    key: 'ccrc',
    name: '康养社区（CCRC）',
    tag: '高端养老机构',
    medical: '以内设医疗为主，部分自建护理院',
    fitFor: '能自理的活力老人、预算充裕',
    scale: '2 万元级／月起，另计会员费或押金',
    caution: '多为会员或押金制，前期资金门槛高，退费条款要看清。',
  },
  {
    key: 'dementia-unit',
    name: '认知症照护单元',
    tag: '机构内的专区',
    medical: '记忆照护、封闭管理，护理配比高于普通区',
    fitFor: '失智、五级护理',
    scale: '在所属机构的同类护理费上加价一档',
    caution: '它不是独立机构，是在前四类里找的专区。',
  },
];

export const institutionNotice =
  '「认知症照护单元」不另设一类，它就设在养老院或护理院里——该问的是「你们有没有记忆照护专区」，而不是去找一家「认知症照护院」。另外，「康养社区」是机构，和「社区养老」（日间照料、上门服务）不是一回事。名称各地不统一，参访先问一句：有没有医疗执业许可，能不能做你要的那项护理。';

/** 机构侧（跳过居家自测）的入口说明 */
export const facilityBranchIntro =
  '你跳过了居家自测，直接从机构这一侧看。下面先分清五类载体各管什么，弄清该找哪一类，再谈预算与参访。';

/** 机构侧待办：P2 的护理等级自查 + 类型匹配 */
export const facilityNextStep = {
  title: '护理等级自查 + 类型匹配',
  desc: '按护理等级、医疗需求、预算逐层排除，收窄到一到两类，并给一份可打印的参访提问清单。',
};

