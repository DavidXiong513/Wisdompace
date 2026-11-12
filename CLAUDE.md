# MyWisdompace 项目指南

> 《一生的整理》官方网站 — 生命意义与人生规划平台
> 最后更新：2026-11-09（全文按实际代码逐条核实）
>
> **📋 项目升级路线图**：[docs/ROADMAP-Upgrade-Milestones.md](./docs/ROADMAP-Upgrade-Milestones.md)

---

## 🎯 项目定位

帮助用户认真回顾此生、整理人生、做好准备的数字化平台。分为「积极生活」和「坦然告别」两大部分。

规模：约 **4.3 万行 TS/TSX，243 个源文件**，含 20 个交互工具（24 个 page.tsx）、17 个 API 端点、5 个内容章节。

---

## 🛠️ 技术栈

以下版本为 `node_modules` 中的**实际安装版本**（非 package.json 声明值）。

| 层 | 选型 |
|---|---|
| 框架 | Next.js **16.2.3**（App Router + Turbopack） |
| UI | React **19.2.3** + TypeScript **5.9.3** |
| 样式 | Tailwind CSS **4.1.18** |
| 状态 | Zustand（persist 中间件）+ TanStack Query |
| 编译 | React Compiler — **当前已禁用**（见「已知问题」第 1 条） |
| 后端 | Supabase（Auth + Postgres + RLS），`@supabase/ssr` |
| 本地库 | Dexie / IndexedDB（knowpeople 子系统） |
| AI | 自建 Provider 工厂：openai / kimi / deepseek，默认 **kimi**（由 `AI_DEFAULT_PROVIDER` 切换） |
| 校验 | Zod 4 |
| 图表 | Recharts 3 |
| 国际化 | i18next，三语：`zh-CN` / `zh-TW` / `en` |
| 测试 | Vitest（单测）+ Playwright（e2e） |
| 部署 | Vercel |

⚠️ **Next.js 16 已将 `middleware.ts` 更名为 `proxy.ts`** —— 本项目使用 [src/proxy.ts](./src/proxy.ts)，不存在 `src/middleware.ts`。

---

## 📁 目录结构

```
src/
├── app/
│   ├── page.tsx                     # 首页（Hero + 搜索入口）
│   ├── layout.tsx                   # 根布局
│   ├── search/page.tsx              # 搜索结果页
│   ├── (auth)/                      # login / register / forgot-password / reset-password
│   ├── auth/                        # Supabase 邮箱验证回调
│   ├── chapter/                     # 章节内容（见「路由地图」）
│   ├── tools/                       # 20 个交互工具（24 个 page.tsx）
│   ├── about-simon/                 # 作者介绍（5 个子页）
│   ├── conversations/               # AI 对话列表页 + [id] 聊天页
│   └── api/                         # 17 个 route.ts
├── components/
│   ├── NavBar.tsx                   # 导航栏
│   ├── ToolPlaceholder.tsx          # 工具入口卡（824 行）
│   ├── chapter/ChapterReader.tsx    # 章节阅读器
│   ├── tools/ToolContainer.tsx      # 工具容器（含 Error Boundary）
│   ├── tools/{emotional-assessment,life-clock,three-questions}/
│   ├── chat/                        # ChatContainer / MessageList / MessageBubble / ChatInput / ThinkingIndicator
│   ├── auth/ charts/ layout/ providers/ ui/ about-simon/
│   └── __tests__/
├── config/security.config.ts        # 🔒 安全配置中心（CSP、白名单）
├── data/
│   ├── chapters.ts                  # 章节内容核心数据源
│   └── <tool>/                      # 各工具题库（9 个目录）
├── hooks/useCurrentUser.ts          # 用户态（已对接 Supabase Auth）
├── i18n/locales/{zh-CN,zh-TW,en}.json
├── knowpeople/                      # 识人子系统（独立分层架构）
├── lib/                             # 工具库（见各节）
├── stores/                          # 11 个 Zustand store
├── styles/tokens.css                # 设计系统 CSS 变量
├── types/
└── proxy.ts                         # Next.js 中间件（请求预检 + session 刷新）
```

