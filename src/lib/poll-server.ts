import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getClientIp } from '@/lib/security-logger';

/**
 * 投票工具的共享服务端逻辑
 *
 * 为什么必须用 service_role：
 * poll_votes 的 RLS 是「禁止公开读取」（明细含完整答案，属于隐私数据），
 * 用 anon key 查明细和 count 一律返回空 / 0。
 * 所以「写入去重」「回查历史」「统计总票数」三条链路都只能走 service_role。
 */

/** 统一的工具标识，避免各路由各写一份字符串 */
export const POLL_TOOL_ID = 'community-aging-poll';

/**
 * 创建 service_role 客户端（绕过 RLS）
 * 未配置 key 时返回 null，由调用方给出明确错误，而不是静默失败。
 */
export function createPollServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * 落库前先哈希：数据库里只留不可还原的摘要，
 * 既能做防刷审计，又不构成对个人身份的存储。
 */
export function hashValue(raw: string): string {
  const salt = process.env.POLL_HASH_SALT ?? 'wisdompace-poll';
  return createHash('sha256').update(`${salt}:${raw}`).digest('hex').slice(0, 32);
}

/** 从请求中提取 IP / UA 摘要 */
export function hashRequestOrigin(request: NextRequest): {
  ipHash: string;
  uaHash: string;
} {
  const ip = getClientIp(request) || 'unknown';
  const ua = request.headers.get('user-agent') ?? 'unknown';
  return { ipHash: hashValue(ip), uaHash: hashValue(ua) };
}

/**
 * 判断是否为「列不存在」错误。
 * 迁移 005 尚未在线上库执行时，user_id / ip_hash 等字段还不存在，
 * 此时写入会报 PostgREST 的 PGRST204 或 schema cache 相关错误。
 * 命中后降级为基础字段写入，保证投票数据先能进库。
 */
export function isMissingColumnError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  if (error.code === 'PGRST204') return true;

  const msg = error.message ?? '';
  return (
    msg.includes('user_id') ||
    msg.includes('ip_hash') ||
    msg.includes('user_agent_hash') ||
    msg.includes('schema cache')
  );
}
