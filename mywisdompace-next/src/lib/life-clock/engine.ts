import { LifeClockInput, LifeClockResult, BMILevel } from '@/types/life-clock';

/**
 * LifeClock (生命余光) 计算引擎
 * 复刻自 LifeClockD 小程序算法
 */

const BASE_LIFE = 78.6;

/**
 * 计算 BMI 及等级
 */
export function calculateBMI(weight: number, height: number): { bmi: number; category: BMILevel } {
  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  
  let category: BMILevel = '正常';
  if (bmi < 18.5) category = '过瘦';
  else if (bmi < 24) category = '正常';
  else if (bmi < 28) category = '超重';
  else category = '肥胖';
  
  return { bmi, category };
}

/**
 * 计算年龄
 */
export function calculateAge(birthDate: string): number {
  if (!birthDate) return 30;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(age, 0);
}

/**
 * 获取生活方式等级加分
 * 1(-5), 2(-2), 3(0), 4(+3), 5(+5)
 */
function getAdjustmentFromLevel(level: number): number {
  const map: Record<number, number> = { 1: -5, 2: -2, 3: 0, 4: 3, 5: 5 };
  return map[level] || 0;
}

/**
 * 核心寿命预测算法
 */
export function calculateLifeExpectancy(input: LifeClockInput): LifeClockResult {
  const age = calculateAge(input.birthDate);
  const { bmi, category: bmiCategory } = calculateBMI(input.weight, input.height);
  
  let adjustment = 0;

  // 1. BMI 调整
  if (bmiCategory === '正常') adjustment += 5;
  else if (bmiCategory === '过瘦' || bmiCategory === '肥胖') adjustment -= 3;

  // 2. 家族寿命
  const lifespanMap: Record<number, number> = { 1: -5, 2: -3, 3: 2, 4: 5 };
  adjustment += lifespanMap[input.lifespanExpectancy] || 0;

  // 3. 遗传病
  adjustment += input.hereditaryDisease === 1 ? -5 : 3;

  // 4. 生活方式 (作息、饮食、情绪)
  adjustment += getAdjustmentFromLevel(input.workRestLevel);
  adjustment += getAdjustmentFromLevel(input.dietLevel);
  adjustment += getAdjustmentFromLevel(input.emotionLevel);

  // 5. 运动频率
  const exerciseMap = [-3, 0, 3, 5];
  adjustment += exerciseMap[input.exerciseIndex] || 0;

  // 6. 不良习惯
  if (input.badHabits.none) {
    adjustment += 8;
  } else {
    const counts = [
      input.badHabits.stayUpLate,
      input.badHabits.smoking,
      input.badHabits.drinking
    ].filter(Boolean).length;
    
    if (counts === 3) adjustment -= 10;
    else if (counts === 2) adjustment -= 6;
    else if (counts === 1) {
      adjustment += input.badHabits.smoking ? -4 : -3;
    }
  }

  // 7. 心理状态系数
  const coefficient = input.psychologicalState === 2 ? 0.92 : 1.0;

  // 计算预计寿命
  let expectedLifespan = (BASE_LIFE + adjustment) * coefficient;
  // 最小寿命兜底
  expectedLifespan = Math.max(expectedLifespan, 58, age + 1);
  expectedLifespan = Number(expectedLifespan.toFixed(1));

  const remainingYears = Math.max(0, expectedLifespan - age);
  
  // 8. 计算时间分量 (用于倒计时)
  const totalMonths = Math.round(expectedLifespan * 12);
  const pastMonths = Math.round(age * 12);
  
  // 这里暂时返回年数拆解，更细致的秒级倒计时由 Hook 处理
  const years = Math.floor(remainingYears);
  const months = Math.floor((remainingYears - years) * 12);
  const days = Math.floor(((remainingYears - years) * 12 - months) * 30);

  return {
    age,
    bmi,
    bmiCategory,
    expectedLifespan,
    remainingYears,
    totalMonths,
    pastMonths,
    countdown: {
      years,
      months,
      days,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  };
}