---

## 🗺️ 路由地图

### 内容章节

数据源为单一文件 [src/data/chapters.ts](./src/data/chapters.ts)：

| 章节 | slug | 路由 | 小节数 |
|---|---|---|---|
| 预备此生 | `read-instructions` | `/chapter/read-instructions`（独立页面） | 7 |
| 第一篇｜看见自己 | `chapter-1` | `/chapter/[slug]` | 6 |
| 第二篇｜积极生活 | `chapter-2` | `/chapter/[slug]` | 7 |
| 第三篇｜清楚交代 | `chapter-3` | `/chapter/[slug]` | 7 |
| 第四篇｜好好告别 | `chapter-4` | `/chapter/[slug]` | 6 |

`chapter/[slug]/page.tsx` 通过 `generateStaticParams` 静态生成。渲染链：
`page.tsx` → `ClientChapterContent`（i18n 切换）→ `ChapterReader` → 小节若带 `toolId` 则内嵌 `<ToolContainer>`。

### 其他页面

- **作者介绍** `/about-simon`：主页（479 行）+ `philosophy` / `services` / `content` / `connect`，共 1830 行，各有独立 layout。
- **AI 对话** `/conversations`（列表页，未登录不加载）+ `/conversations/[id]`（聊天页）。
- **搜索** `/search`。

### API 路由（17 个）

| 分组 | 端点 |
|---|---|
| 认证 | `/api/auth/login`、`register`、`logout`、`me` |
| 数据 | `/api/assessments`、`/api/living-will`、`/api/progress` |
| 对话 | `/api/chat`（SSE 流式）、`/api/conversations`、`/api/conversations/[id]` |
| 投票 | `/api/poll/vote`、`vote-check`、`aggregates` |
| 其他 | `/api/search`、`/api/contact` |
| 调试 | `/api/test-scoring`、`/api/test-supabase` —— **生产环境由 proxy.ts 返回 404** |

---

## 🧩 交互工具清单

注册表 [src/lib/tools.ts](./src/lib/tools.ts) 共 29 个条目，字段 `{ id, name, status: 'ready' | 'developing', description }`，供 `ToolContainer` 渲染入口卡与状态文案。

工具页面全部位于 `src/app/tools/`。**以下 20 个均为完整实现**（单页 400~1500 行，配套 `src/data/<tool>/` 题库）：

### 测评类

| 工具 | 说明 |
|---|---|
| `mbti-test` | MBTI 性格测评 |
| `big-five-test` | 大五人格测评 |
| `career-values-test` | 从 14 项职业价值观中筛选核心 3 项 |
| `ability-test` | 42 项能力评估，6 大领域（已由 7 域改造为 6 域） |
| `emotional-assessment` | 情绪 / 紧张 / 压力三维评估（page 仅 53 行，逻辑在 `src/components/tools/emotional-assessment/`） |
| `no-regrets` | 7 维生命自洽指数 |
| `dementia-prevention` | 基于柳叶刀 14 项风险因素 |
| `hobby-radar` | 爱好健康雷达图 |
| `ta-worth-trust` | 意定人托付评估 |

### 规划类

| 工具 | 说明 |
|---|---|
| `life-clock` | 生命余光月格倒计时 |
| `role-pie-chart` | 人生角色饼图（1310 行，最大工具页之一） |
| `responsibility-list` | 责任清单 + 交接安排 |
| `choice-rights` | 生前预嘱五愿望 |
| `three-questions` | 重大决策三思清单 |
| `retirement-cost-calculator` | 晚年花费测算 —— 从退休到离世算清日常、医疗、照护与热爱需要多少钱；多情景测算，数据仅存本机（`wp-retirement-cost-calculator-storage`），挂在 chapter-3 |
| `goodbye-list` | 遗愿清单（展示名；URL 与标识符仍为 goodbye-list） |
| `farewell-style` | 告别方式 |
| `next-life-design` | 50 点投胎积分游戏 |

### 社区 / 识人

