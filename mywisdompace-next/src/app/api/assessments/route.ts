import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { SaveAssessmentSchema } from '@/lib/validations/assessment';

/** GET /api/assessments — 获取当前用户所有测评结果 */
export async function GET(_request: NextRequest) {
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
    .eq('is_latest', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[GET /api/assessments]', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/** POST /api/assessments — 保存新的测评结果 */
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
  const parsed = SaveAssessmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, result } = parsed.data;
  const { data, error } = await supabase
    .from('assessments')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ user_id: user.id, type, result } as any)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/assessments]', error);
    return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
