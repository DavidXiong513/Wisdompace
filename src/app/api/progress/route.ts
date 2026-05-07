import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { UpsertProgressSchema } from '@/lib/validations/progress';

/** GET /api/progress — 获取当前用户所有进度 */
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

  // 支持按 category 过滤：?category=chapter-read
  const { searchParams } = new URL(_request.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('progress')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[GET /api/progress]', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/** POST /api/progress — 创建或更新进度（upsert） */
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
  const parsed = UpsertProgressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { category, key, value } = parsed.data;
  const progressPayload: Database['public']['Tables']['progress']['Insert'] = {
    user_id: user.id,
    category,
    key,
    value,
  };

  const { data, error } = await supabase
    .from('progress')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(progressPayload as any, { onConflict: 'user_id,category,key' })
    .select()
    .single();

  if (error) {
    console.error('[POST /api/progress]', error);
    return NextResponse.json({ error: 'Failed to upsert progress' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
