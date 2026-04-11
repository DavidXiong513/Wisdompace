/**
 * POST /api/auth/register — 用户注册
 * 底层由 Supabase Auth 处理，成功后自动写入 session cookie
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: '请填写完整信息' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: '密码长度至少 6 位' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      const status = error.message.includes('already registered') ? 409 : 400;
      return NextResponse.json({ message: mapError(error.message) }, { status });
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name,
      },
      // Supabase 免费版默认不要求邮箱验证，
      // 如果开启了 Email Confirmation，这里需要提示用户去邮箱确认
      needsConfirmation: !data.session,
    });
  } catch {
    return NextResponse.json({ message: '服务器内部错误' }, { status: 500 });
  }
}

function mapError(msg: string): string {
  if (msg.includes('already registered') || msg.includes('user_already_exists')) {
    return '该邮箱已被注册，请直接登录';
  }
  if (msg.includes('invalid_email')) return '邮箱格式不正确';
  if (msg.includes('Password should be at least 6 characters')) return '密码长度至少 6 位';
  if (msg.includes('rate limit')) return '操作过于频繁，请稍后再试';
  return msg || '注册失败，请稍后再试';
}
