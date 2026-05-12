import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { logBodyOversized, logDebugBlocked, getClientIp } from '@/lib/security-logger';

/**
 * Proxy (formerly Middleware) — 每个请求都经过此函数
 *
 * Next.js 16 将 middleware.ts 重命名为 proxy.ts，
 * 导出函数名也从 middleware 改为 proxy。
 *
 * 职责：
 * 1. 刷新 Supabase Auth Session Cookie（核心）
 * 2. 保护静态资源和 API 路由
 * 3. 请求体大小预检
 */

// 请求体大小限制（字节）
const MAX_BODY_SIZE: Record<string, number> = {
  '/api/chat': 512 * 1024, // Chat: 500KB（消息历史较长）
  '/api/contact': 64 * 1024, // Contact: 64KB
  '/api/assessments': 256 * 1024, // Assessments: 256KB
  '/api/living-will': 128 * 1024, // Living Will: 128KB
  '/api/conversations': 256 * 1024, // Conversations: 256KB
  '/api/progress': 64 * 1024, // Progress: 64KB
};
const DEFAULT_MAX_BODY = 1024 * 1024; // 默认 1MB

export async function proxy(request: NextRequest) {
  // 1. 请求体大小预检（仅 POST/PATCH/PUT）
  if (['POST', 'PATCH', 'PUT'].includes(request.method)) {
    const contentLength = request.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const limit = MAX_BODY_SIZE[request.nextUrl.pathname] ?? DEFAULT_MAX_BODY;

      if (size > limit) {
        logBodyOversized(request.nextUrl.pathname, getClientIp(request), { size, limit });
        return NextResponse.json({ success: false, error: '请求体过大' }, { status: 413 });
      }
    }
  }

  // 2. 隔离调试端点（生产环境返回 404）
  if (process.env.NODE_ENV === 'production') {
    const path = request.nextUrl.pathname;
    if (path === '/api/test-scoring' || path === '/api/test-supabase') {
      logDebugBlocked(path, getClientIp(request));
      return NextResponse.json({ success: false, error: 'Not Found' }, { status: 404 });
    }
  }

  // 3. Supabase Session 刷新（核心）
  const response = await updateSession(request);

  // 4. 额外安全头（补充 Next.js headers 配置无法覆盖的场景）
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico
     * - public 资源
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
};
