/**
 * POST /api/auth/logout — 用户登出
 * 清除 Supabase session cookie
 */

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: '登出失败' }, { status: 500 });
  }
}
