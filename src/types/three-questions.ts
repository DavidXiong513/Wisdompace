/**
 * ThreeQSA (三思清单) 类型定义
 */

export type DecisionDimension = '价值观' | '心理预期' | '稀缺' | '价值观维度' | '心理预期维度' | '稀缺性维度';

export interface Question {
  id: string;
  text: string;
  dimension: DecisionDimension;
  weight: number; // 计分权重
  risk: number;   // 风险/深度系数
}

export interface Scenario {
  id: string;
  name: string;
  category: string; // 新增：分类（如：生活、职业等）
  icon: string;
  description: string;
  questions: Question[];
}

export interface Answer {
  questionId: string;
  score: number; // 1-5 分
}

export interface DecisionSession {
  id: string;           // 唯一会话 ID
  scenarioId: string;   // 关联的场景 ID
  title: string;        // 用户自定义的决策标题（如：要不要换工作）
  answers: Answer[];
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface DimensionScore {
  dimension: string;
  score: number;        // 该维度平均分
  maxScore: number;     // 该维度最高可能得分
  percentage: number;   // 达成率
}

export interface DecisionResult {
  sessionId: string;
  overallScore: number;
  dimensionScores: DimensionScore[];
  riskLevel: 'low' | 'medium' | 'high';
  suggestion: string;   // 基于得分生成的建议文案
}
