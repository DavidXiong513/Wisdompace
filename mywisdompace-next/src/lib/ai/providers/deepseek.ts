/**
 * DeepSeek API Provider
 *
 * 支持模型：deepseek-chat, deepseek-coder
 * API 格式：OpenAI Chat Completions 兼容
 */

import type {
  AIProvider,
  AIProviderConfig,
  AICompletionOptions,
  AIResponse,
} from '../types';

export class DeepSeekProvider implements AIProvider {
  readonly name = 'deepseek' as const;

  private apiKey: string;
  private baseURL: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL ?? 'https://api.deepseek.com/v1';
    this.model = config.model ?? 'deepseek-chat';
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
      throw new Error(`DeepSeek API error: ${res.status} — ${error}`);
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
