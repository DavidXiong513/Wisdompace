import {
  DEFAULT_SPENDING_SCALES,
  EXPENSE_CATEGORY_LABELS,
} from '@/data/retirement-cost-calculator/defaults';
import type {
  ExpenseCategory,
  ExpenseCategoryKey,
  RetirementCostInput,
  RetirementCostResult,
  ScenarioResult,
  SpendingScales,
} from '@/types/retirement-cost-calculator';

const MAX_AGE = 120;

function safeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function money(value: number): number {
  return Math.max(0, safeNumber(value));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function roundYuan(value: number): number {
  return Math.round(value);
}

function scaleOf(scales: SpendingScales | undefined, key: keyof SpendingScales): number {
  const value = scales?.[key];
  if (!Number.isFinite(value) || value === undefined) {
    return DEFAULT_SPENDING_SCALES[key];
  }
  return clamp(value, 0.3, 1.8);
}

export function getRetirementStartAge(input: RetirementCostInput): number {
  const currentAge = clamp(safeNumber(input.currentAge, 60), 0, MAX_AGE);
  const retirementAge = clamp(safeNumber(input.retirementAge, currentAge), 0, MAX_AGE);
  return Math.max(currentAge, retirementAge);
}

interface PlanAmounts {
  startAge: number;
  years: number;
  categories: Record<ExpenseCategoryKey, number>;
  total: number;
  income: number;
}

function calculatePlanAmounts(
  input: RetirementCostInput,
  planningAge: number,
  careYearsOverride: number,
  scales: SpendingScales = DEFAULT_SPENDING_SCALES
): PlanAmounts {
  const startAge = getRetirementStartAge(input);
  const endAge = clamp(safeNumber(planningAge, startAge), 0, MAX_AGE);
  const years = Math.max(0, endAge - startAge);

  if (years === 0) {
    return {
      startAge,
      years: 0,
      categories: {
        basicLiving: 0,
        housing: 0,
        medical: 0,
        lifestyle: 0,
        care: 0,
        majorIllness: 0,
        funeral: 0,
        buffer: 0,
      },
      total: 0,
      income: 0,
    };
  }

  const careStartAge = clamp(
    safeNumber(input.careStartAge, endAge),
    startAge,
    endAge
  );

  const lifestyleEndAge = Math.min(
    endAge,
    Math.max(startAge, safeNumber(input.lifestyleUntilAge, startAge)),
    careStartAge
  );
  const lifestyleYears = Math.max(0, lifestyleEndAge - startAge);
  const overseasEndAge = Math.min(
    endAge,
    Math.max(startAge, safeNumber(input.overseasUntilAge, startAge)),
    careStartAge
  );
  const overseasYears = Math.max(0, overseasEndAge - startAge);

  const basicLiving =
    money(input.basicLivingMonthly) * 12 * years * scaleOf(scales, 'basicLiving');
  const housing = money(input.housingMonthly) * 12 * years * scaleOf(scales, 'housing');
  const medical = money(input.medicalAnnual) * years * scaleOf(scales, 'medical');

  const interests = money(input.interestsMonthly) * 12 * lifestyleYears;
  const domestic =
    money(input.domesticTripsPerYear) * money(input.domesticTripCost) * lifestyleYears;
  const overseasInterval = Math.max(1, safeNumber(input.overseasTripEveryYears, 1));
  const overseas = (money(input.overseasTripCost) / overseasInterval) * overseasYears;
  const social = money(input.socialAnnual) * lifestyleYears;
  const wishList = money(input.wishListTotal);
  const lifestyle =
    (interests + domestic + overseas + social + wishList) * scaleOf(scales, 'lifestyle');

  const availableCareYears = Math.max(0, endAge - careStartAge);
  const careYears = clamp(
    safeNumber(careYearsOverride, input.careYears),
    0,
    availableCareYears
  );
  const care = money(input.careMonthlyNet) * 12 * careYears * scaleOf(scales, 'care');

  const majorIllness = money(input.majorIllnessReserve);
  const funeral = money(input.funeralCost);

  const subtotal = basicLiving + housing + medical + lifestyle + care + majorIllness + funeral;
  const buffer =
    subtotal * (clamp(safeNumber(input.emergencyReserveRate, 10), 0, 30) / 100);

  const categories: Record<ExpenseCategoryKey, number> = {
    basicLiving: roundYuan(basicLiving),
    housing: roundYuan(housing),
    medical: roundYuan(medical),
    lifestyle: roundYuan(lifestyle),
    care: roundYuan(care),
    majorIllness: roundYuan(majorIllness),
    funeral: roundYuan(funeral),
    buffer: roundYuan(buffer),
  };

  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  const income =
    (money(input.monthlyPension) + money(input.otherMonthlyIncome)) * 12 * years;

  return { startAge, years, categories, total, income };
}

function buildScenario(
  input: RetirementCostInput,
  key: ScenarioResult['key'],
  label: string,
  planningAge: number,
  careYears: number,
  scales: SpendingScales
): { scenario: ScenarioResult; categories: Record<ExpenseCategoryKey, number> } {
  const plan = calculatePlanAmounts(input, planningAge, careYears, scales);
  const totalIncome = roundYuan(plan.income);
  const availableFunds = roundYuan(totalIncome + money(input.movableReserve));
  const gap = Math.max(0, plan.total - availableFunds);
  const surplus = Math.max(0, availableFunds - plan.total);
  const coverageRate = plan.total > 0 ? availableFunds / plan.total : 1;

  return {
    scenario: {
      key,
      label,
      planningAge,
      years: plan.years,
      totalExpenses: plan.total,
      totalIncome,
      availableFunds,
      gap,
      surplus,
      coverageRate,
    },
    categories: plan.categories,
  };
}

export function calculateRetirementCost(
  input: RetirementCostInput,
  scales: SpendingScales = DEFAULT_SPENDING_SCALES
): RetirementCostResult {
  const startAge = getRetirementStartAge(input);
  const planningAge = clamp(
    safeNumber(input.planningAge, Math.max(startAge + 1, 85)),
    startAge,
    MAX_AGE
  );

  const baseCalc = buildScenario(
    input,
    'base',
    '基准情景',
    planningAge,
    input.careYears,
    scales
  );
  const plus5 = buildScenario(
    input,
    'plus5',
    '寿命 +5 年',
    Math.min(MAX_AGE, planningAge + 5),
    input.careYears,
    scales
  );
  const plus10 = buildScenario(
    input,
    'plus10',
    '寿命 +10 年',
    Math.min(MAX_AGE, planningAge + 10),
    input.careYears,
    scales
  );

  const base = baseCalc.scenario;
  const categories: ExpenseCategory[] = (
    Object.keys(baseCalc.categories) as ExpenseCategoryKey[]
  ).map((key) => ({
    key,
    label: EXPENSE_CATEGORY_LABELS[key],
    amount: baseCalc.categories[key],
    share: base.totalExpenses > 0 ? baseCalc.categories[key] / base.totalExpenses : 0,
  }));

  const careStartAge = clamp(
    safeNumber(input.careStartAge, planningAge),
    startAge,
    Math.max(startAge, planningAge)
  );
  const careYearsUsed = clamp(
    safeNumber(input.careYears, 0),
    0,
    Math.max(0, planningAge - careStartAge)
  );

  const warnings: string[] = [];
  if (planningAge <= startAge) {
    warnings.push('规划终点必须晚于退休起始年龄，请调整年龄设置。');
  }
  if (money(input.monthlyPension) + money(input.otherMonthlyIncome) === 0) {
    warnings.push('尚未填写退休金或其他稳定收入，结果会显示较大缺口。');
  }
  if (money(input.movableReserve) === 0) {
    warnings.push('尚未填写可动用养老储备；自住房等资产不会自动计入。');
  }
  if (money(input.careMonthlyNet) === 0 && careYearsUsed > 0) {
    warnings.push('照护年数大于 0，但净照护月支出为 0，请确认是否漏填。');
  }
  if (planningAge < safeNumber(input.currentAge, 0)) {
    warnings.push('规划终点早于当前年龄，请检查寿命与年龄设置。');
  }

  const careAmount = baseCalc.categories.care;
  const lifestyleAmount = baseCalc.categories.lifestyle;

  return {
    startAge,
    yearsToRetirement: Math.max(0, safeNumber(input.retirementAge, startAge) - safeNumber(input.currentAge, startAge)),
    retirementYears: base.years,
    base,
    scenarios: [base, plus5.scenario, plus10.scenario],
    categories,
    totalExpenses: base.totalExpenses,
    totalIncome: base.totalIncome,
    movableReserve: roundYuan(money(input.movableReserve)),
    nonLiquidAssets: roundYuan(money(input.nonLiquidAssets)),
    availableFunds: base.availableFunds,
    gap: base.gap,
    surplus: base.surplus,
    coverageRate: base.coverageRate,
    careYearsUsed,
    careAnnualNet: roundYuan(money(input.careMonthlyNet) * 12 * scaleOf(scales, 'care')),
    careShare: base.totalExpenses > 0 ? careAmount / base.totalExpenses : 0,
    lifestyleShare: base.totalExpenses > 0 ? lifestyleAmount / base.totalExpenses : 0,
    emergencyReserve: baseCalc.categories.buffer,
    carePerExtraYear: roundYuan(money(input.careMonthlyNet) * 12 * scaleOf(scales, 'care')),
    warnings,
  };
}
