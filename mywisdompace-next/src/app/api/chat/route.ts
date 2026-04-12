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
import type { AIProviderName, AIMessage } from '@/lib/ai/types';

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

export async function POST(request: NextRequest) {
  // 1. 验证登录
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* ignore */ }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. 解析请求体
  const body = await request.json().catch(() => ({}));
  const messages: AIMessage[] = Array.isArray(body.messages) ? body.messages : [];
  const providerName: AIProviderName = body.provider ?? getActiveProvider();
  const conversationId: string | null = body.conversationId ?? null;

  if (!messages.length) {
    return NextResponse.json({ error: 'messages is required' }, { status: 400 });
  }

  // 3. 获取 Provider 并发起流式请求
  const provider = createProvider(providerName);

  // 如果没有 system 消息，插入默认 system prompt
  const hasSystem = messages.some((m) => m.role === 'system');
  const fullMessages: AIMessage[] = hasSystem ? messages : [SYSTEM_PROMPT, ...messages];

  // 4. SSE 流式响应
  const streamResponse = provider.stream({ messages: fullMessages });

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
            } catch { /* ignore parse errors */ }
          }
        }

        // 流结束后，异步保存用户消息和 AI 回复到数据库
        saveMessagesToDB(supabase, user.id, conversationId, fullMessages, fullContent).catch(
          (err) => console.error('[chat] Failed to save messages', err)
        );
      } finally {
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