| 工具 | 说明 |
|---|---|
| `community-aging-poll` | 匿名养老投票，**唯一走真实后端聚合**的工具 |
| `people-insight` | 慧眼识人，详见下节 knowpeople 子系统 |

### 仍为占位、无独立页面的 5 个

`identity-portrait`、`tag-selector`、`role-stripper`、`life-finder`、`choice-maker`。

⚠️ `tools.ts` 中 `people-insight` 仍标记为 `developing`，但代码已完整（主页 832 行 + 详情页 1469 行 + 整个子系统）—— **注册表状态过时**，见「已知问题」第 4 条。

---

## 🔍 识人子系统（knowpeople）

[src/knowpeople/](./src/knowpeople) 是一套自带分层架构的独立模块，不依赖 `src/lib` 的通用工具。

```
knowpeople/
├── core/
│   ├── models/index.ts                  # 领域模型
│   ├── calculators/trustBank.ts         # 信任银行算法
│   └── constants/{categories,events,weights}.ts
├── services/{db,personService,observeService,exportService,cloudSyncService}.ts
├── hooks/{usePersons,useObserve,usePeopleInsightCloudSync}.ts
├── components/{BottomNav,ui/Toast}.tsx
└── lib/{trustColors,utils}.ts
```

**领域模型**：`Person`（代号、9 大分类、`trustValue` / `reliability` / `intimacy` 三项冗余统计、`active` / `archived`）、`HardwareInfo`、`SoftwareTrait`、`CharacterScores`（5 项品性，0-10）、`Ability`、`NetworkInfo`、`ObserveEvent`（正/中/负事件，带 `trustDelta`）。

**信任银行算法**（`core/calculators/trustBank.ts`）：

```
当前信任值 = 初始值
           + 事件累计
           + 时间加分（sqrt 曲线，封顶 10 分；负面事件每个抵 2 分）
           - 周期衰减（超过分类观察周期后每周期扣 decayRate，封顶 maxDecay）
最终 clamp 到 [分类下限, 100]
```

派生指标：

- **靠谱度** = 尽责 × 0.3 + 诚信 × 0.3 + 情绪稳定 × 0.2 + 事件 × 0.2
- **亲密度** = 频率 × 0.4 + 信任 × 0.3 + 沟通深度 × 0.3
- **可信度** = 认识时长 × 0.6 + 观察次数 × 0.4

**存储**：主数据在 **Dexie / IndexedDB**（库名 `WisdomPace_KnowPeople`，7 张表，v2 迁移新增 `status` 字段）。登录后 `cloudSyncService` 把 `exportService` 打包的**全量 ExportData 作为单条 JSONB** 存入 Supabase `progress` 表（`category='tool-state'`、`key='people-insight'`），按 `updatedAt` 双向覆盖。

---

## 💾 状态与持久化

### Zustand store（`src/stores/`）

全部使用 `persist` 中间件：

| Store | localStorage key | 职责 |
|---|---|---|
| `toolStateStore` | `wp-tool-states` | 通用工具状态 |
| `testStore` | `mbti-test-state` | MBTI / 大五答题进度；hydration 后调 `fetchToolState` 合并云端 |
| `lifeClockStore` | — | 生命时钟输入 + 计算结果 |
| `emotionalAssessmentStore` | — | 情绪评估输入 + 结果 |
| `threeQuestionsStore` | — | 三思清单输入 + 结果 |
| `communityAgingPollStore` | — | 投票步骤 / 答案 |
| `livingWillStore` | `living-will-storage` | 生前预嘱 |
| `retirementCostStore` | `wp-retirement-cost-calculator-storage` | 晚年花费测算输入 + 分步进度（step 0-3 表单，4 出报告） |
| `readingProgressStore` | `wp-reading-progress` | 章节阅读位置 |
| `preferencesStore` | `wp-preferences` | 主题 / 字号 / 语言 |
| `authStore` | `auth-storage` | 用户态，**仅持久化 `user`**；恢复时强制 `status='loading'` 重新验证 |

### 持久化分工（`src/lib/`）

