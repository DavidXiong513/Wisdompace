import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { LivingWillData, validateLivingWill } from '@/types/living-will';

/** GET /api/living-will — 获取当前用户最新的生前预嘱 */
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 中 set cookie 时忽略错误
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'living-will')
    .eq('is_latest', true)
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) {
    console.error('[GET /api/living-will]', error);
    return NextResponse.json({ error: 'Failed to fetch living will' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/** POST /api/living-will — 保存生前预嘱 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const result = body.result as LivingWillData;

  if (!result) {
    return NextResponse.json({ error: 'Missing result field' }, { status: 400 });
  }

  const validation = validateLivingWill(result);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Validation failed', missing: validation.missing },
      { status: 400 }
    );
  }

  // 确保 completedAt 被设置
  const finalResult: LivingWillData = {
    ...result,
    completedAt: result.completedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('assessments')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ user_id: user.id, type: 'living-will', result: finalResult } as any)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/living-will]', error);
    return NextResponse.json({ error: 'Failed to save living will' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
