/**
 * Kimi (Moonshot) API Provider
 *
 * 支持模型：moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k
 * API 格式：OpenAI Chat Completions 兼容（baseURL 不同）
 */

import type {
  AIProvider,
  AIProviderConfig,
  AICompletionOptions,
  AIResponse,
} from '../types';

export class KimiProvider implements AIProvider {
  readonly name = 'kimi' as const;

  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    // Kimi 官方 API 地址，也支持通过 moonshot.cn 反向代理
    this.baseURL = config.baseURL ?? 'https://api.moonshot.cn/v1';
    this.model = config.model ?? 'moonshot-v1-8k';
  }

  async complete(options: AICompletionOptions): Promise<AIResponse> {
    const body = {
      model: options.model ?? this.model,
      messages: options.messages,
      stream: false,
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
      throw new Error(`Kimi API error: ${res.status} — ${error}`);
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

  stream(options: AICompletionOptions): Response {
    const body = {
      model: options.model ?? this.model,
      messages: options.messages,
      stream: true,
      ...(options.temperature !== undefined && { temperature: options.temperature }),
      ...(options.maxTokens && { max_tokens: options.maxTokens }),
    };

    const apiKey = this.apiKey;
    const baseURL = this.baseURL;

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

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
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
