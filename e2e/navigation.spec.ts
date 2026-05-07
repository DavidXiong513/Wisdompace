import { test, expect } from '@playwright/test';

test.describe('导航功能', () => {
  test('应该能从首页导航到搜索页面', async ({ page }) => {
    await page.goto('/');

    // 点击搜索链接
    await page.click('a[href="/search"]');

    // 验证页面跳转
    await expect(page).toHaveURL(/.*search/);

    // 验证搜索页面内容
    await expect(page.locator('h1, h2')).toContainText(/搜索|Search/i);
  });

  test('应该能从首页导航到章节页面', async ({ page }) => {
    await page.goto('/');

    // 点击章节链接
    await page.click('a[href^="/chapter"]');

    // 验证页面跳转
    await expect(page).toHaveURL(/.*chapter/);
  });

  test('应该能导航到工具页面', async ({ page }) => {
    await page.goto('/');

    // 点击工具链接
    await page.click('a[href="/tools"]');

    // 验证页面跳转
    await expect(page).toHaveURL(/.*tools/);

    // 验证页面标题
    await expect(page.locator('h1')).toBeVisible();
  });

  test('404页面应该正确显示', async ({ page }) => {
    await page.goto('/non-existent-page');

    // 验证返回首页链接存在
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });
});