| 文件 | 职责 |
|---|---|
| `localStorage.ts` | MBTI / 大五专用读写（7 天过期、配额容错） |
| `storage-migration.ts` | 旧站 `mywisdompace` key 一次性迁移到 `wp-*` 三个 key |
| `user-data.ts` | 全站进度 / 偏好的 JSON 导出导入 |
| `sync.ts` | **登录时全量合并**：白名单 `SYNCABLE_KEYS`，按 `updatedAt` 时间戳新者胜，走 `/api/progress` |
| `sync-tool-state.ts` | **增量上传**：store 内 1.5s 防抖，检测到 `auth-storage` 有 `user.id` 才同步 |

**本地 / 云端切换逻辑**：未登录 → 纯 localStorage；登录后 → 自动增量上传 + 登录时全量合并。

---

## 🔐 后端与数据库

### 认证体系（Supabase Auth，邮箱为主）

四个 API 均为 Supabase Auth 薄封装，带中文错误映射：

| 端点 | 实现 |
|---|---|
| `login` | `signInWithPassword` |
| `register` | `signUp` + `emailRedirectTo: /auth/callback`；密码最短 6 位；返回 `needsConfirmation` 支持邮箱验证 |
| `me` | `getUser()` 校验 |
| `logout` | `signOut()` |

**Supabase 封装**（`src/lib/supabase/`）：

- `server.ts` —— `createServerClient` + cookieStore
- `client.ts` —— `createBrowserClient`
- `middleware.ts` / `updateSession.ts` —— `updateSession()` 使用 **`getUser()` 而非 `getSession()`**（防 JWT 伪造）来刷新 token

**前端认证态**：`stores/authStore.ts` 提供 `login` / `register` / `logout` / `initSession` / `resetPassword` / `updatePassword`，登录成功后异步调用 `syncLocalToCloud()`；`hooks/useCurrentUser.ts` 封装该 store，`loading` 时触发 `initSession`。

> **❗ 认证已对接真实 Supabase Auth，不再是内存模拟。**（旧版文档的"当前为内存模拟"表述已失效）

**路由保护**：`proxy.ts` **不做登录重定向**，页面级保护由客户端判断。

**密码重置**：`(auth)/forgot-password` → `resetPasswordForEmail` → `/reset-password` → `updateUser({ password })`。

**未实现**："记住我"功能。

### 数据库 Schema（`supabase/migrations/`）

共 **6 张表，全部启用 RLS**，策略统一为 `auth.uid() = user_id`：

| 表 | 迁移 | 关键字段 | 说明 |
|---|---|---|---|
| `users` | 001 | `id` 引用 `auth.users` | trigger 自动建档 |
| `assessments` | 001 | `type` + `result`(JSONB) + `is_latest` | trigger 自动置旧记录；003 补 UPDATE RLS |
| `progress` | 001 | `(category, key)` 唯一 + `value`(JSONB) | 全站同步落点 |
| `conversations` | 001 | `messages`(JSONB 数组) | AI 对话历史 |
| `poll_votes` | 004 | `UNIQUE(tool_id, session_id)` | 匿名投票；**仅公开 INSERT，禁止 SELECT** |
| `poll_aggregates` | 004 | 聚合计数 | trigger 自动聚合；**公开读，禁止写** |

`002_living_will_types.sql` 仅为注释文档，用于注册 living-will 类型。

**API → 表映射**：assessments / living-will → `assessments`；progress → `progress`；conversations + chat → `conversations`；`poll/vote` 使用 **service_role key 绕过 RLS**，`vote-check` / `aggregates` 使用匿名客户端。

---

## 🔒 安全架构

纵深防御，四层落地。详细设计见 [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)，日常使用见 [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)。

### 1. 响应头（[next.config.ts](./next.config.ts)）

