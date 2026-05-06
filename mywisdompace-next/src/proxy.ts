import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Supabase Auth Proxy (formerly Middleware)
 *
 * 每个请求都会执行：
 * 1. 读取请求 Cookie 中的 Auth token
 * 2. 验证 JWT 签名，如果已过期则自动刷新
 * 3. 将更新后的 session Cookie 写入响应
 *
 * 这是 Supabase Auth 在 Next.js 中正常工作的前提。
 * 参考: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

/**
 * 匹配所有路由 — Auth token 需要全局刷新
 * 排除静态资源和 API 内部路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路由，排除：
     * - _next/static (静态资源)
     * - _next/image (图片优化)
     * - favicon.ico (站点图标)
     * - sitemap.xml (站点地图)
     * - 其他静态文件 (图片、字体等)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)',
  ],
}
