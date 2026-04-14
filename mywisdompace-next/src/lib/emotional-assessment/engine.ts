import { AssessmentAnswers, AssessmentResult, ModuleResult, LifeEventsResult } from '@/types/emotional-assessment';

// 反向计分题号 (1-based)
const EMOTION_REVERSE = [2, 5, 6, 11, 12, 14, 16, 17, 18, 20];
const TENSION_REVERSE = [5, 9, 13, 17, 19];

const LEVEL_CONFIGS: Record<number, { name: string; suggestion: string }> = {
  1: {
    name: '状态良好',
    suggestion: '保持规律的睡眠时间，每晚7-8小时。每周进行3-5次有氧运动（快走、游泳、瑜伽）。保持健康生活方式，定期自我关怀，无需特殊干预。',
  },
  2: {
    name: '稍有波动',
    suggestion: '存在轻微波动，注意情绪调节。每天安排让自己开心的小事，培养兴趣爱好；练习腹式呼吸，尝试正念练习，专注于当下时刻。',
  },
  3: {
    name: '值得关注',
    suggestion: '存在一定程度的困扰。建议学习放松技巧（冥想、深呼吸），减少可识别的压力源，与亲友沟通感受，保证充足睡眠。',
  },
  4: {
    name: '建议调节',
    suggestion: '状态值得关注。建议适当减少工作/学习负担，将身心健康放在首位。不要独自面对，告知信任的人，建议寻求专业心理咨询。',
  },
  5: {
    name: '建议关注',
    suggestion: '状态需要适当关注。建议尽快预约专业心理咨询，与专业人士聊聊；与信任的家人朋友分享感受，保持社交联系。',
  },
};

/**
 * 计算情绪状态评分
 */
function calculateEmotion(answers: Record<number, number>): ModuleResult {
  let rawScore = 0;
  for (let i = 1; i <= 20; i++) {
    const score = answers[i] || 1;
    if (EMOTION_REVERSE.includes(i)) {
      rawScore += 5 - score;
    } else {
      rawScore += score;
    }
  }

  const standardScore = Math.round(rawScore * 1.25);
  let level = 0;
  let levelName = '良好';

  if (standardScore < 40) {
    level = 0;
    levelName = '良好';
  } else if (standardScore < 50) {
    level = 1;
    levelName = '稍有波动';
  } else if (standardScore < 60) {
    level = 2;
    levelName = '值得关注';
  } else {
    level = 3;
    levelName = '建议关注';
  }

  return { rawScore, standardScore, level, levelName };
}

/**
 * 计算紧张状态评分
 */
function calculateTension(answers: Record<number, number>): ModuleResult {
  let rawScore = 0;
  for (let i = 1; i <= 20; i++) {
    const score = answers[i] || 1;
    if (TENSION_REVERSE.includes(i)) {
      rawScore += 5 - score;
    } else {
      rawScore += score;
    }
  }

  const standardScore = Math.round(rawScore * 1.25);
  let level = 0;
  let levelName = '良好';

  if (standardScore < 50) {
    level = 0;
    levelName = '良好';
  } else if (standardScore < 60) {
    level = 1;
    levelName = '稍有波动';
  } else if (standardScore < 70) {
    level = 2;
    levelName = '值得关注';
  } else {
    level = 3;
    levelName = '建议关注';
  }

  return { rawScore, standardScore, level, levelName };
}

/**
 * 三维综合评估算法
 */
export function calculateAssessment(
  answers: AssessmentAnswers,
  lesTotalLcu: number,
  lesHighCount: number
): AssessmentResult {
  const emotionResult = calculateEmotion(answers.emotion);
  const tensionResult = calculateTension(answers.tension);

  const eCode = emotionResult.level;
  const tCode = tensionResult.level;

  // 生活压力分级
  let lCode = 0;
  let lLevelName = '压力较低';
  if (lesTotalLcu < 150) {
    lCode = 0;
    lLevelName = '压力较低';
  } else if (lesTotalLcu <= 300) {
    lCode = 1;
    lLevelName = '有一定压力';
  } else {
    lCode = 2;
    lLevelName = '压力较大';
  }

  // 基础等级 E×T矩阵
  let baseLevel = 1;
  if (eCode === 0 && tCode === 0) baseLevel = 1;
  else if (eCode === 0 && tCode === 1) baseLevel = 2;
  else if (eCode === 0 && tCode >= 2) baseLevel = tCode === 2 ? 3 : 4;
  else if (eCode === 1 && tCode <= 1) baseLevel = tCode === 0 ? 2 : 3;
  else if (eCode === 1 && tCode >= 2) baseLevel = tCode === 2 ? 3 : 4;
  else if (eCode >= 2) {
    baseLevel = 4; // if eCode == 2 else 4 -> always 4 initially
    if (eCode === 3 || tCode >= 2) baseLevel = Math.min(baseLevel + 1, 5);
    if (eCode === 3 && tCode >= 2) baseLevel = 5;
  }

  // 压力调整因子
  if (lCode === 1 && baseLevel <= 2) baseLevel += 1;
  else if (lCode === 2 && baseLevel <= 3) baseLevel += 1;

  // 特殊关注检测
  const warnings: string[] = [];

  // 关注1: 消极想法 (第19题得分 >= 3)
  if (answers.emotion[19] >= 3) {
    baseLevel = Math.min(baseLevel + 1, 5);
    warnings.push('消极想法关注：情绪评估中可能存在消极想法');
  }

  // 关注2: 情绪-紧张双指标偏高
  if (emotionResult.standardScore >= 50 && tensionResult.standardScore >= 50) {
    baseLevel = Math.min(baseLevel + 1, 5);
    warnings.push('双指标偏高：情绪和紧张均达到值得关注及以上');
  }

  // 关注3: 高压叠加效应
  if (lesHighCount >= 3 && (eCode >= 2 || tCode >= 2)) {
    baseLevel = Math.min(baseLevel + 1, 5);
    warnings.push(`高压叠加：多项高压事件 (${lesHighCount}项) 叠加情绪/紧张困扰`);
  }

  // 关注4: 持续性状态
  const emotionHighFreqCount = Object.values(answers.emotion).filter((s) => s >= 3).length;
  const tensionHighFreqCount = Object.values(answers.tension).filter((s) => s >= 3).length;

  if (emotionHighFreqCount >= 10) {
    baseLevel = Math.min(baseLevel + 1, 5);
    warnings.push('持续性状态关注：情绪评估中有多项症状频繁出现');
  }
  if (tensionHighFreqCount >= 10) {
    baseLevel = Math.min(baseLevel + 1, 5);
    warnings.push('持续性状态关注：紧张评估中有多项症状频繁出现');
  }

  const finalLevel = Math.max(1, Math.min(baseLevel, 5));
  const config = LEVEL_CONFIGS[finalLevel];

  return {
    emotion: emotionResult,
    tension: tensionResult,
    lifeEvents: {
      lcuTotal: lesTotalLcu,
      level: lCode,
      levelName: lLevelName,
      highStressCount: lesHighCount,
    },
    comprehensiveLevel: finalLevel,
    comprehensiveName: config.name,
    suggestion: config.suggestion,
    warnings: warnings,
  };
}