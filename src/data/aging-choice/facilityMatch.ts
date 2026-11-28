/**
 * 机构类型匹配（排除法）
 *
 * 顺序：护理等级 → 医疗需求 → 预算档位（只标注、不排除）
 * 依据 docs/居家养老还是去养老院-规划方案.md 4.1 / 4.4：
 *   类型回答「能不能做某件事」，档位回答「花多少钱」，两者正交。
 *   预算不参与排除，只做同类型内部的档位提示。
 */

import type { BudgetTier, CareLevel, MedicalNeed } from './careLevels';

export type InstitutionKey =
  | 'nursing-home'
  | 'care-hospital'
  | 'rehab-hospital'
  | 'ccrc';

export interface Capability {
  key: InstitutionKey;
  name: string;
  /** 能承接的护理等级 */
  levels: CareLevel[];
  /** 最适合的护理等级（排序加权用） */
  coreLevels: CareLevel[];
  /** 能承接的医疗需求 */
  medical: MedicalNeed[];
  /** 常见档位 */
  tiers: BudgetTier[];
  position: string;
  /** 主要支付渠道（措辞已按 5.2 规范处理） */
  payment: string;
}

export const capabilities: Capability[] = [
  {
    key: 'nursing-home',
    name: '养老院',
    levels: [1, 2, 3],
    coreLevels: [1, 2, 3],
    medical: ['none', 'dementia'],
    tiers: ['economy', 'mid', 'high'],
    position: '生活照料为主，内设基本医疗，不具备抢救能力。',
    payment:
      '以长期护理保险与养老服务消费补贴为主；能否结算、比例多少，以当地医保与民政部门口径为准。',
  },
  {
    key: 'care-hospital',
    name: '护理院',
    levels: [1, 2, 3, 4, 5],
    coreLevels: [4, 5],
    medical: ['none', 'periodic', 'emergency', 'postAcute', 'dementia'],
    tiers: ['economy', 'mid', 'high'],
    position: '医疗机构，医生护士药剂师齐全，能处理抢救。',
    payment:
      '以基本医疗保险为主（多为一级医院待遇）；若同时是长护险定点，也可能叠加机构护理待遇。',
  },
  {
    key: 'rehab-hospital',
    name: '康复医院',
    levels: [2, 3, 4],
    coreLevels: [2, 3],
    medical: ['postAcute', 'periodic'],
    tiers: ['mid', 'high'],
    position: '医院资质，专业康复训练，有住院周期。',
    payment: '以基本医疗保险住院统筹为主，覆盖比例通常高于养老机构。',
  },
  {
    key: 'ccrc',
    name: '康养社区（CCRC）',
    levels: [1, 2],
    coreLevels: [1, 2],
    medical: ['none'],
    tiers: ['high'],
    position: '高端养老机构，面向能自理的活力老人，多为会员或押金制。',
    payment: '以自费为主；部分内设医疗机构可刷医保，需单独确认。',
  },
];

const TIER_LABEL: Record<BudgetTier, string> = {
  economy: '经济档',
  mid: '中档',
  high: '高端',
  unknown: '未定档',
};

const LEVEL_NAME: Record<CareLevel, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
};

const MEDICAL_NAME: Record<MedicalNeed, string> = {
  none: '无特殊医疗需求',
  periodic: '定期专业处置',
  postAcute: '病后康复',
  emergency: '急症风险高',
  dementia: '认知障碍',
};

export interface TypeVerdict {
  key: InstitutionKey;
  name: string;
  kept: boolean;
  score: number;
  /** 保留的理由 */
  reasons: string[];
  /** 排除的理由 */
  blockers: string[];
  /** 档位提示（不排除，只说明） */
  tierNote?: string;
  /** 是否需要记忆照护专区 */
  dementiaZone: boolean;
  payment: string;
  position: string;
}

export interface MatchInput {
  level: CareLevel | null;
  medical: MedicalNeed[];
  tier: BudgetTier;
}

export interface MatchResult {
  primary: TypeVerdict | null;
  secondary: TypeVerdict | null;
  excluded: TypeVerdict[];
  /** 命中了认知障碍，结论需带记忆照护专区 */
  dementiaOnly: boolean;
  notice: string;
}

