import { z } from 'zod';

/**
 * 互动投票工具的 Zod 验证 Schema
 */

/** 答案中的单值 */
const AnswerValue = z.union([z.string(), z.array(z.string())]);

/** 完整答案对象：{ "0": "非常寄望", "1": ["独身","丁克"], ... } */
const AnswersRecord = z.record(z.string(), AnswerValue);

/** 提交投票 */
export const SubmitVoteSchema = z.object({
  tool_id: z.string().min(1, 'tool_id 必填'),
  session_id: z.string().uuid('session_id 需为有效 UUID'),
  answers: AnswersRecord,
  readiness_score: z.number().int().min(0).max(100),
});

/** 查询聚合参数 */
export const PollAggregatesQuerySchema = z.object({
  tool_id: z.string().min(1, 'tool_id 必填'),
});

export type SubmitVoteInput = z.infer<typeof SubmitVoteSchema>;
export type PollAggregatesQuery = z.infer<typeof PollAggregatesQuerySchema>;