无条件启用 6 个：

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`（禁用 camera / microphone / geolocation / interest-cohort）
- `Strict-Transport-Security`（max-age 1 年 + includeSubDomains + preload）

**CSP 由 `securityPolicy.enableCSP` 门控**（`next.config.ts:56`）：

- `development` → `enableCSP: false`（避免阻止热重载）
- `production` / `test` → `enableCSP: true`

另有 `poweredByHeader: false`、`images.dangerouslyAllowSVG: false`、`reactStrictMode` 仅生产开启。

### 2. 配置中心（[src/config/security.config.ts](./src/config/security.config.ts)）

集中管理 script / style / image / connect / frame 五类白名单。`connect` 白名单含 Supabase、Resend、OpenAI、Kimi、DeepSeek、百度统计。CSP 构建强制 `object-src 'none'`、`frame-ancestors 'self'`；非生产环境额外注入 `'unsafe-eval'`。

### 3. 工具函数（[src/lib/security.ts](./src/lib/security.ts)）

`escapeHtml`、`stripHtml`、`sanitizeInput`、`validateSearchQuery`（搜索限 100 字符）、`validateUrl`（origin 白名单）、`validateScriptSrc`、`validateStorageData`（导入限 1MB）、`generateNonce`。

### 4. 请求预检（[src/proxy.ts](./src/proxy.ts)）

四步流程：

1. **请求体大小预检**（仅 POST / PATCH / PUT）—— 按路由配额：`/api/chat` 500KB、`/api/assessments` 256KB、`/api/conversations` 256KB、`/api/living-will` 128KB、`/api/contact` 64KB、`/api/progress` 64KB，默认 1MB；超限返回 413
2. **隔离调试端点** —— 生产环境对 `/api/test-*` 返回 404
3. **Supabase Session 刷新**（核心）
4. **补充安全头**（覆盖 Next.js `headers` 配置无法处理的场景）

### 限流（[src/lib/rate-limit.ts](./src/lib/rate-limit.ts)）

**纯内存 `Map` 滑动窗口**（非 Redis），按 IP 限流，每 5 分钟清理一次。

预设配额：`login` 5/min、`register` 3/min、`contact` 5/min、`chat` 10/min。

⚠️ **实际只有 `chat` 和 `contact` 两个路由接入了限流**；`login` / `register` 已定义但未调用 —— 见「已知问题」第 2 条。

### 日志（[src/lib/security-logger.ts](./src/lib/security-logger.ts)）

console 结构化输出：限流触发、蜜罐命中、认证失败、可疑输入、请求体超限、调试端点拦截。

### 输入校验（[src/lib/validations/](./src/lib/validations)）

Zod schema 覆盖 5 个领域：`contact`、`assessment`、`progress`（discriminatedUnion）、`poll`、`conversation`。

---

## 🤖 AI 对话能力

**接口** `/api/chat`（POST，SSE 流式）防护链：

```
限流 → 单 IP 最多 3 并发 → 登录校验 → 消息数 ≤50 / 单条 ≤8000 字符过滤
     → 注入"人生整理顾问" system prompt → 流式返回
     → 流结束后异步追加消息到 conversations 表并自动生成标题
```

**Provider 工厂**（`src/lib/ai/`）：`types.ts` 定义 `AIProviderName = 'openai' | 'kimi' | 'deepseek'`；三家均为 OpenAI 兼容格式，各自实现 `complete()`（非流式）+ `stream()`（流式）；`index.ts` 为工厂，由 `AI_DEFAULT_PROVIDER` 环境变量切换，默认 `kimi`（moonshot-v1-8k）。

**组件**（`src/components/chat/`）：`ChatContainer`、`MessageList`、`MessageBubble`、`ChatInput`、`ThinkingIndicator`。

**会话管理** `/api/conversations`：GET 列表 / POST 创建（zod 校验）；`[id]` 支持 GET / PATCH / DELETE。

架构决策见 [docs/ADR/ADR-004-ai-provider-architecture.md](./docs/ADR/ADR-004-ai-provider-architecture.md)。

---

## 🔎 搜索

[src/lib/search-index.ts](./src/lib/search-index.ts) 在**模块加载时**由 `buildDocs()` 遍历 zh-CN / en 两套 i18n JSON 的 `chapterContent` 以及 `chapters` 结构，生成「整页」与「每小节」（带 `#sectionId` 锚点）两级文档；`searchAll()` 做子串匹配，朴素打分：标题命中 +2000、正文命中 +1000。

---

## ⚙️ 工程化

### npm 脚本

