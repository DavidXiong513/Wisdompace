# CI/CD 配置指南

本文档说明如何配置和启用项目的持续集成/持续部署 (CI/CD) 流程。

## 概述

项目已配置以下 GitHub Actions 工作流：

| 工作流 | 触发条件 | 功能 |
|--------|----------|------|
| `ci.yml` | push/PR 到 main/develop | 代码检查、单元测试、E2E测试、构建检查 |
| `test.yml` | 定时/手动触发 | 全量测试（多浏览器）、覆盖率上报 |
| `security.yml` | push/PR/定时 | NPM 安全审计、CodeQL 分析、依赖审查 |
| `deploy.yml` | push 到 main/手动 | 自动部署到 Vercel |
| `pr-checks.yml` | PR 事件 | PR 大小检查、覆盖率报告、构建分析 |

## 快速开始

### 1. 启用 GitHub Actions

项目已包含工作流文件，推送到 GitHub 后 Actions 会自动启用。

### 2. 配置必要的 Secrets（可选但推荐）

#### Vercel 自动部署

如需自动部署到 Vercel，需要配置以下 Secrets：

```bash
# 在 Vercel 项目中获取
# 1. 安装 Vercel CLI: npm i -g vercel
# 2. 登录: vercel login
# 3. 链接项目: vercel link
# 4. 获取信息: vercel project ls

VERCEL_TOKEN          # Vercel 个人访问令牌
VERCEL_ORG_ID         # Vercel 组织 ID
VERCEL_PROJECT_ID     # Vercel 项目 ID
```

在 GitHub 仓库设置中添加 Secrets：
- Settings → Secrets and variables → Actions → New repository secret

#### Codecov 覆盖率上报（可选）

```bash
CODECOV_TOKEN         # Codecov 项目令牌
```

## 工作流详解

### CI 工作流 (ci.yml)

**触发条件:**
- push 到 main/develop 分支
- PR 到 main/develop 分支

**任务:**
1. **Lint & Type Check** - ESLint 代码检查 + TypeScript 类型检查
2. **Unit Tests** - Vitest 单元测试，生成覆盖率报告
3. **E2E Tests** - Playwright 端到端测试（Chromium）
4. **Build Check** - Next.js 生产构建验证

**缓存优化:**
- npm 依赖缓存
- Next.js 构建缓存
- Vitest 缓存

### 测试工作流 (test.yml)

**触发条件:**
- 手动触发 (workflow_dispatch)
- 每日凌晨 2 点自动运行 (cron)

**任务:**
1. **Unit Tests with Coverage** - 全量单元测试，上报 Codecov
2. **E2E Tests (Full Browser Matrix)** - 多浏览器测试
   - Chromium
   - Firefox
   - WebKit (Safari)

### 安全工作流 (security.yml)

**触发条件:**
- push/PR 到 main/develop
- 每周日凌晨 3 点自动运行

**任务:**
1. **NPM Audit** - 检测依赖漏洞
2. **CodeQL Analysis** - GitHub 代码安全分析
3. **Dependency Review** - PR 依赖变更审查

### 部署工作流 (deploy.yml)

**触发条件:**
- push 到 main 分支（自动部署生产环境）
- 手动触发可选择环境

**环境:**
- **Production** - 生产环境 (`--prod`)
- **Preview** - 预览环境

### PR 检查工作流 (pr-checks.yml)

**触发条件:**
- PR 创建、更新、重新打开

**任务:**
1. **PR Size Check** - 检查 PR 大小，过大时警告
2. **Lock File Check** - 检测 lock 文件变更
3. **Lint & Type Check** - 代码质量和类型检查
4. **Coverage Report** - 覆盖率报告并评论到 PR
5. **Bundle Size Check** - 构建产物大小分析

## 本地验证

在提交前，建议本地运行以下命令验证：

```bash
# 代码检查
npm run lint

# 类型检查
npx tsc --noEmit

# 单元测试
npm test

# E2E 测试（需要构建）
npm run build
npm run test:e2e

# 完整验证（构建）
npm run build
```

## 故障排除

### 工作流运行失败

1. **检查 Actions 日志**
   - 在 GitHub 仓库 → Actions 中查看详细日志

2. **常见失败原因**
   - ESLint 错误: 运行 `npm run lint:fix` 自动修复
   - TypeScript 类型错误: 运行 `npx tsc --noEmit` 检查
   - 测试失败: 检查测试代码和组件实现
   - Playwright 超时: 检查选择器是否正确

3. **缓存问题**
   - 如需清除缓存，可在 Actions 页面手动重运行并选择 "Disable cache"

### Secrets 配置问题

如果部署失败，检查：
- Secrets 名称是否正确（区分大小写）
- VERCEL_TOKEN 是否有足够权限
- 项目 ID 和 Org ID 是否正确

## 进阶配置

### 添加环境变量

如需在 CI 中使用环境变量：

1. 在 GitHub Secrets 中添加
2. 在工作流中引用：

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}
```

### 自定义 Node.js 版本

修改 `node-version`：

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # 或 '18', 'lts/*'
```

### 添加通知

在工作流末尾添加通知步骤：

```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.issues.createComment({
        issue_number: context.issue.number,
        owner: context.repo.owner,
        repo: context.repo.repo,
        body: '❌ CI 构建失败，请检查日志'
      })
```

## 参考资源

- [GitHub Actions 文档](https://docs.github.com/actions)
- [Vercel GitHub Integration](https://vercel.com/docs/concepts/git/vercel-for-github)
- [Playwright CI 配置](https://playwright.dev/docs/ci)
- [Vitest 配置](https://vitest.dev/guide/)
