import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { checkRateLimit, RATE_LIMITS, rateLimitHeaders } from '@/lib/rate-limit';
import { logBodyOversized, logDebugBlocked, getClientIp } from '@/lib/security-logger';
import { isProduction } from '@/config/security.config';

/**
 * 根中间件
 *
 * 职责：
 * 1. Supabase Auth session 自动刷新（写入 cookie）
 * 2. 请求体大小预检（防止超大 JSON 拖垮 Serverless）
 * 3. 调试端点在生产环境隔离
 * 4. 登录 / 注册 / 联系表单 / AI 对话等路由速率限制
 * 5. 统一安全响应头（由 next.config.ts 的 headers() 处理，此处不再重复）
 */

const BODY_SIZE_LIMIT = 1024 * 1024; // 1MB

const DEBUG_PATTERNS = [/^\/api\/debug/, /^\/debug/];

function isDebugPath(path: string): boolean {
  return DEBUG_PATTERNS.some(pattern => pattern.test(path));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = getClientIp(request);

  // 1. 生产环境禁止访问调试端点
  if (isProduction() && isDebugPath(path)) {
    logDebugBlocked(path, ip);
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. 请求体大小预检（仅非 GET/HEAD/OPTIONS）
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > BODY_SIZE_LIMIT) {
      logBodyOversized(path, ip, { size: Number(contentLength), limit: BODY_SIZE_LIMIT });
      return new NextResponse(JSON.stringify({ success: false, error: '请求体过大' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 3. Supabase session 刷新（必须在速率限制之后，确保正常请求都能刷新 token）
  const response = await updateSession(request);

  // 4. 路由级速率限制
  let rateLimitResult = null;

  if (path === '/login' && request.method === 'POST') {
    rateLimitResult = checkRateLimit(request, RATE_LIMITS.login);
  } else if (path === '/register' && request.method === 'POST') {
    rateLimitResult = checkRateLimit(request, RATE_LIMITS.register);
  } else if (path === '/api/contact' && request.method === 'POST') {
    rateLimitResult = checkRateLimit(request, RATE_LIMITS.contact);
  } else if (path === '/api/chat' && request.method === 'POST') {
    rateLimitResult = checkRateLimit(request, RATE_LIMITS.chat);
  } else if (path === '/api/search' && request.method === 'GET') {
    rateLimitResult = checkRateLimit(request, RATE_LIMITS.search);
  }

  if (rateLimitResult && !rateLimitResult.success) {
    const headers = rateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      { success: false, error: '请求过于频繁，请稍后再试' },
      { status: 429, headers }
    );
  }

  if (rateLimitResult) {
    const headers = rateLimitHeaders(rateLimitResult);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，但排除：
     * - _next/static（静态资源）
     * - _next/image（图片优化）
     * - favicon.ico
     * - 所有静态文件
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|otf)).*)',
  ],
};
