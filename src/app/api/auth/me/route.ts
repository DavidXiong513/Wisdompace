/**
 * GET /api/auth/me — 获取当前登录用户信息
 * 由 middleware 刷新 token 后，客户端调用此接口同步用户数据
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const name = user.user_metadata?.name
    ?? (user.email ? user.email.split('@')[0] : '用户');

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name,
    },
  });
}
