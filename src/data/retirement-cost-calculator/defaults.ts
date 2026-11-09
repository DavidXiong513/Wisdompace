import type {
  AdjustableExpenseKey,
  ExpenseCategoryKey,
  HealthPreset,
  RetirementCostInput,
  SpendingScales,
} from '@/types/retirement-cost-calculator';

export const RETIREMENT_COST_STORAGE_KEY = 'wp-retirement-cost-calculator-storage';

export const DEFAULT_RETIREMENT_AGE = {
  male: 63,
  female: 58,
} as const;

export const DEFAULT_INPUT: RetirementCostInput = {
  currentAge: 60,
  retirementAge: DEFAULT_RETIREMENT_AGE.male,
  planningAge: 85,
  householdMode: 'single',

  monthlyPension: 0,
  otherMonthlyIncome: 0,
  movableReserve: 0,
  nonLiquidAssets: 0,
  basicLivingMonthly: 0,
  housingMonthly: 0,
  medicalAnnual: 0,

  interestsMonthly: 0,
  lifestyleUntilAge: 75,
  domesticTripsPerYear: 0,
  domesticTripCost: 0,
  overseasTripEveryYears: 3,
  overseasTripCost: 0,
  overseasUntilAge: 72,
  socialAnnual: 0,
  wishListTotal: 0,
  protectLifestyle: false,

  healthStatus: 'fair',
  careStartAge: 80,
  careYears: 3,
  careMonthlyNet: 0,
  majorIllnessReserve: 0,
  funeralCost: 0,
  emergencyReserveRate: 10,
};

export const DEFAULT_SPENDING_SCALES: SpendingScales = {
  basicLiving: 1,
  housing: 1,
  medical: 1,
  lifestyle: 1,
  care: 1,
};

export const ADJUSTABLE_EXPENSE_KEYS: AdjustableExpenseKey[] = [
  'basicLiving',
  'housing',
  'medical',
  'lifestyle',
  'care',
];

export const ADJUSTABLE_EXPENSE_LABELS: Record<AdjustableExpenseKey, string> = {
  basicLiving: '日常生活',
  housing: '住房支出',
  medical: '常规医疗',
  lifestyle: '热爱与旅行',
  care: '照护支出',
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategoryKey, string> = {
  basicLiving: '日常生活',
  housing: '住房支出',
  medical: '常规医疗',
  lifestyle: '热爱与旅行',
  care: '照护支出',
  majorIllness: '大病预留',
  funeral: '身后安排',
  buffer: '应急预备金',
};

export const HEALTH_PRESETS: HealthPreset[] = [
  {
    key: 'good',
    label: '良好',
    description: '行动自如，慢病可控',
    careStartAgeOffset: -2,
    careYears: 2,
  },
  {
    key: 'fair',
    label: '一般',
    description: '有些小毛病，基本自理',
    careStartAgeOffset: -4,
    careYears: 3,
  },
  {
    key: 'chronic',
    label: '慢病稳定',
    description: '需要长期用药与复诊',
    careStartAgeOffset: -7,
    careYears: 4,
  },
  {
    key: 'frail',
    label: '身体较弱',
    description: '日常事务需要他人帮助',
    careStartAgeOffset: -10,
    careYears: 5,
  },
  {
    key: 'needs-care',
    label: '目前已需照护',
    description: '已经开始接受长期照顾',
    careStartAgeOffset: -999,
    careYears: 5,
  },
];

export const HOUSEHOLD_OPTIONS: { key: RetirementCostInput['householdMode']; label: string; description: string }[] = [
  {
    key: 'single',
    label: '只算我自己',
    description: '按个人退休金、个人支出测算',
  },
  {
    key: 'couple',
    label: '我和伴侣',
    description: '退休金与支出均按两人合计填写',
  },
];
