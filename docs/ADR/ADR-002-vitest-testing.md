# ADR-002: 使用 Vitest + Playwright 测试框架

- 日期：2026-04-10
- 状态：已接受
- 决策人：@WisdomPace

## 背景

项目需要建立完善的测试体系，包括：
- 单元测试（组件、工具函数）
- 集成测试（API、状态管理）
- E2E 测试（用户流程）

参考 FoJin 项目的测试实践，需要选择适合 Next.js + TypeScript 的测试方案。

## 决策

使用 **Vitest** 作为单元测试框架，**Playwright** 作为 E2E 测试框架。

## 考虑因素

### 单元测试框架

#### 选项1：Vitest ✅

**优点：**
- 原生 TypeScript 支持，无需额外配置
- 与 Vite 生态一致，速度快
- 兼容 Jest API，学习成本低
- 内置覆盖率报告

**缺点：**
- 相对较新（但已非常成熟）

#### 选项2：Jest

**优点：**
- 生态最成熟
- 文档丰富

**缺点：**
- 需要额外配置 TypeScript
- 配置较复杂

### E2E 测试框架

#### 选项1：Playwright ✅

**优点：**
- 多浏览器支持（Chromium、Firefox、WebKit）
- 自动等待，测试更稳定
- 追踪、截图、视频录制
- 与 Vitest 配合良好

**缺点：**
- 学习成本略高

#### 选项2：Cypress

**优点：**
- 实时重载，开发体验好
- 文档友好

**缺点：**
- 只支持 Chromium 系浏览器（Firefox 支持有限）
- 跨域处理较复杂

## 决策理由

1. **速度优先**：Vitest 比 Jest 启动更快
2. **原生 TS**：无需额外配置
3. **现代工具链**：与项目使用的现代技术栈一致
4. **FoJin 参考**：借鉴成熟项目的测试方案

## 测试策略

```
┌─────────────────────────────────────────┐
│           测试金字塔                     │
├─────────────────────────────────────────┤
│  ▲ E2E 测试 (Playwright)               │
│   │  用户流程、关键路径                  │
│   │                                     │
│  ▲ 集成测试 (Vitest)                   │
│   │  组件交互、API 调用                  │
│   │                                     │
│  ▲ 单元测试 (Vitest)                   │
│      工具函数、Store、纯逻辑             │
└─────────────────────────────────────────┘
```

## 测试配置

### Vitest 配置
- 环境：`jsdom`
- 覆盖率：`v8` provider
- 设置文件：`src/test/setup.ts`

### Playwright 配置
- 测试目录：`./e2e`
- 浏览器：Chromium、Firefox、WebKit
- 移动视口：Pixel 5、iPhone 12

## 测试命令

```bash
# 单元测试
npm run test              # 运行测试
npm run test:watch        # 监听模式
npm run test:coverage     # 覆盖率报告

# E2E 测试
npm run test:e2e          # 运行 E2E
npm run test:e2e:ui       # UI 模式
npm run test:e2e:report   # 查看报告
```

## 测试文件结构

```
src/
├── components/__tests__/     # 组件测试
├── lib/__tests__/            # 工具函数测试
├── stores/__tests__/         # 状态管理测试
e2e/
├── homepage.spec.ts          # 首页 E2E
├── auth.spec.ts              # 认证流程 E2E
├── navigation.spec.ts        # 导航 E2E
└── tools.spec.ts             # 工具页面 E2E
```

## 覆盖率目标

| 类型 | 目标覆盖率 |
|------|-----------|
| 语句 | 70% |
| 分支 | 60% |
| 函数 | 70% |
| 行数 | 70% |

## 后果

**正面影响：**
- 代码质量提升
- 重构更有信心
- 文档化组件行为

**负面影响：**
- 编写测试需要时间投入
- 测试也需要维护

## 参考

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [FoJin 测试实践](../Fojin%20VS%20Wisdompace-next网站的对比分析报告.md)
