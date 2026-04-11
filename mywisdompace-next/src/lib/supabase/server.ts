import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 创建服务端 Supabase 客户端
 * 用于 Server Component / Route Handler / Server Action
 * 通过 next/headers 的 cookieStore 管理认证 Cookie
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component 中调用 setAll 会失败（只读），
            // 这是预期行为——由 middleware 统一处理 session 刷新
          }
        },
      },
    }
  )
}
