/**
 * 人物关系分类体系
 * 九大一级分类 + 二级细分
 *
 * 设计原则：
 * - 初始信任值仅为建议默认值，用户可通过「第一印象」滑块自由调整
 * - 观察周期越长，信任衰减越慢（关系越稳固）
 * - 衰减速度反映关系维护难度
 */

export interface CategoryConfig {
  id: string;
  label: string;
  initialTrust: number;
  minTrust: number;
  observeCycleDays: number;
  decayRate: number;
  maxDecay: number;
  defaultDimensions: string[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'parent',
    label: '父母',
    initialTrust: 75,
    minTrust: 70,
    observeCycleDays: 180,
    decayRate: 1,
    maxDecay: 5,
    defaultDimensions: ['integrity', 'empathy', 'emotionalStability'],
  },
  {
    id: 'family',
    label: '亲戚',
    initialTrust: 65,
    minTrust: 55,
    observeCycleDays: 90,
    decayRate: 1,
    maxDecay: 10,
    defaultDimensions: ['integrity', 'empathy', 'emotionalStability'],
  },
  {
    id: 'intimate',
    label: '亲密关系',
    initialTrust: 55,
    minTrust: 42,
    observeCycleDays: 60,
    decayRate: 1,
    maxDecay: 13,
    defaultDimensions: ['emotionalStability', 'empathy', 'integrity'],
  },
  {
    id: 'friend',
    label: '朋友',
    initialTrust: 45,
    minTrust: 30,
    observeCycleDays: 45,
    decayRate: 1,
    maxDecay: 15,
    defaultDimensions: ['reliability', 'integrity', 'diligence'],
  },
  {
    id: 'classmate',
    label: '同窗',
    initialTrust: 40,
    minTrust: 28,
    observeCycleDays: 60,
    decayRate: 1,
    maxDecay: 12,
    defaultDimensions: ['reliability', 'integrity', 'diligence'],
  },
  {
    id: 'colleague',
    label: '同事',
    initialTrust: 35,
    minTrust: 22,
    observeCycleDays: 30,
    decayRate: 1,
    maxDecay: 13,
    defaultDimensions: ['diligence', 'reliability', 'integrity'],
  },
  {
    id: 'circle',
    label: '圈子',
    initialTrust: 20,
    minTrust: 10,
    observeCycleDays: 21,
    decayRate: 2,
    maxDecay: 10,
    defaultDimensions: ['reliability', 'integrity'],
  },
  {
    id: 'stranger',
    label: '陌生人',
    initialTrust: 10,
    minTrust: 5,
    observeCycleDays: 14,
    decayRate: 2,
    maxDecay: 5,
    defaultDimensions: ['reliability', 'integrity'],
  },
  {
    id: 'other',
    label: '其他',
    initialTrust: 25,
    minTrust: 10,
    observeCycleDays: 30,
    decayRate: 1,
    maxDecay: 15,
    defaultDimensions: ['reliability', 'integrity'],
  },
];

export const SUB_CATEGORIES: Record<string, { id: string; label: string }[]> = {
  parent: [
    { id: 'biological', label: '亲生父母' },
    { id: 'stepAdoptive', label: '继养父母' },
    { id: 'inLaw', label: '公婆/岳父母' },
  ],
  family: [
    { id: 'siblings', label: '兄弟姐妹' },
    { id: 'uncleAunt', label: '叔伯姑舅' },
    { id: 'cousins', label: '堂表亲' },
    { id: 'grandElder', label: '祖辈/晚辈' },
    { id: 'inLaw', label: '姻亲' },
  ],
  intimate: [
    { id: 'spouse', label: '伴侣/配偶' },
    { id: 'lover', label: '恋人' },
    { id: 'ambiguous', label: '暧昧对象' },
  ],
  friend: [
    { id: 'bestie', label: '挚友/知己' },
    { id: 'close', label: '好友' },
    { id: 'normal', label: '普通朋友' },
  ],
  classmate: [
    { id: 'schoolmate', label: '同学/校友' },
    { id: 'comrade', label: '战友/同伍' },
    { id: 'roommate', label: '舍友/室友' },
  ],
  colleague: [
    { id: 'superior', label: '上级/领导' },
    { id: 'peer', label: '同级' },
    { id: 'subordinate', label: '下属' },
    { id: 'partner', label: '合作伙伴/客户' },
    { id: 'mentor', label: '导师/带教师傅' },
  ],
  circle: [
    { id: 'onlineFriend', label: '网络好友' },
    { id: 'hobby', label: '兴趣圈子' },
    { id: 'faith', label: '信仰圈' },
    { id: 'community', label: '社群成员' },
    { id: 'onlineOnly', label: '仅线上互动' },
  ],
  stranger: [
    { id: 'acquaintance', label: '初识' },
    { id: 'observed', label: '仅观察' },
  ],
  other: [
    { id: 'ex', label: '前任' },
    { id: 'nemesis', label: '冤家' },
    { id: 'custom', label: '自定义关系' },
  ],
};

export function getCategoryById(id: string): CategoryConfig | undefined {
  return CATEGORIES.find(c => c.id === id);
}

export function getSubCategories(categoryId: string) {
  return SUB_CATEGORIES[categoryId] || [];
}
