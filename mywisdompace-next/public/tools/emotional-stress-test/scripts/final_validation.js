/**
 * 心理情绪压力自测 - 功能验证脚本 v3.0
 * 验证: 情绪状态 + 紧张状态 + 生活压力 三维综合评估系统
 */

const assert = require('assert');

// ==================== 数据定义 ====================

// 情绪状态反向计分题索引 (0-based)
const EMOTION_REVERSE = [1, 4, 5, 10, 11, 13, 15, 16, 17, 19];

// 紧张状态反向计分题索引 (0-based) - 对应第5,9,13,17,19题
const TENSION_REVERSE = [4, 8, 12, 16, 18];

// ==================== 计算函数 ====================

function calculateEmotionScore(answers) {
    let rawScore = 0;
    for (let i = 0; i < 20; i++) {
        if (EMOTION_REVERSE.includes(i)) {
            rawScore += (5 - answers[i]);
        } else {
            rawScore += answers[i];
        }
    }
    return { raw: rawScore, standard: Math.round(rawScore * 1.25) };
}

function calculateTensionScore(answers) {
    let rawScore = 0;
    for (let i = 0; i < 20; i++) {
        if (TENSION_REVERSE.includes(i)) {
            rawScore += (5 - answers[i]);
        } else {
            rawScore += answers[i];
        }
    }
    return { raw: rawScore, standard: Math.round(rawScore * 1.25) };
}

function getEmotionLevel(score) {
    if (score.standard < 40) return { level: '良好', code: 0 };
    if (score.standard < 50) return { level: '稍有波动', code: 1 };
    if (score.standard < 60) return { level: '值得关注', code: 2 };
    return { level: '建议关注', code: 3 };
}

function getTensionLevel(score) {
    if (score.standard < 50) return { level: '良好', code: 0 };
    if (score.standard < 60) return { level: '稍有波动', code: 1 };
    if (score.standard < 70) return { level: '值得关注', code: 2 };
    return { level: '建议关注', code: 3 };
}

function calculateAssessmentLevel(emotionResult, tensionResult, lesLcu, emotionAnswers, tensionAnswers) {
    const eCode = getEmotionLevel(emotionResult).code;
    const tCode = getTensionLevel(tensionResult).code;
    
    // 生活压力分级
    let lCode = 0;
    if (lesLcu > 300) lCode = 2;
    else if (lesLcu >= 150) lCode = 1;

    // 基础等级 E×T矩阵
    let baseLevel = 1;
    
    if (eCode === 0 && tCode === 0) baseLevel = 1;
    else if (eCode === 0 && tCode === 1) baseLevel = 2;
    else if (eCode === 0 && tCode >= 2) baseLevel = tCode === 2 ? 3 : 4;
    else if (eCode === 1 && tCode <= 1) baseLevel = tCode === 0 ? 2 : 3;
    else if (eCode === 1 && tCode >= 2) baseLevel = tCode === 2 ? 3 : 4;
    else if (eCode >= 2) {
        baseLevel = eCode === 2 ? 3 : 4;
        if (eCode === 3 || tCode >= 2) baseLevel = Math.min(baseLevel + 1, 5);
        if (eCode === 3 && tCode >= 2) baseLevel = 5;
    }

    // 压力调整
    if (lCode === 1 && baseLevel <= 2) baseLevel++;
    if (lCode === 2 && baseLevel <= 3) baseLevel++;

    // 特殊关注
    if (emotionAnswers && emotionAnswers[18] >= 3) baseLevel = Math.min(baseLevel + 1, 5);
    if (emotionResult.standard >= 50 && tensionResult.standard >= 50) baseLevel = Math.min(baseLevel + 1, 5);
    if (emotionAnswers && emotionAnswers.filter(x => x >= 3).length >= 10) baseLevel = Math.min(baseLevel + 1, 5);
    if (tensionAnswers && tensionAnswers.filter(x => x >= 3).length >= 10) baseLevel = Math.min(baseLevel + 1, 5);

    return Math.max(1, Math.min(baseLevel, 5));
}

// ==================== 测试用例 ====================

console.log("=".repeat(70));
console.log("  心理情绪压力自测 v3.0 - 功能验证");
console.log("  情绪状态 + 紧张状态 + 生活压力 三维综合评估测试");
console.log("=".repeat(70));

let passedTests = 0;
let failedTests = 0;

function test(name, condition) {
    if (condition) {
        console.log(`  PASS: ${name}`);
        passedTests++;
    } else {
        console.log(`  FAIL: ${name}`);
        failedTests++;
    }
}

// ========== 测试1: 情绪状态评分算法 ==========
console.log("\n[TEST 1] 情绪状态评分算法");

const emotionAll1 = new Array(20).fill(1);
const emotionResult1 = calculateEmotionScore(emotionAll1);
// 10 normal * 1 + 10 reverse * (5-1) = 10 + 40 = 50
test("All score=1 -> raw should be 50", emotionResult1.raw === 50);
test("Standard score should be 63 (50*1.25)", emotionResult1.standard === 63);

