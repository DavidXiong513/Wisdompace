import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/poll/vote-check?session_id=xxx&tool_id=xxx
 * 检查某个 session 是否已投票，如已投票返回之前的数据
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');
  const tool_id = searchParams.get('tool_id');

  if (!session_id || !tool_id) {
    return NextResponse.json({ exists: false, data: null });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from('poll_votes')
    .select('answers, readiness_score')
    .eq('tool_id', tool_id)
    .eq('session_id', session_id)
    .maybeSingle();

  return NextResponse.json({
    exists: !!data,
    data: data ? { answers: data.answers, readiness_score: data.readiness_score } : null,
  });
}
