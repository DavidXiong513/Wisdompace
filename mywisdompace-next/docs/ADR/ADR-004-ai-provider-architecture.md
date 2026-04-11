# ADR-004: AI Provider 多模型架构

## 状态
已采纳

## 日期
2026-04-11

## 上下文
MyWisdompace 需要 AI 助手能力来支持用户进行人生整理相关的对话。当前已完成：
- conversations 表（对话历史持久化）
- Supabase Auth（用户认证）

需要选择一个 AI Provider 架构，满足以下需求：
1. 支持多个 AI 模型（OpenAI / Kimi / DeepSeek）
2. 支持 SSE 流式输出（打字机效果）
3. 对话历史持久化到 Supabase
4. 未来可扩展 Tool Calling（RAG/搜索）
5. 降低单一 provider 依赖风险

## 决策
采用 **OpenAI-Compatible API Provider 抽象层**架构：

### 核心设计

**统一接口**（`lib/ai/types.ts`）：
```typescript
interface AIProvider {
  readonly name: AIProviderName;
  complete(options: AICompletionOptions): Promise<AIResponse>;
  stream(options: AICompletionOptions): Response; // Next.js Response (SSE)
}
```

**Provider 实现**（均遵循 OpenAI Chat Completions 格式）：
- `OpenAIProvider` — `api.openai.com/v1`（GPT-4o / GPT-4o-mini）
- `KimiProvider` — `api.moonshot.cn/v1`（Moonshot V1 系列）
- `DeepSeekProvider` — `api.deepseek.com/v1`（DeepSeek Chat/Coder）

**工厂函数**（`lib/ai/index.ts`）：
```typescript
const provider = createProvider('kimi');
```

**流式 API 路由**（`/api/chat/route.ts`）：
- 接收消息历史 + provider 名称
- 调用 provider.stream() 返回 Next.js Response（SSE）
- 流结束后异步保存到 Supabase conversations 表

### 对话管理
- conversations 表存储对话历史（messages: JSONB）
- 支持多会话（每次新对话创建一条记录）
- 对话标题自动从第一条用户消息截取前20字

### System Prompt
```
你是《一生的整理》网站的 AI 助手，角色为温暖、有智慧的人生整理顾问。
- 帮助用户认识自我（测评解读）
- 引导用户规划人生（目标/价值/行动）
- 支持用户坦然告别（生前预嘱/遗愿清单）
```

## 理由

### 为什么选 OpenAI-Compatible 架构
1. **三大国产模型均兼容**：Kimi、DeepSeek 都提供 OpenAI 兼容端点，切换成本极低
2. **统一 SDK**：无需每个 provider 单独集成，一个接口覆盖全部
3. **流式输出简单**：Next.js Response 直接返回 ReadableStream，天然 SSE 支持
4. **环境变量隔离**：API Key 和模型名称通过 env vars 配置，不硬编码

### 为什么选 Kimi 作为默认
- 国产模型，免费额度高（暂定）
- 支持 128k 上下文，适合长对话
- 未来可扩展为付费版本

### 为什么不选 RAG（当前阶段）
- RAG 需要额外基础设施（向量数据库、Embedding 服务）
- 当前对话以开放式对话为主，内容引用非核心需求
- 预留 `tools` 接口，未来按需集成

## 后果

### 正面
- 零成本切换 AI 模型
- 流式输出体验好（打字机效果）
- 对话历史完整保存
- 架构清晰，易于测试和维护

### 负面
- 依赖第三方 API，可用性受制于 provider
- 各 provider 的 token 计费方式不同，需监控成本
- 中国大陆访问 OpenAI 官方 API 需要代理

### 缓解措施
- 环境变量统一配置，支持反向代理（AI_BASE_URL）
- 未来考虑接入多个 provider 做 failover
- 限制单次对话 token 上限（maxTokens）
