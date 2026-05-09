'use no memo';

/**
 * 统一 API 响应工具
 *
 * 安全原则：
 * - 生产环境不暴露内部错误细节（堆栈、错误码、SQL 信息等）
 * - 开发环境显示完整错误信息便于调试
 * - 所有 API 响应格式一致：{ success, data?, error? }
 */

import { NextResponse } from 'next/server';
import { isProduction } from '@/config/security.config';

// ==================== 成功响应 ====================

export function apiSuccess<T>(data: T, status = 200, headers?: Record<string, string>) {
  return NextResponse.json({ success: true as const, data }, { status, headers });
}

export function apiCreated<T>(data: T, headers?: Record<string, string>) {
  return apiSuccess(data, 201, headers);
}

// ==================== 错误响应 ====================

export function apiError(
  message: string,
  status: number,
  options?: {
    /** 仅在开发环境暴露的内部细节 */
    internalDetail?: string;
    headers?: Record<string, string>;
  }
) {
  const body: Record<string, unknown> = {
    success: false,
    error: message,
  };

  // 仅开发环境暴露内部细节
  if (options?.internalDetail && !isProduction()) {
    body.detail = options.internalDetail;
  }

  return NextResponse.json(body, { status, headers: options?.headers });
}

/** 400 Bad Request */
export function apiBadRequest(message: string, internalDetail?: string) {
  return apiError(message, 400, { internalDetail });
}

/** 401 Unauthorized */
export function apiUnauthorized() {
  return apiError('请先登录', 401);
}

/** 403 Forbidden */
export function apiForbidden() {
  return apiError('没有权限执行此操作', 403);
}

/** 404 Not Found */
export function apiNotFound(message = '资源不存在') {
  return apiError(message, 404);
}

/** 413 Payload Too Large */
export function apiPayloadTooLarge(message = '请求体过大') {
  return apiError(message, 413);
}

/** 429 Too Many Requests */
export function apiRateLimited(headers?: Record<string, string>) {
  return apiError('请求过于频繁，请稍后再试', 429, { headers });
}

/** 500 Internal Server Error */
export function apiInternalError(internalDetail?: string) {
  return apiError('服务器内部错误，请稍后重试', 500, { internalDetail });
}
