# ADR-003: 认证方案选型 — Supabase Auth

## 状态
已采纳

## 日期
2026-04-11

## 上下文
MyWisdompace 需要用户认证系统来支持数据持久化。当前使用 `auth-placeholder.ts` 内存模拟方案，仅用于开发占位。

需要选择一个认证方案，满足以下需求：
1. Email/Password 注册登录
2. Session 管理（Cookie-based，支持 SSR）
3. 行级数据安全（RLS）
4. 与 PostgreSQL 数据库紧密集成
5. 开发维护成本低

## 决策
采用 **Supabase Auth** 作为认证方案。

### 技术细节
- 使用 `@supabase/ssr` 包处理 SSR 场景的 Cookie 管理
- 三个客户端入口：
  - `lib/supabase/client.ts` — Browser 端（`createBrowserClient`）
  - `lib/supabase/server.ts` — Server Component / Route Handler（`createServerClient` + `cookies()`）
  - `lib/supabase/middleware.ts` — Next.js Middleware（`createServerClient` + `request.cookies`）
- 使用 `getUser()` 而非 `getSession()` 验证会话（后者不验证 JWT 签名）
- 通过 Next.js middleware 在每个请求中自动刷新 token

### 数据库 Schema
4张表，全部启用 RLS：
- `users` — 用户基本信息，通过 trigger 从 `auth.users` 自动同步
- `assessments` — 测评结果（type + JSONB，单表多类型扩展）
- `progress` — 一生整理进度（category + key + JSONB）
- `conversations` — AI对话历史（预留给里程碑4）

## 理由

### 为什么选 Supabase Auth
1. **与已选数据库一体**：项目已选定 Supabase PostgreSQL 作为数据库，Auth 是内置功能，无需额外服务
2. **RLS 原生支持**：Supabase Auth 与 RLS 深度集成，`auth.uid()` 直接在 SQL 中可用
3. **Cookie-based Session**：官方提供 `@supabase/ssr` 处理 SSR 场景，无需自己管理 JWT
4. **自动用户同步**：通过 PostgreSQL trigger 从 `auth.users` 自动创建 `public.users` 记录
5. **零额外成本**：Supabase 免费层包含 50,000 MAU

### 为什么不用其他方案
- **NextAuth.js / Auth.js**：需要自建数据库表、自管 JWT，与 Supabase 数据库的 RLS 集成更复杂
- **Clerk**：SaaS 定价模式，且与 Supabase RLS 集成需要额外 webhook
- **Firebase Auth**：与 Supabase PostgreSQL 跨平台，数据同步复杂
- **自建认证**：安全风险高，维护成本大，小团队不划算

## 后果

### 正面
- 认证+数据库一体化，开发和维护成本低
- RLS 天然保护数据安全
- SSR Cookie 管理有官方方案
- 未来可扩展 OAuth 登录（微信、Google 等）

### 负面
- 对 Supabase 平台依赖加深
- `@supabase/ssr` API 仍在迭代（v0.x），可能需要跟进更新
- Refresh token 单次使用，并发请求可能出现短暂 session 为 null 的情况

### 缓解措施
- 数据库 Schema 使用标准 PostgreSQL DDL，可迁移到其他平台
- 监控 `@supabase/ssr` 版本更新，及时跟进 API 变更
- 前端实现错误重试机制应对并发 refresh 问题
