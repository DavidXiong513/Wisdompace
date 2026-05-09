'use no memo';

/**
 * 安全事件日志系统
 *
 * 记录关键安全事件，便于事后审计和攻击溯源。
 * 所有日志输出到 console（Vercel 会自动采集到 Log Drains）。
 * 生产环境不输出敏感信息（IP 部分脱敏）。
 *
 * 事件类型：
 * - rate_limited: 速率限制触发
 * - honeypot_hit: 蜜罐字段被填充（机器人特征）
 * - auth_failure: 认证失败
 * - suspicious_input: 可疑输入（XSS/注入尝试）
 * - body_oversized: 请求体超过预检限制
 * - debug_endpoint_blocked: 调试端点在生产环境被拦截
 */

// ==================== 类型定义 ====================

export type SecurityEventType =
  | 'rate_limited'
  | 'honeypot_hit'
  | 'auth_failure'
  | 'suspicious_input'
  | 'body_oversized'
  | 'debug_endpoint_blocked';

export interface SecurityEvent {
  type: SecurityEventType;
  /** 事件发生的时间戳 */
  timestamp: string;
  /** 请求路径 */
  path: string;
  /** 客户端 IP（生产环境脱敏） */
  ip: string;
  /** 额外上下文 */
  detail?: Record<string, string | number | boolean>;
}

// ==================== IP 获取与脱敏 ====================

/**
 * 获取客户端 IP
 * Vercel 自动设置 x-forwarded-for / x-real-ip
 */
export function getClientIp(request: {
  headers: { get: (name: string) => string | null };
}): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) {
    return xff.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * 生产环境对 IP 做脱敏处理
 * 例: 192.168.1.123 → 192.168.*.*
 * 例: 2001:db8::1 → 2001:db8::*:*
 */
function maskIp(ip: string): string {
  if (process.env.NODE_ENV !== 'production') {
    return ip; // 开发环境完整显示
  }

  // IPv4
  const ipv4Parts = ip.split('.');
  if (ipv4Parts.length === 4) {
    return `${ipv4Parts[0]}.${ipv4Parts[1]}.*.*`;
  }

  // IPv6 — 简化处理，只保留前两段
  const ipv6Parts = ip.split(':');
  if (ipv6Parts.length >= 2) {
    return `${ipv6Parts[0]}:${ipv6Parts[1]}::*`;
  }

  return '***'; // 无法识别的格式
}

// ==================== 核心日志函数 ====================

/**
 * 记录安全事件
 *
 * 使用 console.warn 而非 console.log，确保：
 * 1. Vercel Log Drains 会优先采集 warn 级别
 * 2. 在日志聚合工具中更容易筛选
 * 3. 与业务日志区分开
 */
export function logSecurityEvent(
  type: SecurityEventType,
  options: {
    path: string;
    ip: string;
    detail?: Record<string, string | number | boolean>;
  }
): void {
  const event: SecurityEvent = {
    type,
    timestamp: new Date().toISOString(),
    path: options.path,
    ip: maskIp(options.ip),
    detail: options.detail,
  };

  // 结构化输出，便于日志分析工具解析
  console.warn(
    JSON.stringify({
      level: 'SECURITY',
      ...event,
    })
  );
}

// ==================== 便捷函数 ====================

/** 速率限制触发 */
export function logRateLimited(
  path: string,
  ip: string,
  detail?: { limit: number; windowMs: number }
) {
  logSecurityEvent('rate_limited', { path, ip, detail });
}

/** 蜜罐字段被填充 */
export function logHoneypotHit(path: string, ip: string) {
  logSecurityEvent('honeypot_hit', { path, ip });
}

/** 认证失败 */
export function logAuthFailure(path: string, ip: string, detail?: { reason: string }) {
  logSecurityEvent('auth_failure', { path, ip, detail });
}

/** 可疑输入检测 */
export function logSuspiciousInput(path: string, ip: string, detail?: { pattern: string }) {
  logSecurityEvent('suspicious_input', { path, ip, detail });
}

/** 请求体超过预检限制 */
export function logBodyOversized(
  path: string,
  ip: string,
  detail?: { size: number; limit: number }
) {
  logSecurityEvent('body_oversized', { path, ip, detail });
}

/** 调试端点在生产环境被拦截 */
export function logDebugBlocked(path: string, ip: string) {
  logSecurityEvent('debug_endpoint_blocked', { path, ip });
}