```bash
npm run dev              # 开发模式（热重载）
npm run build            # 生产构建
npm run start            # 启动生产服务器
npm run lint             # ESLint 检查
npm run lint:fix         # ESLint 自动修复
npm run format           # Prettier 格式化
npm run format:check     # Prettier 检查
npm run test             # Vitest 单次运行
npm run test:watch       # Vitest 监听模式
npm run test:coverage    # 覆盖率报告
npm run test:e2e         # Playwright
npm run test:e2e:ui      # Playwright UI 模式
npm run clean            # 清理 .next 与 node_modules/.cache
npm run dev:clean        # 清理后启动开发
```

### CI/CD（`.github/workflows/`）

`ci.yml`（lint + typecheck）、`test.yml`、`pr-checks.yml`、`security.yml`（定时扫描）、`deploy.yml`、`keep-alive.yml`（cron 保活 Supabase 免费版），另有 dependabot 配置。

预提交：`.husky/pre-commit` → lint-staged（`*.{ts,tsx}` 跑 `eslint --fix` + `prettier --write`；`*.{js,jsx,json,css,md}` 跑 `prettier --write`）。

### 测试现状

| 类型 | 覆盖范围 |
|---|---|
| Vitest（jsdom） | **仅 3 个文件** —— NavBar、SearchPanel 组件 + `lib/scoring` 逻辑 |
| Playwright | 5 浏览器 / 视口矩阵，5 个 spec：`auth`（3 条 UI 断言）、`homepage`、`navigation`、`tools`、`responsiveness_audit`；自带 dev server |

⚠️ 单测覆盖面相对 4.3 万行代码明显偏小。

### 部署

`vercel.json`（nextjs framework + 清缓存构建）；`.vercelignore` 排除安全文档、参考子项目、`e2e/`、`docs/` 等。

### 根目录参考子项目（不参与部署）

`big-five-personality/`、`mbti-assessment/`、`skill-能力兴趣测评/`、`depression-assessment-lowrisk/`、`fojin-master/` —— 题库素材与 Skill 源项目，已被 `.vercelignore` 排除。

---

## ⚠️ 已知问题与技术债

1. **React Compiler 已禁用**（`next.config.ts:70`，`reactCompiler: false`）。原因：与 Recharts 雷达图 / `ResponsiveContainer` 内部 `useEffect` setState 冲突，触发 React #185 无限循环（Maximum update depth）。目前已有 17 个文件使用 `'use no memo'`（含 `.ts` 与 `.tsx`）。后续需在所有 Recharts 工具页严格加 `'use no memo'` 后再启用。
   ⚠️ `README.md` 仍写作"React Compiler（实验性）"已启用 —— 文档不一致。

2. **限流未接线**：`RATE_LIMITS.login`（5/min）与 `register`（3/min）已定义（`rate-limit.ts:135`、`:137`），但只有 `chat` 和 `contact` 实际调用 `checkRateLimit`。登录 / 注册接口存在暴力破解缺口。

3. **无服务端路由保护**：`proxy.ts` 不做登录重定向，受保护页面全靠客户端判断，存在直接访问窗口。

4. **`tools.ts` 注册表状态过时**：`people-insight` 仍标 `developing`，实际已完整实现。

5. **单测覆盖不足**：Vitest 仅 3 个文件。

6. **文档漂移**：`README.md` 与部分 `docs/` 内容停留在早期状态（技术栈版本、工具待办清单、设计系统色值）。`README.md` 引用的 `../AGENTS.md` **实际不存在**。

7. **未实现"记住我"** 会话功能。

---

## 📝 内容更新指南

章节内容存储在 [src/data/chapters.ts](./src/data/chapters.ts)，结构：

```typescript
{
  slug: "chapter-1",
  title: "第一篇｜看见自己",
  subtitle: "...",
  description: "...",
  sections: [
    {
      id: "section-id",
      title: "小节标题",
      paragraphs: ["段落1", "段落2"],
      questions?: ["思考题1"],   // 可选
      toolId?: "tool-name"       // 关联工具，可选
    }
  ]
}
```

