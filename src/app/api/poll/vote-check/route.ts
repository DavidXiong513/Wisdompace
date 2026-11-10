import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { createPollServiceClient } from '@/lib/poll-server';

/**
 * GET /api/poll/vote-check?session_id=xxx&tool_id=xxx
 * 回查该身份是否已投票；已投票则返回此前的答案，用于直接进入报告页。
 *
 * 注意：poll_votes 的 RLS 禁止公开读取，anon key 查不到任何行，
 * 因此这里必须使用 service_role 客户端。
 */

interface VoteRecord {
  answers: Record<string, string | string[]>;
  readiness_score: number;
  created_at: string;
}

/** 读取当前登录用户（未登录返回 null） */
async function getOptionalUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const rl = checkRateLimit(request, RATE_LIMITS.pollRead);
  if (!rl.success) {
    return NextResponse.json(
      { exists: false, data: null, error: '请求过于频繁' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');
  const tool_id = searchParams.get('tool_id');

  if (!session_id || !tool_id) {
    return NextResponse.json({ exists: false, data: null });
  }

  const supabase = createPollServiceClient();
  if (!supabase) {
    // 不阻断页面：当作「未投票」处理，用户仍可正常作答
    console.error(
      '[poll/vote-check] SUPABASE_SERVICE_ROLE_KEY 未配置，无法回查投票记录'
    );
    return NextResponse.json({ exists: false, data: null });
  }

  try {
    // 1) 先按匿名 session 查
    const { data: bySession } = await supabase
      .from('poll_votes')
      .select('answers, readiness_score, created_at')
      .eq('tool_id', tool_id)
      .eq('session_id', session_id)
      .maybeSingle();

    let record = bySession as VoteRecord | null;

    // 2) 登录用户换设备的情况：按 user_id 再查一次（缺列时忽略报错）
    if (!record) {
      const userId = await getOptionalUserId();
      if (userId) {
        const { data: byUser, error: userError } = await supabase
          .from('poll_votes')
          .select('answers, readiness_score, created_at')
          .eq('tool_id', tool_id)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!userError && byUser && byUser.length > 0) {
          record = byUser[0] as VoteRecord;
        }
      }
    }

    return NextResponse.json({
      exists: !!record,
      data: record
        ? {
            answers: record.answers,
            readiness_score: record.readiness_score,
            created_at: record.created_at,
          }
        : null,
    });
  } catch (err) {
    console.error('[poll/vote-check] query error:', err);
    return NextResponse.json({ exists: false, data: null });
  }
}
