import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createPollServiceClient } from '@/lib/poll-server';

/**
 * GET /api/poll/history?tool_id=community-aging-poll&session_id=xxx
 * 返回当前身份在该工具下的投票记录，按时间倒序。
 *
 * 身份判定：
 * - 已登录 → 按 user_id 取全部记录（可跨设备回看）
 * - 未登录 → 按 session_id 取本机记录
 *
 * poll_votes 的 RLS 禁止公开读取，因此必须走 service_role。
 */

interface HistoryRow {
  id: string;
  created_at: string;
  readiness_score: number;
  answers: Record<string, string | string[]>;
}

const MAX_ROWS = 20;

async function getOptionalUser(): Promise<{ id: string; email: string | null } | null> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return { id: data.user.id, email: data.user.email ?? null };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, RATE_LIMITS.pollRead);
  if (!rl.success) {
    return NextResponse.json({ error: '请求过于频繁' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const tool_id = searchParams.get('tool_id');
  const session_id = searchParams.get('session_id');

  if (!tool_id) {
    return NextResponse.json({ error: '缺少 tool_id 参数' }, { status: 400 });
  }
  if (!session_id) {
    return NextResponse.json({ data: [], scope: 'anonymous' });
  }

  const supabase = createPollServiceClient();
  if (!supabase) {
    console.error('[poll/history] SUPABASE_SERVICE_ROLE_KEY 未配置');
    return NextResponse.json({ error: '记录服务暂不可用' }, { status: 503 });
  }

  try {
    const user = await getOptionalUser();

    // 登录用户优先按账号查（可跨设备）；查不到再退回 session
    if (user) {
      const { data: byUser, error } = await supabase
        .from('poll_votes')
        .select('id, created_at, readiness_score, answers')
        .eq('tool_id', tool_id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(MAX_ROWS);

      if (!error && byUser && byUser.length > 0) {
        return NextResponse.json({
          data: byUser as HistoryRow[],
          scope: 'account',
          email: user.email,
        });
      }
    }

    const { data: bySession, error: sessionError } = await supabase
      .from('poll_votes')
      .select('id, created_at, readiness_score, answers')
      .eq('tool_id', tool_id)
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS);

    if (sessionError) {
      console.error('[poll/history] query error:', sessionError);
      return NextResponse.json({ error: '查询投票记录失败' }, { status: 500 });
    }

    return NextResponse.json({
      data: (bySession ?? []) as HistoryRow[],
      scope: user ? 'account' : 'anonymous',
      email: user?.email ?? null,
    });
  } catch (err) {
    console.error('[poll/history] unexpected error:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
