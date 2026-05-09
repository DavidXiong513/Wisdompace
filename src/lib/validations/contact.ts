import { z } from 'zod';

/**
 * 联系表单 API 的 Zod Schema
 */

/** POST /api/contact */
export const ContactSchema = z.object({
  name: z.string().min(1, '请填写称呼').max(100),
  identity: z.string().min(1, '请填写身份').max(100),
  interest: z.string().min(1, '请填写感兴趣的方向').max(200),
  company: z.string().max(200).optional(),
  email: z.string().email('邮箱格式有误').max(200).optional().or(z.literal('')),
  phone: z.string().min(1, '请填写联系方式').max(100),
  budget: z.string().min(1, '请填写预算范围').max(100),
  message: z.string().min(1, '请填写留言内容').max(5000),
  // Honeypot — 机器人会填，人类不会（前端隐藏字段）
  // ⚠️ 不能用 .max(0)，否则机器人填值时 Zod 会 400 拒绝，
  // 暴露蜜罐字段存在。必须允许任意值通过验证，再在业务逻辑中静默拦截。
  website: z.string().optional(),
});
