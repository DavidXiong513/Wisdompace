import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SubmitVoteSchema } from '@/lib/validations/poll';

/**
 * POST /api/poll/vote
 * 提交匿名投票（无需登录，每人一票）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Zod 验证
    const parsed = SubmitVoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数验证失败', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tool_id, session_id, answers, readiness_score } = parsed.data;

    // 使用 service_role 创建客户端（绕过 RLS，用于插入和去重检查）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 检查是否已投过票
    const { data: existing } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('tool_id', tool_id)
      .eq('session_id', session_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: '此 session 已投过票，不可重复投票' }, { status: 409 });
    }

    // 插入投票
    const { error: insertError } = await supabase.from('poll_votes').insert({
      tool_id,
      session_id,
      answers,
      readiness_score,
    });

    if (insertError) {
      console.error('Poll vote insert error:', insertError);
      return NextResponse.json({ error: '投票提交失败，请稍后重试' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Poll vote error:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
