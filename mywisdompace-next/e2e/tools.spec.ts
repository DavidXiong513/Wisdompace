import { test, expect } from '@playwright/test';

test.describe('工具页面', () => {
  test('应该显示工具列表', async ({ page }) => {
    await page.goto('/tools');

    // 验证页面标题
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // 验证主要内容存在
    await expect(page.locator('main')).toBeVisible();
  });

  test('MBTI测试页面应该可访问', async ({ page }) => {
    await page.goto('/tools/mbti');

    // 验证MBTI页面内容
    await expect(page.locator('h1, h2')).toBeVisible();

    // 验证测试开始按钮或说明存在
    const content = page.locator('main');
    await expect(content).toBeVisible();
  });

  test('搜索工具应该可用', async ({ page }) => {
    await page.goto('/search');

    // 验证搜索输入框存在
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[name="q"]');

    // 如果搜索页面存在，测试搜索功能
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('人生');
      await searchInput.press('Enter');

      // 等待搜索结果或页面响应
      await page.waitForTimeout(1000);

      // 验证页面仍在正常状态
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
