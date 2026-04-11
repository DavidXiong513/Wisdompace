/**
 * AI Provider 工厂
 *
 * 使用方式：
 * ```ts
 * import { createProvider } from '@/lib/ai';
 *
 * const provider = createProvider('kimi');
 * const response = await provider.complete({ messages: [...] });
 * ```
 *
 * 环境变量：
 * - OPENAI_API_KEY, OPENAI_MODEL
 * - KIMI_API_KEY, KIMI_MODEL
 * - DEEPSEEK_API_KEY, DEEPSEEK_MODEL
 * - AI_BASE_URL（可选，统一反向代理地址）
 */

import type { AIProvider, AIProviderName, AIProviderConfig } from './types';
import { OpenAIProvider } from './providers/openai';
import { KimiProvider } from './providers/kimi';
import { DeepSeekProvider } from './providers/deepseek';

/** 创建 Provider 实例 */
export function createProvider(name: AIProviderName, overrides?: Partial<AIProviderConfig>): AIProvider {
  const config: AIProviderConfig = {
    apiKey: getApiKey(name),
    baseURL: process.env.AI_BASE_URL,
    model: getModel(name),
    ...overrides,
  };

  switch (name) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'kimi':
      return new KimiProvider(config);
    case 'deepseek':
      return new DeepSeekProvider(config);
    default:
      throw new Error(`Unknown AI provider: ${name satisfies never}`);
  }
}

/** 获取当前激活的 Provider 名称（可扩展为用户配置） */
export function getActiveProvider(): AIProviderName {
  // TODO: 从用户配置/环境变量读取
  // 暂时默认用 Kimi（国产模型，免费额度高）
  return (process.env.AI_DEFAULT_PROVIDER as AIProviderName) ?? 'kimi';
}

/** 获取 API Key */
function getApiKey(name: AIProviderName): string {
  const keys: Record<AIProviderName, string | undefined> = {
    openai:   process.env.OPENAI_API_KEY,
    kimi:     process.env.KIMI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  };
  return keys[name] ?? '';
}

/** 获取默认模型 */
function getModel(name: AIProviderName): string | undefined {
  const models: Record<AIProviderName, string | undefined> = {
    openai:   process.env.OPENAI_MODEL,
    kimi:     process.env.KIMI_MODEL,
    deepseek: process.env.DEEPSEEK_MODEL,
  };
  return models[name];
}

export type { AIProvider, AIProviderName, AIMessage, AICompletionOptions, AIResponse } from './types';