改动章节内容后需同步更新 `src/i18n/locales/*.json` 中的 `chapterContent`，否则搜索索引与 i18n 渲染会不一致。

工具题库放在 `src/data/<tool>/`，工具状态放在对应的 `src/stores/*Store.ts`。

---

## 🎨 设计系统

Token 定义在 [src/styles/tokens.css](./src/styles/tokens.css)（前缀 `--wp-*`，改编自 fojin-master 的 `--fj-*` 色板）；about-simon 另有独立的 `about-simon-tokens.css`。

### 色彩

| 变量 | 值 | 用途 |
|---|---|---|
| `--wp-bg` | `#f8f5ef` | 暖羊皮纸主背景 |
| `--wp-bg-alt` | `#f0ebe2` | 次级背景 |
| `--wp-card-bg` | `rgba(255,255,255,0.6)` | 卡片 / 面板背景 |
| `--wp-ink` | `#2b2318` | 主文字 |
| `--wp-ink-light` | `#5c4f3d` | 次级文字 |
| `--wp-ink-muted` | `#9a8e7a` | 弱化 / 占位文字 |
| `--wp-accent` | **`#8b2500`** | 主强调色 —— **深红** |
| `--wp-gold` | `#b08d57` | 次强调色 —— 金 |
| `--wp-border` | `#d9d0c1` | 边框 |

赛博风补充色（用于特定工具）：`--wp-cyber-blue: #00F0FF`、`--wp-cyber-purple: #BD00FF`、`--wp-cyber-dark: #1A1A2E`。

### 其他 Token

- **字体**：`--wp-font-serif`（Noto Serif SC / Source Han Serif，中文标题）、`--wp-font-sans`（Noto Sans SC / Source Han Sans，正文）
- **布局**：`--wp-sidebar-width: 220px`、`--wp-content-max: 800px`、`--wp-header-h: 52px`
- **断点**：`--wp-bp-mobile: 768px`、`--wp-bp-tablet: 1024px`
- **阴影**：`--wp-shadow-sm` / `md` / `lg`（基于 `rgba(43, 35, 24, …)`）
- **动效**：`--wp-transition: 0.2s ease`

---

## 📚 文档索引

| 文档 | 说明 |
|---|---|
| [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) | 安全配置快速使用指南（日常开发、集成第三方服务） |
| [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) | 安全架构详细设计（架构理解、团队规范、安全审查） |
| [docs/ROADMAP-Upgrade-Milestones.md](./docs/ROADMAP-Upgrade-Milestones.md) | 项目升级路线图 |
| [docs/ADR/](./docs/ADR/) | 4 份架构决策记录：Next.js 框架选型、Vitest 测试、Supabase Auth、AI Provider 架构 |
| [docs/CI_CD_SETUP.md](./docs/CI_CD_SETUP.md) | CI/CD 配置说明 |
| [docs/testing.md](./docs/testing.md) | 测试说明 |
| [docs/troubleshooting-guide.md](./docs/troubleshooting-guide.md) | 故障排查指南 |
| `docs/MILESTONE-*.md`、`docs/*-ARCH-PLAN.md` | 各工具迁移里程碑与架构方案 |

### 集成第三方服务

编辑 [src/config/security.config.ts](./src/config/security.config.ts)，在对应白名单数组中添加域名：

```typescript
// 脚本类（Google Analytics 等） → ALLOWED_SCRIPT_DOMAINS
// 内嵌框架（YouTube 等）        → ALLOWED_FRAME_DOMAINS
// 接口请求                      → ALLOWED_CONNECT_DOMAINS
```

新增 `connect` 域名后须在生产环境验证 CSP 实际拦截行为 —— 开发环境 CSP 关闭，不会暴露问题。

---

## 🤖 对话规则

1. 直接给结论，不要前置解释和铺垫
2. 不复述问题，不使用"好的""明白了""让我来"等引导词
3. 区分大小事项：简单问题一句话，复杂问题才展开
4. 客观陈述，不使用"很棒的问题""非常聪明"等捧场话术
5. 回答末尾不加多余总结
6. 默认使用中文回复
