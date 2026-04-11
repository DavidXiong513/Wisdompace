import { z } from 'zod';

/** 测评类型枚举 */
export const AssessmentTypeEnum = z.enum([
  'mbti',
  'big-five',
  'ability',
  'career-values',
  // 未来扩展只需在这里加新类型
]);

export type AssessmentType = z.infer<typeof AssessmentTypeEnum>;

/** 保存/创建测评结果的请求体 */
export const SaveAssessmentSchema = z.object({
  type: AssessmentTypeEnum,
  result: z.record(z.string(), z.unknown()), // 允许任意 JSONB 结构
});

export type SaveAssessmentInput = z.infer<typeof SaveAssessmentSchema>;
