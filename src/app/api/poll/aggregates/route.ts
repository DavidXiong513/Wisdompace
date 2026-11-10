import { NextRequest, NextResponse } from 'next/server';
import { PollAggregatesQuerySchema } from '@/lib/validations/poll';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createPollServiceClient } from '@/lib/poll-server';

/**
 * GET /api/poll/aggregates?tool_id=community-aging-poll
 * 返回各题各选项的累计票数 + 总参与人数（公开接口，无需登录）
 *
 * 为什么用 service_role：
 * - poll_aggregates 允许公开读，但 poll_votes 的 RLS 是「禁止公开读取」，
 *   anon key 统计总票数永远得到 0。两条查询统一走 service_role 才能对齐。
 */

interface AggregateRow {
  question_index: number;
  option_label: string;
  count: number;
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, RATE_LIMITS.pollRead);
  if (!rl.success) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const tool_id = searchParams.get('tool_id');

  const parsed = PollAggregatesQuerySchema.safeParse({ tool_id });
  if (!parsed.success) {
    return NextResponse.json({ error: '缺少 tool_id 参数' }, { status: 400 });
  }

  const supabase = createPollServiceClient();
  if (!supabase) {
    console.error(
      '[poll/aggregates] SUPABASE_SERVICE_ROLE_KEY 未配置，无法读取统计'
    );
    return NextResponse.json({ error: '统计服务暂不可用' }, { status: 503 });
  }

  try {
    const { data: aggregates, error: aggError } = await supabase
      .from('poll_aggregates')
      .select('question_index, option_label, count')
      .eq('tool_id', tool_id)
      .order('question_index', { ascending: true });

    if (aggError) {
      console.error('[poll/aggregates] aggregates query error:', aggError);
      return NextResponse.json(
        { error: '查询聚合数据失败', details: aggError.message },
        { status: 500 }
      );
    }

    // 总参与人数（一人一票，poll_votes 行数即人数）
    const { count: totalVotes, error: countError } = await supabase
      .from('poll_votes')
      .select('id', { count: 'exact', head: true })
      .eq('tool_id', tool_id);

    if (countError) {
      console.error('[poll/aggregates] count error:', countError);
    }

    return NextResponse.json({
      data: {
        aggregates: (aggregates ?? []) as AggregateRow[],
        total_votes: totalVotes ?? 0,
      },
    });
  } catch (err) {
    console.error('[poll/aggregates] unexpected error:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
