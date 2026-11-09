import { describe, expect, it } from 'vitest';
import { calculateRetirementCost } from '../engine';
import { DEFAULT_INPUT, DEFAULT_SPENDING_SCALES } from '@/data/retirement-cost-calculator/defaults';
import type { RetirementCostInput } from '@/types/retirement-cost-calculator';

function input(overrides: Partial<RetirementCostInput> = {}): RetirementCostInput {
  return {
    ...DEFAULT_INPUT,
    currentAge: 60,
    retirementAge: 63,
    planningAge: 80,
    monthlyPension: 0,
    otherMonthlyIncome: 0,
    movableReserve: 0,
    nonLiquidAssets: 0,
    basicLivingMonthly: 0,
    housingMonthly: 0,
    medicalAnnual: 0,
    interestsMonthly: 0,
    domesticTripsPerYear: 0,
    domesticTripCost: 0,
    overseasTripEveryYears: 3,
    overseasTripCost: 0,
    overseasUntilAge: 72,
    lifestyleUntilAge: 75,
    socialAnnual: 0,
    wishListTotal: 0,
    careStartAge: 80,
    careYears: 0,
    careMonthlyNet: 0,
    majorIllnessReserve: 0,
    funeralCost: 0,
    emergencyReserveRate: 10,
    ...overrides,
  };
}

describe('calculateRetirementCost', () => {
  it('只计算退休后的年限，并计入 10% 应急预备金', () => {
    const result = calculateRetirementCost(
      input({
        currentAge: 60,
        retirementAge: 63,
        planningAge: 80,
        basicLivingMonthly: 10000,
      })
    );

    expect(result.startAge).toBe(63);
    expect(result.retirementYears).toBe(17);
    expect(result.categories.find((c) => c.key === 'basicLiving')?.amount).toBe(2040000);
    expect(result.emergencyReserve).toBe(204000);
    expect(result.totalExpenses).toBe(2244000);
    expect(result.totalIncome).toBe(0);
    expect(result.gap).toBe(2244000);
  });

  it('已经退休时从当前年龄开始计算', () => {
    const result = calculateRetirementCost(
      input({
        currentAge: 68,
        retirementAge: 63,
        planningAge: 80,
        basicLivingMonthly: 1000,
      })
    );

    expect(result.startAge).toBe(68);
    expect(result.retirementYears).toBe(12);
  });

  it('可动用储备计入覆盖资金，非流动资产不计入', () => {
    const result = calculateRetirementCost(
      input({
        basicLivingMonthly: 10000,
        movableReserve: 500000,
        nonLiquidAssets: 5000000,
      })
    );

    expect(result.availableFunds).toBe(500000);
    expect(result.gap).toBe(1744000);
  });

  it('兴趣与国内旅行只计算到设定年龄', () => {
    const result = calculateRetirementCost(
      input({
        planningAge: 80,
        lifestyleUntilAge: 75,
        interestsMonthly: 1000,
        domesticTripsPerYear: 2,
        domesticTripCost: 5000,
      })
    );

    const lifestyle = result.categories.find((c) => c.key === 'lifestyle')?.amount ?? 0;
    // 12 年 × (1000×12 + 2×5000) = 264000
    expect(lifestyle).toBe(264000);
  });

  it('境外旅行按“每 N 年一次”摊成年度成本', () => {
    const result = calculateRetirementCost(
      input({
        planningAge: 80,
        overseasUntilAge: 72,
        overseasTripEveryYears: 3,
        overseasTripCost: 60000,
      })
    );

    const lifestyle = result.categories.find((c) => c.key === 'lifestyle')?.amount ?? 0;
    expect(lifestyle).toBe(180000);
  });

  it('照护期开始后，旅行与兴趣支出停止累计', () => {
    const result = calculateRetirementCost(
      input({
        planningAge: 80,
        lifestyleUntilAge: 75,
        interestsMonthly: 1000,
        careStartAge: 70,
        careYears: 3,
        careMonthlyNet: 0,
      })
    );

    const lifestyle = result.categories.find((c) => c.key === 'lifestyle')?.amount ?? 0;
    // 从 63 岁到照护起始 70 岁，共 7 年 × 12000 = 84000
    expect(lifestyle).toBe(84000);
  });

  it('照护年数不会超过规划终点', () => {
    const result = calculateRetirementCost(
      input({
        planningAge: 80,
        careStartAge: 78,
        careYears: 10,
        careMonthlyNet: 5000,
      })
    );

    expect(result.careYearsUsed).toBe(2);
    expect(result.categories.find((c) => c.key === 'care')?.amount).toBe(120000);
  });

  it('调整支出比例后重新计算总额与应急预备金', () => {
    const result = calculateRetirementCost(
      input({ basicLivingMonthly: 10000 }),
      { ...DEFAULT_SPENDING_SCALES, basicLiving: 0.5 }
    );

    expect(result.categories.find((c) => c.key === 'basicLiving')?.amount).toBe(1020000);
    expect(result.emergencyReserve).toBe(102000);
    expect(result.totalExpenses).toBe(1122000);
  });

  it('寿命 +5 / +10 年的支出不低于基准情景', () => {
    const result = calculateRetirementCost(
      input({
        basicLivingMonthly: 5000,
        monthlyPension: 4000,
      })
    );

    expect(result.scenarios[1].totalExpenses).toBeGreaterThan(result.scenarios[0].totalExpenses);
    expect(result.scenarios[2].totalExpenses).toBeGreaterThan(result.scenarios[1].totalExpenses);
  });

  it('规划终点不晚于起始年龄时返回零支出并给出提示', () => {
    const result = calculateRetirementCost(
      input({
        currentAge: 80,
        retirementAge: 63,
        planningAge: 80,
        basicLivingMonthly: 5000,
      })
    );

    expect(result.totalExpenses).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('未填写收入与储备时给出提示', () => {
    const result = calculateRetirementCost(input({ basicLivingMonthly: 1000 }));

    expect(result.warnings.some((warning) => warning.includes('退休金'))).toBe(true);
    expect(result.warnings.some((warning) => warning.includes('可动用养老储备'))).toBe(true);
  });

  it('负数金额按 0 处理', () => {
    const result = calculateRetirementCost(
      input({
        basicLivingMonthly: -10000,
        movableReserve: -500000,
      })
    );

    expect(result.totalExpenses).toBe(0);
    expect(result.availableFunds).toBe(0);
  });
});
