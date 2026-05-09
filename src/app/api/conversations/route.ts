import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { CreateConversationSchema } from '@/lib/validations/conversation';

/** GET /api/conversations — 获取当前用户所有对话 */
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
            /* ignore */
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
    .from('conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[GET /api/conversations]', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

/** POST /api/conversations — 创建新对话 */
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
            /* ignore */
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

  const raw = await request.json().catch(() => ({}));
  const parsed = CreateConversationSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: '输入内容格式有误' }, { status: 400 });
  }

  const title = parsed.data.title?.trim() || null;

  const { data, error } = await supabase
    .from('conversations')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ user_id: user.id, title, messages: [] } as any)
    .select()
    .single();

  if (error) {
    console.error('[POST /api/conversations]', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
