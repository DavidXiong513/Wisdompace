/**
 * GET /auth/callback — Supabase Auth 邮箱验证回调
 *
 * 当用户点击邮箱验证链接后，Supabase 会重定向到此路由。
 * 此路由交换 code 获取 session，然后重定向用户到首页。
 *
 * 必须放在 app/auth/callback 而非 app/(auth)/callback 下，
 * 因为 Supabase 重定向的 URL 不带括号分组前缀。
 */

import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // 如果有 next 参数，验证后重定向到该页面（防止 open redirect）
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 验证成功，重定向到 next（仅允许相对路径）或首页
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
      return NextResponse.redirect(`${origin}${safeNext}`);
    }

    // 交换 code 失败，记录错误但仍然重定向（前端会处理未验证状态）
    console.error('[auth/callback] exchangeCodeForSession failed:', error.message);
  }

  // 没有 code 或交换失败，重定向到首页
  return NextResponse.redirect(`${origin}/`);
}
