import { 
  Answer, 
  DecisionResult, 
  DimensionScore, 
  Scenario 
} from '@/types/three-questions';

/**
 * ThreeQSA (三思清单) 评分引擎
 * 核心逻辑：加权平均分 + 维度均衡性分析 + 风险评估
 */

export function calculateDecisionResult(
  scenario: Scenario,
  answers: Answer[],
  sessionId: string
): DecisionResult {
  const dimensionMap: Record<string, { total: number; weightedSum: number; count: number }> = {};

  // 1. 初始化维度容器
  scenario.questions.forEach(q => {
    const dim = q.dimension.replace('维度', ''); // 统一维度名称
    if (!dimensionMap[dim]) {
      dimensionMap[dim] = { total: 0, weightedSum: 0, count: 0 };
    }
  });

  // 2. 累加得分
  answers.forEach(ans => {
    const question = scenario.questions.find(q => q.id === ans.questionId);
    if (!question) return;

    const dim = question.dimension.replace('维度', '');
    // 计算加权分：基础分(1-5) * 权重 * 风险调节系数
    const weightedScore = ans.score * question.weight * (1 + question.risk * 0.2);
    
    dimensionMap[dim].weightedSum += weightedScore;
    dimensionMap[dim].total += 5 * question.weight * (1 + question.risk * 0.2); // 该项最高可能加权分
    dimensionMap[dim].count += 1;
  });

  // 3. 计算维度结果
  const dimensionScores: DimensionScore[] = Object.entries(dimensionMap).map(([dim, data]) => ({
    dimension: dim,
    score: Number((data.weightedSum / data.count).toFixed(2)),
    maxScore: 5, // 归一化到 5 分制
    percentage: data.total > 0 ? Math.round((data.weightedSum / data.total) * 100) : 0
  }));

  // 4. 计算综合分与风险等级
  const avgPercentage = dimensionScores.reduce((sum, d) => sum + d.percentage, 0) / dimensionScores.length;
  const overallScore = Math.round(avgPercentage);

  // 判定风险：如果心理预期维度的百分比显著低于平均值，则判定为高风险（即：头脑发热）
  const expectationDim = dimensionScores.find(d => d.dimension.includes('预期'));
  const riskLevel = (expectationDim && expectationDim.percentage < 40) ? 'high' : (overallScore < 60 ? 'medium' : 'low');

  // 5. 生成建议
  let suggestion = "";
  if (overallScore >= 85) {
    suggestion = "你的决策共识度极高。你不仅清晰地知道为何而战，也做好了充分的心理建设。这是一个相对成熟且坚定的选择。";
  } else if (overallScore >= 60) {
    suggestion = "目前的决策处于『可行区间』。你在价值观上是认同的，但可能在某些现实预期或替代方案上还存有疑虑。建议针对得分较低的维度进行二次深思。";
  } else {
    suggestion = "建议暂时按下暂停键。目前的评估显示，你可能尚未看清该选择的长期代价，或者内心的冲突依然剧烈。强制推进可能会带来不可控的心理或现实压力。";
  }

  if (riskLevel === 'high') {
    suggestion += "\n\n⚠️ 预警：你的心理预期准备严重不足。在行动前，请务必详细推演一次『最坏情况』并确认自己是否真的能接受。";
  }

  return {
    sessionId,
    overallScore,
    dimensionScores,
    riskLevel,
    suggestion
  };
}
