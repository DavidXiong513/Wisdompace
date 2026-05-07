'use server';

/**
 * Supabase Session 更新工具函数（服务端专用）
 *
 * 在 Route Handler / Server Component / Server Action 中使用，
 * 用于在操作后同步刷新客户端 Cookie，保持 Session 状态一致。
 *
 * ⚠️ 不要在前端代码中直接调用此函数！
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function updateSession() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );

  // This will refresh the session if expired - required for Server Components
  await supabase.auth.getUser();

  return supabase;
}
