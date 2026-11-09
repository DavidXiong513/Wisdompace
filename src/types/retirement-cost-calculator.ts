/**
 * 晚年花费测算 — 类型定义
 *
 * 计算范围：从退休（或当前年龄，若已退休）到规划终点。
 * 退休前的日常消费不在本工具覆盖范围内。
 * 所有金额单位均为「元」，并按当前购买力静态测算。
 */

export type HouseholdMode = 'single' | 'couple';

export type HealthStatus = 'good' | 'fair' | 'chronic' | 'frail' | 'needs-care';

export type ExpenseCategoryKey =
  | 'basicLiving'
  | 'housing'
  | 'medical'
  | 'lifestyle'
  | 'care'
  | 'majorIllness'
  | 'funeral'
  | 'buffer';

/** 可拖动调整的支出类别 */
export type AdjustableExpenseKey = 'basicLiving' | 'housing' | 'medical' | 'lifestyle' | 'care';

export type SpendingScales = Record<AdjustableExpenseKey, number>;

export interface RetirementCostInput {
  // ── 生命坐标 ──
  currentAge: number;
  retirementAge: number;
  /** 规划终点年龄（基准寿命） */
  planningAge: number;
  /** 从生命余光带入的参考寿命，用于展示来源 */
  referenceLifespan?: number;
  /** 生命余光结果导入时间（ISO） */
  lifespanImportedAt?: string;
  householdMode: HouseholdMode;

  // ── 收支底盘 ──
  monthlyPension: number;
  otherMonthlyIncome: number;
  /** 可动用养老储备 */
  movableReserve: number;
  /** 自住房等不可直接动用的家庭资产，仅作参考，不计入可覆盖资金 */
  nonLiquidAssets: number;
  basicLivingMonthly: number;
  housingMonthly: number;
  /** 退休后年度医疗净自付 */
  medicalAnnual: number;

  // ── 生活方式与热爱 ──
  interestsMonthly: number;
  /** 兴趣、国内旅行、社交人情的持续到龄 */
  lifestyleUntilAge: number;
  domesticTripsPerYear: number;
  domesticTripCost: number;
  overseasTripEveryYears: number;
  overseasTripCost: number;
  overseasUntilAge: number;
  socialAnnual: number;
  wishListTotal: number;
  /** 标记为不可牺牲的热爱预算 */
  protectLifestyle: boolean;

  // ── 健康与照护 ──
  healthStatus: HealthStatus;
  careStartAge: number;
  careYears: number;
  /** 每月净照护自付（日常生活之外的增量） */
  careMonthlyNet: number;
  majorIllnessReserve: number;
  funeralCost: number;
  /** 应急预备金比例，0-30 */
  emergencyReserveRate: number;
}

export interface ExpenseCategory {
  key: ExpenseCategoryKey;
  label: string;
  amount: number;
  share: number;
}

export interface ScenarioResult {
  key: 'base' | 'plus5' | 'plus10';
  label: string;
  planningAge: number;
  years: number;
  totalExpenses: number;
  totalIncome: number;
  availableFunds: number;
  gap: number;
  surplus: number;
  coverageRate: number;
}

export interface RetirementCostResult {
  startAge: number;
  yearsToRetirement: number;
  retirementYears: number;
  base: ScenarioResult;
  scenarios: ScenarioResult[];
  categories: ExpenseCategory[];
  totalExpenses: number;
  totalIncome: number;
  movableReserve: number;
  nonLiquidAssets: number;
  availableFunds: number;
  gap: number;
  surplus: number;
  coverageRate: number;
  careYearsUsed: number;
  careAnnualNet: number;
  careShare: number;
  lifestyleShare: number;
  emergencyReserve: number;
  /** 照护期每多 1 年，需要额外准备的净照护支出 */
  carePerExtraYear: number;
  warnings: string[];
}

export interface HealthPreset {
  key: HealthStatus;
  label: string;
  description: string;
  careStartAgeOffset: number;
  careYears: number;
}
