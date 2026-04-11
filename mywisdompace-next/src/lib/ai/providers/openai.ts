/**
 * OpenAI API Provider
 *
 * 支持模型：gpt-4o, gpt-4o-mini, gpt-4-turbo 等
 * 流式端点：/v1/chat/completions（stream: true）
 */

import type {
  AIProvider,
  AIProviderConfig,
  AICompletionOptions,
  AIResponse,
} from '../types';

export class OpenAIProvider implements AIProvider {
  readonly name = 'openai' as const;

  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL ?? 'https://api.openai.com/v1';
    this.model = config.model ?? 'gpt-4o-mini';
  }

  async complete(options: AICompletionOptions): Promise<AIResponse> {
    const body = {
      model: options.model ?? this.model,
      messages: options.messages,
      ...(options.tools ? { tools: options.tools } : {}),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.maxTokens && { max_tokens: options.maxTokens }),
    };

    const res = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`OpenAI API error: ${res.status} — ${error}`);
    }

    const json = await res.json() as {
      choices: Array<{ message: { content: string }; finish_reason: string }>;
      usage?: { prompt_tokens: number; completion_tokens: number };
    };

    const choice = json.choices[0];
    return {
      content: choice?.message?.content ?? '',
      finishReason: choice?.finish_reason ?? 'stop',
      usage: json.usage
        ? { inputTokens: json.usage.prompt_tokens, outputTokens: json.usage.completion_tokens }
        : undefined,
    };
  }

  /**
   * 流式返回 Next.js Response
   * 路由中调用方式：
   * ```ts
   * return provider.stream(options) as Response;
   * ```
   * Next.js 会自动处理 ReadableStream → SSE 转换
   */
  stream(options: AICompletionOptions): Response {
    const body = {
      model: options.model ?? this.model,
      messages: options.messages,
      stream: true,
      ...(options.tools ? { tools: options.tools } : {}),
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.maxTokens && { max_tokens: options.maxTokens }),
    };

    const baseURL = this.baseURL;
    const apiKey = this.apiKey;

    return new Response(
      new ReadableStream({
        async start(controller) {
          const res = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify(body),
          });

          if (!res.body) { controller.close(); return; }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              const text = decoder.decode(value, { stream: true });
              // SSE 格式：data: {...}\n\n
              controller.enqueue(new TextEncoder().encode(text));
            }
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      }
    );
  }
}
