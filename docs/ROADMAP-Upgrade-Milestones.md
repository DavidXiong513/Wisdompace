# MyWisdompace-next 升级里程碑

> 版本：v1.0  
> 创建时间：2026-04-10  
> 基于：FoJin VS MyWisdompace-next 对比分析

---

## 📋 项目现状快照

### MyWisdompace-next 当前状态
- **技术栈**：Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui
- **内容**：四大篇章（自我认知、人生目标、价值体系、行动计划）
- **测评工具**：MBTI、Big Five、能力测评（框架就绪，待完善）
- **CI/CD**：✅ 已配置（5个工作流）
- **国际化**：基础 i18next 配置，3种语言

### FoJin 可借鉴亮点
- 工程化成熟度（ADR、CI/CD、测试体系）
- AI 集成（RAG、SSE流式、多Provider）
- 数据可视化（图表、Dashboard）
- 状态管理（Zustand + TanStack Query分离）

---

## 🎯 里程碑总览

```
里程碑 1: 工程化基础建设 ───────┬─── 2周 ───┬─── 立即开始 ───┐
里程碑 2: 后端架构搭建 ──────────┼─── 3周 ───┼─── 并行进行 ───┤
里程碑 3: 测评工具完善 ──────────┼─── 2周 ───┼─── 可提前 ─────┤
里程碑 4: AI助手集成 ────────────┼─── 3周 ───┼─── 依赖后端 ───┤
里程碑 5: 数据可视化与优化 ───────┴─── 2周 ───┴─── 最后阶段 ──┘
```

---

## 🏁 里程碑 1：工程化基础建设

**目标**：建立 FoJin 级别的工程化标准
**时间**：2周  
**费用**：¥0（使用免费方案）

### 任务清单

#### 1.1 测试框架配置
- [ ] 安装并配置 Vitest
- [ ] 配置 Playwright E2E测试
- [ ] 创建第一个组件测试（SearchPanel.test.tsx）
- [ ] 配置覆盖率报告

**验收标准**：
```bash
npm run test          # 运行单元测试
npm run test:e2e      # 运行E2E测试
npm run test:coverage # 覆盖率 > 50%
```

#### 1.2 CI/CD 完善
- [x] 基础CI配置（已存在）
- [ ] 添加测试覆盖率检查
- [ ] 配置 Vercel 自动部署
- [ ] 添加 PR 预览部署

**验收标准**：
- PR 自动触发测试和预览
- main 分支自动部署到生产

#### 1.3 代码规范
- [ ] 配置 ESLint 严格模式
- [ ] 配置 Prettier 格式化
- [ ] 配置 husky + lint-staged
- [ ] 修复现有代码规范问题

**验收标准**：
```bash
npm run lint       # 无错误
npm run lint:fix   # 自动修复
npm run format     # 统一格式化
```

#### 1.4 架构决策记录（ADR）
- [ ] 创建 `docs/ADR/` 目录
- [ ] ADR-001: 技术栈选型理由
- [ ] ADR-002: 数据库选型决策
- [ ] ADR-003: AI Provider 选型

**验收标准**：
- 至少3个关键决策有文档记录
- 模板规范统一

### 里程碑1完成标志
- [ ] 所有测试通过
- [ ] CI/CD 正常工作
- [ ] 代码规范检查通过
- [ ] ADR文档就位

---

## 🏁 里程碑 2：后端架构搭建

**目标**：建立数据持久化和用户系统  
**时间**：3周  
**费用**：¥0-200/月（Supabase免费档起步）

### 任务清单

#### 2.1 数据库设计
- [ ] 用户表（users）
- [ ] 测评结果表（assessments）
- [ ] 用户进度表（progress）
- [ ] AI对话历史表（conversations）

**Schema设计**：
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  assessments Assessment[]
  progress  Progress[]
  conversations Conversation[]
}

