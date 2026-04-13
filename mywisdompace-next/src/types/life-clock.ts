/**
 * LifeClock (生命余光) 类型定义
 */

export type BMILevel = '过瘦' | '偏瘦' | '正常' | '超重' | '肥胖';

export interface LifeClockInput {
  // 基础信息
  birthDate: string; // YYYY-MM-DD
  gender: 'male' | 'female';
  height: number; // cm
  weight: number; // kg
  
  // 家族与健康 (1-4 对应小程序 ID)
  lifespanExpectancy: number; // 家族寿命预期级别 (1: 短, 4: 长)
  hereditaryDisease: number; // 遗传病史 (1: 有, 2: 无)
  
  // 生活方式 (1-5 级别)
  workRestLevel: number; // 作息
  dietLevel: number; // 饮食
  emotionLevel: number; // 情绪
  
  // 行为习惯
  exerciseIndex: number; // 运动频率 (0-3)
  badHabits: {
    stayUpLate: boolean; // 熬夜
    smoking: boolean; // 烟
    drinking: boolean; // 酒
    none: boolean; // 以上皆无
  };
  
  // 状态系数
  psychologicalState: number; // 1: 乐观, 2: 忧虑
}

export interface LifeClockResult {
  age: number; // 当前年龄
  bmi: number;
  bmiCategory: BMILevel;
  expectedLifespan: number; // 预计总寿命 (岁)
  remainingYears: number; // 剩余寿命 (年)
  totalMonths: number; // 总生命格数
  pastMonths: number; // 已消耗格数
  
  // 时间拆解 (用于实时倒计时)
  countdown: {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}
