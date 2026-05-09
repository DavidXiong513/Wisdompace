import { z } from 'zod';

/**
 * 对话相关 API 的 Zod Schema
 */

/** 消息角色白名单 */
const MessageRoleSchema = z.enum(['system', 'user', 'assistant']);

/** 单条消息 */
export const MessageSchema = z.object({
  role: MessageRoleSchema,
  content: z.string().min(1).max(8000),
});

/** POST /api/conversations — 创建对话 */
export const CreateConversationSchema = z.object({
  title: z.string().max(200).optional(),
  messages: z.array(MessageSchema).max(50).default([]),
});

/** PATCH /api/conversations/[id] — 更新对话标题 */
export const UpdateConversationSchema = z.object({
  title: z.string().min(1).max(200),
});

/** 路由参数 [id] */
export const ConversationIdSchema = z.object({
  id: z.string().uuid(),
});
