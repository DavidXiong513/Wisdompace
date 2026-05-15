import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PollAggregatesQuerySchema } from '@/lib/validations/poll';

/**
 * GET /api/poll/aggregates?tool_id=community-aging-poll
 * 获取投票聚合数据（公开可读，无需登录）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tool_id = searchParams.get('tool_id');

    const parsed = PollAggregatesQuerySchema.safeParse({ tool_id });
    if (!parsed.success) {
      return NextResponse.json({ error: '缺少 tool_id 参数' }, { status: 400 });
    }

    // 使用 anon key 客户端（依赖 RLS 允许公开读取）
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 查询聚合数据
    const { data: aggregates, error: aggError } = await supabase
      .from('poll_aggregates')
      .select('question_index, option_label, count')
      .eq('tool_id', tool_id)
      .order('question_index', { ascending: true });

    if (aggError) {
      console.error('Poll aggregates query error:', aggError);
      return NextResponse.json({ error: '查询聚合数据失败' }, { status: 500 });
    }

    // 查询总参与人数
    const { count: totalVotes, error: countError } = await supabase
      .from('poll_votes')
      .select('id', { count: 'exact', head: true })
      .eq('tool_id', tool_id);

    if (countError) {
      console.error('Poll votes count error:', countError);
    }

    return NextResponse.json({
      data: {
        aggregates: aggregates || [],
        total_votes: totalVotes ?? 0,
      },
    });
  } catch (err) {
    console.error('Poll aggregates error:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
