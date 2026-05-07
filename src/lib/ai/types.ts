/**
 * AI Provider 核心类型定义
 *
 * 设计原则：
 * - 所有 Provider 共享同一接口，切换时无需修改调用方
 * - 支持流式（stream）和非流式（non-stream）两种调用方式
 * - 消息格式兼容 OpenAI ChatML
 */

export type AIMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface AIMessage {
  role: AIMessageRole;
  content: string;
  name?: string;       // user/assistant 的可选名称
  toolCallId?: string; // assistant 调用 tool 时的 call id
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>; // JSON Schema
  };
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string; // JSON string
  };
}

export type AIProviderName = 'openai' | 'kimi' | 'deepseek';

export interface AIStreamChunk {
  delta: string;       // 增量文本
  done: boolean;       // 是否结束
  finishReason?: string;
}

export interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;    // 自定义端点（如反向代理）
  model?: string;      // 模型名称
}

export interface AICompletionOptions {
  messages: AIMessage[];
  model?: string;         // 覆盖默认模型
  tools?: AIToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  finishReason: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * AI Provider 接口
 * 所有 Provider 必须实现此接口
 */
export interface AIProvider {
  /** Provider 名称 */
  readonly name: AIProviderName;

  /** 发送消息，返回完整响应（非流式） */
  complete(options: AICompletionOptions): Promise<AIResponse>;

  /** 发送消息，流式返回 Next.js Response（SSE 格式） */
  stream(options: AICompletionOptions): Response;
}
