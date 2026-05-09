'use no memo';

/**
 * 速率限制工具 — 基于 IP + 滑动窗口
 *
 * 设计考量：
 * - Vercel Serverless 每个实例独立，内存限流不能跨实例共享
 * - 但单实例内仍然有效，且零外部依赖、零延迟
 * - 对普通攻击（脚本小子、低频暴力破解）足够抵御
 * - 如需分布式限流，可升级到 @upstash/rate-limit + Upstash Redis
 *
 * 使用方式：
 *   const result = checkRateLimit(request, { windowMs: 60000, max: 10 });
 *   if (!result.success) return NextResponse.json(..., { status: 429 });
 */

import { type NextRequest } from 'next/server';
import { getClientIp, logRateLimited } from '@/lib/security-logger';

// ==================== 类型定义 ====================

export interface RateLimitConfig {
  /** 时间窗口（毫秒） */
  windowMs: number;
  /** 窗口内最大请求数 */
  max: number;
  /** 限流键前缀（用于区分不同路由） */
  keyPrefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

// ==================== 内存存储 ====================

interface Bucket {
  count: number;
  resetTime: number;
}

// Map<key, Bucket> — 单实例内存存储
const store = new Map<string, Bucket>();

// 每 5 分钟清理一次过期条目，防止内存泄漏
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, bucket] of store) {
    if (now >= bucket.resetTime) {
      store.delete(key);
    }
  }
}

// ==================== 核心逻辑 ====================

/**
 * 检查速率限制
 */
export function checkRateLimit(request: NextRequest, config: RateLimitConfig): RateLimitResult {
  cleanup();

  const ip = getClientIp(request);
  const key = `${config.keyPrefix ?? 'rl'}:${ip}`;
  const now = Date.now();

  let bucket = store.get(key);

  // 如果没有桶或窗口已过期，创建新桶
  if (!bucket || now >= bucket.resetTime) {
    bucket = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    store.set(key, bucket);

    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      resetMs: bucket.resetTime,
    };
  }

  // 窗口内计数
  bucket.count++;

  if (bucket.count > config.max) {
    // 记录速率限制触发事件
    logRateLimited(request.nextUrl?.pathname ?? 'unknown', ip, {
      limit: config.max,
      windowMs: config.windowMs,
    });
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      resetMs: bucket.resetTime,
    };
  }

  return {
    success: true,
    limit: config.max,
    remaining: config.max - bucket.count,
    resetMs: bucket.resetTime,
  };
}

/**
 * 构建速率限制响应头
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetMs / 1000)),
  };
}

// ==================== 预设配置 ====================

/** 各路由的速率限制预设 */
export const RATE_LIMITS = {
  /** 登录：5次/分钟（防暴力破解） */
  login: { windowMs: 60_000, max: 5, keyPrefix: 'login' },
  /** 注册：3次/分钟 */
  register: { windowMs: 60_000, max: 3, keyPrefix: 'register' },
  /** 联系表单：5次/分钟（防垃圾邮件） */
  contact: { windowMs: 60_000, max: 5, keyPrefix: 'contact' },
  /** AI 对话：10次/分钟（防刷 Token） */
  chat: { windowMs: 60_000, max: 10, keyPrefix: 'chat' },
  /** 搜索：30次/分钟 */
  search: { windowMs: 60_000, max: 30, keyPrefix: 'search' },
  /** 通用 API：60次/分钟 */
  api: { windowMs: 60_000, max: 60, keyPrefix: 'api' },
} as const;
