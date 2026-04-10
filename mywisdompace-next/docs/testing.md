# 测试指南

本文档介绍 Wisdompace-next 项目的测试配置和使用方法。

## 测试概览

本项目使用以下测试框架：

- **Vitest** - 单元测试和集成测试
- **Playwright** - E2E 端到端测试
- **React Testing Library** - React 组件测试

## 目录结构

```
mywisdompace-next/
├── src/
│   ├── lib/__tests__/         # 工具函数单元测试
│   ├── components/__tests__/  # 组件单元测试
│   ├── stores/__tests__/      # 状态管理单元测试
│   └── test/
│       └── setup.ts           # 测试环境配置
├── e2e/                       # E2E 测试文件
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   ├── auth.spec.ts
│   └── tools.spec.ts
├── vitest.config.ts           # Vitest 配置
└── playwright.config.ts       # Playwright 配置
```

## 单元测试 (Vitest)

### 运行测试

```bash
# 运行所有单元测试
npm test

# 监听模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# UI 模式
npm run test:ui
```

### 编写单元测试

测试文件应该放在被测试模块的 `__tests__` 目录下，命名为 `<module>.test.ts`。

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myModule';

describe('myFunction', () => {
  it('应该正确执行功能', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### 组件测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('应该渲染标题', () => {
    render(<MyComponent title="测试标题" />);
    expect(screen.getByText('测试标题')).toBeInTheDocument();
  });
});
```

## E2E 测试 (Playwright)

### 运行 E2E 测试

```bash
# 运行所有 E2E 测试
npm run test:e2e

# UI 模式（带调试界面）
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

### 编写 E2E 测试

E2E 测试文件放在 `e2e/` 目录下，以 `.spec.ts` 结尾。

```typescript
import { test, expect } from '@playwright/test';

test.describe('首页', () => {
  test('应该显示网站标题', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Wisdompace/i);
  });
});
```

### 支持的浏览器

- Chromium (Chrome)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

## CI/CD 集成

### GitHub Actions 工作流

项目配置了以下 CI 工作流：

1. **CI** (`.github/workflows/ci.yml`)
   - 在每次 push 和 PR 时触发
   - 运行 Lint、单元测试、E2E 测试、构建检查

2. **Test** (`.github/workflows/test.yml`)
   - 每日定时运行
   - 完整浏览器矩阵测试
   - 覆盖率报告上传到 Codecov

### 本地 CI 测试

在提交前，可以在本地模拟 CI 环境：

```bash
# 完整检查
npm run lint && npm test && npm run build

# E2E 测试（需要先构建）
npm run build
npm run test:e2e
```

## 测试数据与 Mock

### Mock 数据

测试使用到的 mock 数据应该放在测试文件附近：

```typescript
// src/lib/__tests__/scoring.test.ts
const testScoringRules: ScoringRule[] = [
  { id: 1, optionA: 'E', optionB: 'I' },
  // ...
];
```

### 全局 Mock

在 `src/test/setup.ts` 中配置了以下全局 mock：

- Next.js router (`useRouter`, `usePathname`)
- `window.matchMedia`
- `IntersectionObserver`
- `localStorage`

## 最佳实践

1. **测试命名**: 使用描述性名称，说明被测试的功能和行为
   ```typescript
   it('应该正确计算 MBTI 维度分数', () => {...});
   it('应该在用户未登录时显示登录按钮', () => {...});
   ```

2. **测试隔离**: 每个测试应该独立，不依赖其他测试的状态
   ```typescript
   beforeEach(() => {
     // 重置状态
   });
   ```

3. **优先使用用户视角的查询**
   ```typescript
   // ✅ 推荐
   screen.getByRole('button', { name: '提交' });
   screen.getByLabelText('邮箱地址');

   // ❌ 避免
   screen.getByTestId('submit-button');
   document.querySelector('.button');
   ```

4. **覆盖率目标**
   - 单元测试：核心逻辑 80%+
   - 组件测试：关键用户流程
   - E2E 测试：关键用户场景

## 故障排除

### 常见问题

**Q: 测试时出现 "window is not defined" 错误**
A: 确保测试文件顶部有正确的环境注释，或在 `setup.ts` 中提供 mock。

**Q: Playwright 测试超时**
A: 增加 `timeout` 配置或检查应用是否正确启动。

**Q: 测试覆盖率不准确**
A: 检查 `vitest.config.ts` 中的 `coverage` 配置，确保包含正确的文件。

## 相关链接

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
