import { NextResponse } from 'next/server';
import { z } from 'zod';
import { searchAll } from '@/lib/search-index';
import { validateSearchQuery } from '@/lib/security';

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100).trim(),
  limit: z.coerce.number().int().min(1).max(20).default(12),
});

/**
 * GET /api/search
 *
 * Server-side search endpoint wrapping the existing search-index.
 * Accepts query params: q (required), limit (optional, default 12).
 * Returns JSON array of SearchHit.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = {
      q: searchParams.get('q') ?? '',
      limit: searchParams.get('limit') ?? '12',
    };

    const parsed = SearchQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: '无效的搜索参数',
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { q, limit } = parsed.data;

    // 二次安全清洗（复用现有安全模块）
    const validation = validateSearchQuery(q);
    if (!validation.valid) {
      return NextResponse.json({ error: '搜索内容包含非法字符' }, { status: 400 });
    }

    const hits = searchAll(validation.sanitized, limit);

    return NextResponse.json({ hits, query: q, total: hits.length });
  } catch (err) {
    console.error('[GET /api/search]', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