export function matchFacilities(input: MatchInput): MatchResult {
  const level = input.level;
  const medical = input.medical.length > 0 ? input.medical : (['none'] as MedicalNeed[]);
  const tier = input.tier;
  const hasDementia = medical.includes('dementia');

  const verdicts: TypeVerdict[] = capabilities.map((cap) => {
    const reasons: string[] = [];
    const blockers: string[] = [];
    let score = 0;

    // ① 护理等级
    if (level && cap.levels.includes(level)) {
      score += 3;
      reasons.push(`能承接${LEVEL_NAME[level]}护理`);
      if (cap.coreLevels.includes(level)) score += 2;
    } else if (level) {
      blockers.push(
        `${LEVEL_NAME[level]}护理超出它的承接范围——${
          cap.key === 'ccrc'
            ? '康养社区面向能自理的活力老人，护理等级上去后要转到内设护理院或其他机构'
            : cap.key === 'nursing-home'
              ? '养老院不具备 24 小时专业护理与急救能力'
              : '它的护理能力主要覆盖更低或更高的等级'
        }`
      );
    }

    // ② 医疗需求
    const unmetMedical = medical.filter((m) => !cap.medical.includes(m));
    if (unmetMedical.length === 0) {
      score += 2;
      if (!medical.includes('none')) {
        reasons.push(`能承接${medical.map((m) => MEDICAL_NAME[m]).join('、')}`);
      }
    } else {
      blockers.push(
        `不具备${unmetMedical.map((m) => MEDICAL_NAME[m]).join('、')}的处置能力——${
          cap.key === 'nursing-home' || cap.key === 'ccrc'
            ? '它属生活照料机构，没有医疗执业许可，急症只能转院'
            : '这类需求需要医院资质'
        }`
      );
    }

    // ③ 康复医院专属：只有病后康复才进候选
    if (cap.key === 'rehab-hospital') {
      if (medical.includes('postAcute')) {
        score += 2;
        reasons.push('病后康复是它的主责，训练强度与专业度高于养老机构');
      } else {
        blockers.push('它的定位是病后短期集中康复，有住院周期，不适合长期居住');
      }
    }

    // ④ 档位（不排除，只提示）
    let tierNote: string | undefined;
    if (tier !== 'unknown' && !cap.tiers.includes(tier)) {
      if (cap.key === 'ccrc' && tier !== 'high') {
        tierNote = `康养社区基本落在高端档，${TIER_LABEL[tier]}预算通常对不上`;
      } else {
        tierNote = `常见于${cap.tiers.map((t) => TIER_LABEL[t]).join('、')}，${TIER_LABEL[tier]}需再核对`;
      }
    } else if (tier !== 'unknown') {
      score += 1;
      // 档位越窄越精确，同分时优先（如康养社区只对应高端）
      if (cap.tiers.length === 1) score += 1;
    }

    // ⑤ 记忆照护专区
    const dementiaZone = hasDementia && cap.medical.includes('dementia');
    if (dementiaZone) score += 2;

    return {
      key: cap.key,
      name: cap.name,
      kept: blockers.length === 0,
      score,
      reasons,
      blockers,
      tierNote,
      dementiaZone,
      payment: cap.payment,
      position: cap.position,
    };
  });

  const kept = verdicts
    .filter((v) => v.kept)
    // 同分时保留 capabilities 的排列顺序（生活照料 → 医疗机构 → 高端社区）。
    // 不用名称排序——中文名首字会把「康养社区」排到「养老院」前面，与预算无关地抬高高端选项。
    .sort((a, b) => b.score - a.score);
  const excluded = verdicts.filter((v) => !v.kept);

  return {
    primary: kept[0] ?? null,
    secondary: kept[1] ?? null,
    excluded,
    dementiaOnly: hasDementia,
    notice: hasDementia
      ? '记忆照护不是一个独立的机构类型，它是设在养老院或护理院里的专区。找的时候问「有没有记忆照护专区」，而不是找「认知症照护院」。'
      : '类型只回答「能不能做这件事」，同一类型内部从经济档到高端都能差两三倍——档位可以再选，类型选错就要重来。',
  };
}
