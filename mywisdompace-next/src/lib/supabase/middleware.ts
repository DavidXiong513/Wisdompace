import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Middleware 辅助函数
 * 刷新 Auth token 并写入请求/响应 Cookie
 * 必须在 middleware.ts 中每个请求都调用
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 1. 设置到请求 Cookie，让后续 Server Component 不会重复刷新
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // 2. 创建新响应并设置 Cookie，让浏览器更新 token
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 关键：调用 getUser() 触发 token 刷新
  // 注意：不能使用 getSession()——它不验证 JWT 签名，可能被伪造
  await supabase.auth.getUser()

  return supabaseResponse
}
