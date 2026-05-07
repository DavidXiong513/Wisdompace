/**
 * 生前预嘱数据类型
 * 对应 assessments 表中 type='living-will' 的 result JSONB 结构
 * 数据字段与独立 HTML 版本 index.html 的 state 对象一一对应
 */

export type ScenarioChoice = 'yes' | 'no' | 'conditional' | null;

export interface WitnessInfo {
  name: string;
  relation: string;
  phone: string;
}

export interface LivingWillData {
  /** 数据格式版本，用于未来迁移兼容 */
  version: string;

  /** 完成时间（ISO 8601） */
  completedAt: string;

  /** 愿望一：医疗服务选项 ID 列表 */
  wish1: string[];
  wish1Supplement: string;

  /** 愿望二：生命支持治疗 */
  wish2Abandon: string[];
  scenarioTerminal: ScenarioChoice;
  scenarioComa: ScenarioChoice;
  scenarioVegetative: ScenarioChoice;
  wish2Supplement: string;

  /** 愿望三：个人情感意愿 */
  wish3: string[];
  wish3Supplement: string;

  /** 愿望四：家人朋友信息 */
  wish4: string[];
  wish4Supplement: string;

  /** 愿望五：见证人 */
  witness1: WitnessInfo;
  witness2: WitnessInfo;

  /** 签署信息 */
  declarationAgreed: boolean;
  signName: string;
  signDate: string;
}

/** 创建空的 LivingWillData */
export function createEmptyLivingWillData(): LivingWillData {
  return {
    version: '1.0',
    completedAt: '',
    wish1: [],
    wish1Supplement: '',
    wish2Abandon: [],
    scenarioTerminal: null,
    scenarioComa: null,
    scenarioVegetative: null,
    wish2Supplement: '',
    wish3: [],
    wish3Supplement: '',
    wish4: [],
    wish4Supplement: '',
    witness1: { name: '', relation: '', phone: '' },
    witness2: { name: '', relation: '', phone: '' },
    declarationAgreed: false,
    signName: '',
    signDate: '',
  };
}

/** 验证函数：检查数据是否完整可提交 */
export function validateLivingWill(
  data: Partial<LivingWillData>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!data.declarationAgreed) missing.push('declarationAgreed');
  if (!data.signName?.trim()) missing.push('signName');
  if (!data.signDate) missing.push('signDate');
  return { valid: missing.length === 0, missing };
}