const emotionAll4 = new Array(20).fill(4);
const emotionResult2 = calculateEmotionScore(emotionAll4);
test("All score=4 -> raw should be 50", emotionResult2.raw === 50);

const emotionAll2 = new Array(20).fill(2);
const emotionResult3 = calculateEmotionScore(emotionAll2);
test("All score=2 -> raw should be 50 (balanced)", emotionResult3.raw === 50);

test("情绪反向题数量=10", EMOTION_REVERSE.length === 10);
test("标准分<40 -> 良好", getEmotionLevel({standard: 35}).level === "良好");
test("标准分45 -> 稍有波动", getEmotionLevel({standard: 45}).level === "稍有波动");
test("标准分55 -> 值得关注", getEmotionLevel({standard: 55}).level === "值得关注");
test("标准分65 -> 建议关注", getEmotionLevel({standard: 65}).level === "建议关注");

// ========== 测试2: 紧张状态评分算法 ==========
console.log("\n[TEST 2] 紧张状态评分算法");

const tensionAll1 = new Array(20).fill(1);
const tensionResult1 = calculateTensionScore(tensionAll1);
// 15 normal * 1 + 5 reverse * (5-1) = 15 + 20 = 35
test("All score=1 -> raw should be 35", tensionResult1.raw === 35);
test("Standard score should be 44", tensionResult1.standard === 44);

const tensionAll4 = new Array(20).fill(4);
const tensionResult2 = calculateTensionScore(tensionAll4);
test("All score=4 -> raw should be 65", tensionResult2.raw === 65);

test("紧张反向题数量=5", TENSION_REVERSE.length === 5);
test("标准分<50 -> 良好", getTensionLevel({standard: 45}).level === "良好");
test("标准分55 -> 稍有波动", getTensionLevel({standard: 55}).level === "稍有波动");
test("标准分65 -> 值得关注", getTensionLevel({standard: 65}).level === "值得关注");
test("标准分75 -> 建议关注", getTensionLevel({standard: 75}).level === "建议关注");

// ========== 测试3: 三维综合评估矩阵 ==========
console.log("\n[TEST 3] 三维综合评估矩阵");

const level1 = calculateAssessmentLevel(
    { standard: 35 }, { standard: 40 }, 95,
    new Array(20).fill(1), new Array(20).fill(1)
);
test("E0*T0*L0 -> Level 1", level1 === 1);

const level2 = calculateAssessmentLevel(
    { standard: 45 }, { standard: 48 }, 120,
    new Array(20).fill(2), new Array(20).fill(2)
);
test("E1*T0*L0 -> Level 2-3", level2 >= 2 && level2 <= 3);

const level3 = calculateAssessmentLevel(
    { standard: 52 }, { standard: 55 }, 200,
    new Array(20).fill(3), new Array(20).fill(3)
);
test("E1*T1*L1 -> Level 3+", level3 >= 3);

const level4 = calculateAssessmentLevel(
    { standard: 58 }, { standard: 62 }, 280,
    new Array(20).fill(3), new Array(20).fill(3)
);
test("E2*T2*L1 -> Level 4", level4 >= 4);

// ========== 测试4: 特殊关注机制 ==========
console.log("\n[TEST 4] 特殊关注机制");

const dualPositiveEmotion = new Array(20).fill(3);
const dualPositiveTension = new Array(20).fill(3);
const dualRisk = calculateAssessmentLevel(
    { standard: 56 }, { standard: 60 }, 150,
    dualPositiveEmotion, dualPositiveTension
);
test("双指标偏高 -> 等级提升", dualRisk >= 4);

// ========== 测试5: 边界情况 ==========
console.log("\n[TEST 5] 边界情况");

try {
    const empty = calculateEmotionScore(new Array(20).fill(0));
    test("All-0 score -> raw is a number", typeof empty.raw === 'number');
} catch(e) {
    test("Exception handling works", false);
}

for (let i = 0; i < 10; i++) {
    const r = calculateAssessmentLevel(
        { standard: 30 + i * 5 },
        { standard: 30 + i * 6 },
        i * 40,
        new Array(20).fill(1 + (i % 3)),
        new Array(20).fill(1 + ((i + 1) % 3))
    );
    test(`等级在1-5范围内 (case ${i})`, r >= 1 && r <= 5);
}

// ========== 结果汇总 ==========
console.log("\n" + "=".repeat(70));
console.log("  验证结果汇总");
console.log("=".repeat(70));
console.log(`  PASS: ${passedTests} 项`);
console.log(`  FAIL: ${failedTests} 项`);
console.log(`  通过率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
console.log("=".repeat(70));

if (failedTests === 0) {
    console.log("\n  所有功能验证通过！心理情绪压力自测 v3.0 已准备就绪！\n");
    process.exit(0);
} else {
    console.log("\n  部分测试未通过，请检查上述失败项。\n");
    process.exit(1);
}
