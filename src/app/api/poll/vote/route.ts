import { NextRequest, NextResponse } from 'next/server';
import { SubmitVoteSchema } from '@/lib/validations/poll';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import {
  createPollServiceClient,
  hashRequestOrigin,
  isMissingColumnError,
} from '@/lib/poll-server';

/**
 * POST /api/poll/vote
 * 提交投票（匿名或登录用户均可，一人一票）
 *
 * 落库字段：tool_id / session_id / answers / readiness_score
 * 迁移 005 后追加：user_id（登录用户归属）/ ip_hash / user_agent_hash（防刷审计）
 */

/** 读取当前登录用户（未登录或未配置 Supabase 时返回 null，不阻断匿名投票） */
async function getOptionalUserId(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  // 限流：防脚本刷票
  const rl = checkRateLimit(request, RATE_LIMITS.poll);
  if (!rl.success) {
    return NextResponse.json(
      { error: '提交过于频繁，请稍后再试' },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const supabase = createPollServiceClient();
  if (!supabase) {
    console.error(
      '[poll/vote] SUPABASE_SERVICE_ROLE_KEY 未配置，投票无法写入数据库'
    );
    return NextResponse.json({ error: '投票服务暂不可用' }, { status: 503 });
  }

  try {
    const body = await request.json();

    const parsed = SubmitVoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '参数验证失败', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tool_id, session_id, answers, readiness_score } = parsed.data;
    const { ipHash, uaHash } = hashRequestOrigin(request);
    const userId = await getOptionalUserId();

    // 1) 同一 session 只能投一次
    const { data: bySession } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('tool_id', tool_id)
      .eq('session_id', session_id)
      .maybeSingle();

    if (bySession) {
      return NextResponse.json(
        { error: '该设备已投过票，不可重复投票', code: 'ALREADY_VOTED' },
        { status: 409 }
      );
    }

    // 2) 登录用户换设备也只能投一次（缺 user_id 列时该查询报错，忽略即可）
    if (userId) {
      const { data: byUser } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('tool_id', tool_id)
        .eq('user_id', userId)
        .limit(1);

      if (byUser && byUser.length > 0) {
        return NextResponse.json(
          { error: '该账号已投过票，不可重复投票', code: 'ALREADY_VOTED' },
          { status: 409 }
        );
      }
    }

    const baseRow = {
      tool_id,
      session_id,
      answers,
      readiness_score,
    };

    const fullRow = {
      ...baseRow,
      user_id: userId,
      ip_hash: ipHash,
      user_agent_hash: uaHash,
    };

    let { error: insertError } = await supabase
      .from('poll_votes')
      .insert(fullRow);

    // 迁移 005 未执行时降级：先让基础数据进库，不因为新字段缺失而丢票
    if (isMissingColumnError(insertError)) {
      console.warn('[poll/vote] poll_votes 缺少 005 迁移字段，降级写入基础字段');
      ({ error: insertError } = await supabase
        .from('poll_votes')
        .insert(baseRow));
    }

    if (insertError) {
      // 唯一约束冲突 = 并发重复提交
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: '已投过票，不可重复投票', code: 'ALREADY_VOTED' },
          { status: 409 }
        );
      }
      console.error('[poll/vote] insert error:', insertError);
      return NextResponse.json(
        { error: '投票提交失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[poll/vote] unexpected error:', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
