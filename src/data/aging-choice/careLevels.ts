/**
 * 护理等级自查 · 数据层
 *
 * 重要边界：
 * 1. 这里的五级护理是「通用分级的通俗描述」，用于用户自评落在哪一档，
 *    **不是** GB/T 42195-2022 的评估条目，也不是长护险失能等级。
 * 2. 四套分级（五级护理 / GB/T 42195 / 长护险失能等级 / 上海统一需求评估）
 *    并存，**禁止互相换算**，页面上只能给"大致对应"的定性说明。
 * 3. 一切以正式评估结论为准，本自查只用于"先想清楚该找哪类机构"。
 */

export type CareLevel = 1 | 2 | 3 | 4 | 5;

export interface CareLevelDef {
  level: CareLevel;
  name: string;
  /** 一句话定性 */
  summary: string;
  /** 自评判据：能 / 不能做什么 */
  criteria: string[];
  /** 这一档居家还能不能撑 */
  homeVerdict: string;
  /** 大致对应哪类机构（一句话，不写死） */
  facilityHint: string;
}

export const careLevels: CareLevelDef[] = [
  {
    level: 1,
    name: '一级 · 基本自理',
    summary: '日常基本能自己来，真正要做的是防跌倒、防意外。',
    criteria: [
      '进食、穿衣、如厕、洗澡基本独立',
      '能独立行走，可短距离外出',
      '偶有遗忘，但不影响安全',
      '不需要夜间看护',
    ],
    homeVerdict: '居家完全可行。把适老化改造做好，接上社区服务即可。',
    facilityHint: '养老院或康养社区都能承接，但现阶段没有必要。',
  },
  {
    level: 2,
    name: '二级 · 需要搭把手',
    summary: '有几件事需要协助，但不需要全天候照护。',
    criteria: [
      '洗澡、剪指甲、穿衣等需要协助',
      '如厕偶尔需要帮助',
      '行走独立，但慢或不稳',
      '需要有人定时提醒吃药',
    ],
    homeVerdict: '居家可行，条件是每天有人看一眼，再加社区服务补位。',
    facilityHint: '需要机构时，养老院与康养社区都能承接。',
  },
  {
    level: 3,
    name: '三级 · 明显依赖',
    summary: '多项日常需要协助。这是「居家还能撑」与「该考虑机构」的分水岭。',
    criteria: [
      '穿衣、如厕、洗澡中至少两项需要协助',
      '进食需要部分帮助，或需要软食、碎食',
      '行走需要拐杖、助行器，外出需要陪同',
      '白天可能需要有人看着',
    ],
    homeVerdict:
      '居家勉强能撑，但需要稳定照护人力——老伴或子女全职、或请到靠谱的住家陪护。时间一长容易出问题。',
    facilityHint: '护理院是主要选项；部分养老院的护理型床位也能承接。',
  },
  {
    level: 4,
    name: '四级 · 大部分依赖',
    summary: '多数日常事务依赖他人，需要 24 小时有人在旁。',
    criteria: [
      '卧床或长期依赖轮椅',
      '进食、翻身、如厕、清洁都需要协助',
      '有压疮、吞咽困难或误吸风险',
      '夜间需要起夜照护',
    ],
    homeVerdict: '居家很难长期维持。要么请到 24 小时专业陪护，要么转机构。',
    facilityHint: '护理院是主力，需要专业护理人力。',
  },
  {
    level: 5,
    name: '五级 · 完全依赖',
    summary: '完全依赖他人，且通常伴随医疗护理需求或认知障碍。',
    criteria: [
      '完全卧床，全部生活照料依赖他人',
      '需要鼻饲、导尿、吸痰、压疮护理等专业操作',
      '或存在中重度认知障碍（走失、失认、失语）',
      '需要医护人员定期介入',
    ],
    homeVerdict: '居家基本不可行。专业护理与应急能力都不是家庭能长期提供的。',
    facilityHint: '护理院；若为认知障碍，另需记忆照护专区。',
  },
];

export function careLevelOf(level: CareLevel | null): CareLevelDef | null {
  if (!level) return null;
  return careLevels.find((l) => l.level === level) ?? null;
}

/* ── 医疗需求 ─────────────────────────────────────────── */

export type MedicalNeed = 'none' | 'periodic' | 'postAcute' | 'emergency' | 'dementia';

export interface MedicalNeedOption {
  value: MedicalNeed;
  label: string;
  desc: string;
}

export const medicalNeedOptions: MedicalNeedOption[] = [
  {
    value: 'none',
    label: '没有特殊医疗需求',
    desc: '主要是生活照料，不需要定期做医疗处置。',
  },
  {
    value: 'periodic',
    label: '需要定期专业处置',
    desc: '血透、腹透、管路维护、伤口换药、造口护理等，需要医护定期操作。',
  },
  {
    value: 'postAcute',
    label: '病后康复期',
    desc: '中风后、骨折后、术后，需要一段时间的集中康复训练。',
  },
  {
    value: 'emergency',
    label: '急症风险高',
    desc: '严重基础病、频发心衰或癫痫，出状况时需要能就地抢救。',
  },
  {
    value: 'dementia',
    label: '认知障碍，需要记忆照护',
    desc: '走失、失认、失语，或有明确的失智诊断。',
  },
];

/** 需要「医疗机构」能力的医疗需求 */
export const medicalNeedsRequiringHospital: MedicalNeed[] = [
  'periodic',
  'emergency',
  'postAcute',
  'dementia',
];

/* ── 预算档位 ─────────────────────────────────────────── */

export type BudgetTier = 'economy' | 'mid' | 'high' | 'unknown';

export interface BudgetTierOption {
  value: BudgetTier;
  label: string;
  /** 量级描述，不落具体数字 */
  scale: string;
}

export const budgetTierOptions: BudgetTierOption[] = [
  { value: 'economy', label: '经济档', scale: '数千元级' },
  { value: 'mid', label: '中档', scale: '近万元级' },
  { value: 'high', label: '高端', scale: '万元级以上' },
  { value: 'unknown', label: '还没定', scale: '先看类型，再算钱' },
];

export const careLevelNotice =
  '这里的五级是便于自评的通俗分档，不等同于 GB/T 42195-2022 老年人能力评估，也不等同于长护险失能等级。四套分级不能互相换算，正式结论请以当地评估机构为准。';
