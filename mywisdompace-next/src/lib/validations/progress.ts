import { z } from 'zod';

/** 进度分类枚举 */
export const ProgressCategoryEnum = z.enum([
  'chapter-read',    // 章节阅读
  'tool-completed',  // 测评/工具完成
  'milestone',       // 人生里程碑
  // 未来扩展
]);

export type ProgressCategory = z.infer<typeof ProgressCategoryEnum>;

/** 进度值结构：不同 category 对应不同 value 结构 */
export const ProgressValueSchema = z.discriminatedUnion('type', [
  // 章节阅读进度
  z.object({
    type: z.literal('chapter-read'),
    sectionId: z.string().optional(),
    scrollPercent: z.number().min(0).max(100).optional(),
    completedAt: z.string().datetime().optional(),
  }),
  // 测评/工具完成
  z.object({
    type: z.literal('tool-completed'),
    score: z.record(z.string(), z.unknown()).optional(),  // 测评得分
    timeSpentSeconds: z.number().int().min(0).optional(),
    completedAt: z.string().datetime(),
  }),
  // 里程碑
  z.object({
    type: z.literal('milestone'),
    title: z.string().optional(),
    description: z.string().optional(),
    achievedAt: z.string().datetime(),
  }),
]);

export type ProgressValue = z.infer<typeof ProgressValueSchema>;

/** 保存/更新进度的请求体 */
export const UpsertProgressSchema = z.object({
  category: ProgressCategoryEnum,
  key: z.string().min(1).max(200),
  value: z.record(z.string(), z.unknown()), // 任意 JSONB 结构
});

export type UpsertProgressInput = z.infer<typeof UpsertProgressSchema>;
