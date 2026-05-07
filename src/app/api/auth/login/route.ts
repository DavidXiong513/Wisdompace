/**
 * POST /api/auth/login — 邮箱密码登录
 * 底层由 Supabase Auth 处理，返回 session cookie
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: '请输入邮箱和密码' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const status = error.message.includes('Invalid login credentials') ? 401 : 400;
      return NextResponse.json({ message: mapError(error.message) }, { status });
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name ?? data.user.email?.split('@')[0],
      },
    });
  } catch {
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}

function mapError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return '邮箱或密码错误';
  if (msg.includes('Email not confirmed')) return '请先验证邮箱';
  if (msg.includes('rate limit')) return '操作过于频繁，请稍后再试';
  if (msg.includes('fetch failed') || msg.includes('NetworkError')) return '网络连接异常，请检查网络后重试';
  return msg || '登录失败，请稍后再试';
}