model Assessment {
  id          String   @id @default(uuid())
  userId      String
  type        String   // MBTI | BigFive | Ability
  result      Json
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

#### 2.2 后端API开发
- [ ] 配置 Next.js API Routes
- [ ] 用户认证 API（注册/登录/登出）
- [ ] 测评结果保存/查询 API
- [ ] 用户进度同步 API

**验收标准**：
```bash
# API测试通过
curl /api/auth/login      # 200 OK
curl /api/assessments     # 200 OK with data
curl /api/progress        # 200 OK with data
```

#### 2.3 状态管理升级
- [ ] 引入 TanStack Query
- [ ] 重构用户认证 Store（参考 FoJin authStore）
- [ ] 实现服务端数据缓存
- [ ] 添加乐观更新

**验收标准**：
- 页面加载时自动获取用户数据
- 离线修改后自动同步
- 错误自动重试

#### 2.4 认证与权限
- [ ] ProtectedRoute 组件
- [ ] JWT Token 管理
- [ ] 权限检查中间件

**验收标准**：
- 未登录用户访问受保护页面自动跳转
- Token 过期自动刷新

### 里程碑2完成标志
- [ ] 数据库Schema设计完成
- [ ] 用户系统正常运行
- [ ] API文档可用
- [ ] 前后端数据流打通

---

## 🏁 里程碑 3：测评工具完善

**目标**：打造专业级的测评体验  
**时间**：2周  
**费用**：¥0（使用免费图表库）

### 任务清单

#### 3.1 MBTI测评完善
- [ ] 完整93题版本
- [ ] 结果可视化（雷达图）
- [ ] 详细报告页面
- [ ] 历史记录对比

**参考实现**：
```typescript
// 雷达图展示四维特征
<RadarChart data={mbtiDimensions} />
```

#### 3.2 Big Five测评完善
- [ ] 60题完整版本
- [ ] 五维度可视化
- [ ] 对比分析（与常模对比）

#### 3.3 能力测评完善
- [ ] 多维度能力测试
- [ ] 能力图谱展示
- [ ] 发展建议生成

#### 3.4 测评结果管理
- [ ] 测评历史列表
- [ ] 结果导出（PDF）
- [ ] 趋势分析图表

**验收标准**：
- 三个测评工具均可正常使用
- 结果可视化美观
- 报告可导出

### 里程碑3完成标志
- [ ] 三个测评工具完整可用
- [ ] 测评结果可视化
- [ ] 历史记录可查看
- [ ] 报告导出功能

---

## 🏁 里程碑 4：AI助手集成

**目标**：实现 FoJin 级别的AI问答体验  
**时间**：3周  
**费用**：¥150-500/月（API调用费用）

### 任务清单

#### 4.1 SSE流式传输
- [ ] 实现 SSE API 端点
- [ ] 前端流式渲染组件
- [ ] 打字机效果优化

**参考实现**（FoJin）：
```typescript
const eventSource = new EventSource(`/api/chat/stream?session=${sessionId}`);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  appendMessage(data.content);
};
```

#### 4.2 多Provider支持
- [ ] OpenAI 支持
- [ ] Kimi/K2.5 支持
- [ ] DeepSeek 支持
- [ ] 动态切换Provider

#### 4.3 RAG架构（可选）
- [ ] 内容向量化
- [ ] 相似度搜索
- [ ] 引用溯源功能

#### 4.4 AI助手功能设计
- [ ] 人生规划顾问角色
- [ ] 智能推荐（内容/测评）
- [ ] 个性化建议生成

#### 4.5 对话管理
- [ ] 多会话管理
- [ ] 历史记录保存
- [ ] 会话导出

**验收标准**：
- 流式回答流畅
- 支持至少3个Provider
- 回答可引用网站内容

### 里程碑4完成标志
- [ ] AI助手可正常对话
- [ ] 流式输出流畅
- [ ] 多Provider切换正常
- [ ] 对话历史可保存

---

## 🏁 里程碑 5：数据可视化与性能优化

**目标**：数据驱动的用户体验  
**时间**：2周  
**费用**：¥0-100/月（可选CDN）

### 任务清单

#### 5.1 数据可视化
- [ ] 引入 @ant-design/charts
- [ ] 用户进度时间线
- [ ] 测评结果对比图
- [ ] 个人成长Dashboard

#### 5.2 搜索功能增强
- [ ] 服务端搜索API
- [ ] 搜索建议（Auto-complete）
- [ ] 搜索结果高亮
- [ ] 筛选功能

#### 5.3 性能优化
- [ ] Next.js ISR配置
- [ ] 图片优化
- [ ] 代码分割优化
- [ ] 首屏加载速度 < 2s

#### 5.4 国际化完善
- [ ] HTTP按需加载翻译
- [ ] 浏览器语言检测
- [ ] 翻译管理规范

### 里程碑5完成标志
- [ ] Dashboard可用
- [ ] 搜索功能完善
- [ ] 性能指标达标
- [ ] 多语言体验流畅

---

## 📊 进度追踪表

| 里程碑 | 任务数 | 已完成 | 进度 | 状态 |
|--------|--------|--------|------|------|
| 1. 工程化基础 | 12 | 0 | 0% | 🔴 未开始 |
| 2. 后端架构 | 16 | 0 | 0% | 🔴 未开始 |
| 3. 测评完善 | 12 | 0 | 0% | 🔴 未开始 |
| 4. AI集成 | 15 | 0 | 0% | 🔴 未开始 |
| 5. 可视化优化 | 12 | 0 | 0% | 🔴 未开始 |
| **总计** | **67** | **0** | **0%** | 📋 |

---

## 💰 成本预算汇总

| 阶段 | 起步成本 | 标准配置 | 高级配置 |
|------|----------|----------|----------|
| 里程碑1 | ¥0 | ¥0 | ¥0 |
| 里程碑2 | ¥0 | ¥100 | ¥200 |
| 里程碑3 | ¥0 | ¥0 | ¥0 |
| 里程碑4 | ¥150 | ¥300 | ¥500 |
| 里程碑5 | ¥0 | ¥50 | ¥100 |
| **总计** | **¥150** | **¥450** | **¥800** |

### 免费替代方案
- 数据库：Supabase免费档（500MB）
- AI：国产模型免费额度
- 部署：Vercel Hobby
- **可实现 ¥0-150/月 运行**

---

## 🚀 立即行动清单

### 今天可以开始：
1. [ ] 配置 Vitest 测试框架
2. [ ] 创建 `docs/ADR/` 目录
3. [ ] 安装 @tanstack/react-query

### 本周完成：
1. [ ] 完成里程碑1的所有任务
2. [ ] 设计数据库Schema初稿
3. [ ] 开始测评工具完善

---

## 📝 更新日志

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-04-10 | v1.0 | 初始版本，基于 FoJin 对比分析 |

---

## 🔗 相关文档

- [对比分析报告](../Fojin%20VS%20Wisdompace-next网站的对比分析报告.md)
- [CLAUDE.md](../../CLAUDE.md) - 项目指南
- [API文档](./api/README.md) (待创建)
- [ADR文档](./ADR/README.md) (待创建)
