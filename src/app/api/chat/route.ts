/**
 * POST /api/chat — AI 对话接口（SSE 流式）
 *
 * 请求体：
 * {
 *   conversationId?: string;  // 可选，关联的对话 ID
 *   messages: AIMessage[];    // 完整消息历史
 *   provider?: AIProviderName;
 * }
 *
 * 返回：SSE 流，每个消息块格式为 `data: {...}\n\n`
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database';
import { createProvider, getActiveProvider } from '@/lib/ai';
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import type { AIProviderName, AIMessage } from '@/lib/ai/types';

// ===== 安全限制常量 =====
const MAX_MESSAGES = 50; // 消息数组最大长度
const MAX_CONTENT_LENGTH = 8000; // 单条消息内容最大字符数
const MAX_CONCURRENT_SSE = 3; // 单 IP 最大并发 SSE 连接

// SSE 并发连接追踪（内存 Map）
const activeConnections = new Map<string, number>();

// System prompt：让 AI 以"人生整理顾问"角色对话
const SYSTEM_PROMPT: AIMessage = {
  role: 'system',
  content: `你是《一生的整理》网站的 AI 助手。你的角色是一位温暖、有智慧的人生整理顾问。

你的核心能力：
- 帮助用户认识自我（通过测评解读、性格分析）
- 引导用户规划人生（目标设定、价值排序、行动计划）
- 支持用户坦然告别（生前预嘱、关系梳理、遗愿清单）

你的对话风格：
- 温暖共情，不评判
- 提问引导，不直接给答案
- 结合用户已有的测评结果给个性化建议
- 必要时引用《一生的整理》的内容

请用真诚、简洁、有温度的语言与用户交流。`,
};

/** 获取客户端 IP */
function getClientIp(request: NextRequest): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  // 0. 速率限制
  const rlResult = checkRateLimit(request, RATE_LIMITS.chat);
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: '请求过于频繁，请稍后再试' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  // 0.5 并发连接限制
  const clientIp = getClientIp(request);
  const currentConns = activeConnections.get(clientIp) ?? 0;
  if (currentConns >= MAX_CONCURRENT_SSE) {
    return NextResponse.json(
      { success: false, error: '并发连接数过多，请等待当前对话完成' },
      { status: 429 }
    );
  }

  // 1. 验证登录
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

  // 2. 解析请求体
  const body = await request.json().catch(() => ({}));
  const rawMessages: unknown[] = Array.isArray(body.messages) ? body.messages : [];
  const providerName: AIProviderName = body.provider ?? getActiveProvider();
  const conversationId: string | null = body.conversationId ?? null;

  // 2.5 输入安全限制
  if (!rawMessages.length) {
    return NextResponse.json({ error: 'messages is required' }, { status: 400 });
  }

  if (rawMessages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `消息数量超过限制（最多 ${MAX_MESSAGES} 条）` },
      { status: 400 }
    );
  }

  // 过滤并验证消息格式
  const messages: AIMessage[] = rawMessages.filter(
    (m): m is AIMessage =>
      typeof m === 'object' &&
      m !== null &&
      typeof (m as AIMessage).role === 'string' &&
      typeof (m as AIMessage).content === 'string' &&
      (m as AIMessage).content.length <= MAX_CONTENT_LENGTH
  );

  if (!messages.length) {
    return NextResponse.json({ error: '消息格式无效' }, { status: 400 });
  }

  // 3. 获取 Provider 并发起流式请求
  const provider = createProvider(providerName);

  // 如果没有 system 消息，插入默认 system prompt
  const hasSystem = messages.some(m => m.role === 'system');
  const fullMessages: AIMessage[] = hasSystem ? messages : [SYSTEM_PROMPT, ...messages];

  // 4. SSE 流式响应
  const streamResponse = provider.stream({ messages: fullMessages });

  // 注册并发连接
  activeConnections.set(clientIp, currentConns + 1);

  // 5. 流式返回（同时异步保存消息到数据库）
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = streamResponse.body!.getReader();
      let fullContent = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 透传原始流
          controller.enqueue(value);

          // 增量解析 SSE chunks
          const text = new TextDecoder().decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) fullContent += delta;
            } catch {
              /* ignore parse errors */
            }
          }
        }

        // 流结束后，异步保存用户消息和 AI 回复到数据库
        saveMessagesToDB(supabase, user.id, conversationId, fullMessages, fullContent).catch(err =>
          console.error('[chat] Failed to save messages', err)
        );
      } finally {
        // 释放并发连接
        const conns = activeConnections.get(clientIp) ?? 1;
        if (conns <= 1) {
          activeConnections.delete(clientIp);
        } else {
          activeConnections.set(clientIp, conns - 1);
        }
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Provider': providerName,
    },
  });
}

/** 异步保存对话消息到数据库 */
async function saveMessagesToDB(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
  conversationId: string | null,
  messages: AIMessage[],
  lastAssistantContent: string
) {
  if (!conversationId) return;

  // 获取当前对话的 messages，追加新消息
  const { data: conv } = await supabase
    .from('conversations')
    .select('messages')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();

  if (!conv) return;

  const existingMessages = (conv.messages as AIMessage[]) ?? [];
  const userMsg = messages[messages.length - 1]; // 用户最后一条（假设）
  const assistantMsg: AIMessage = { role: 'assistant', content: lastAssistantContent };

  const updatedMessages = [...existingMessages, userMsg, assistantMsg];

  await supabase
    .from('conversations')
    .update({
      messages: updatedMessages,
      title: generateTitle(existingMessages, userMsg.content),
    })
    .eq('id', conversationId)
    .eq('user_id', userId);
}

/** 从第一条用户消息生成对话标题（截取前20字） */
function generateTitle(existing: AIMessage[], userContent: string): string | null {
  if (existing.length === 0 && userContent) {
    return userContent.slice(0, 20).trim() + (userContent.length > 20 ? '…' : '');
  }
  return null; // 不覆盖已有标题
}
