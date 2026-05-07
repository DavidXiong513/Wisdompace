import { test, expect } from '@playwright/test';

test.describe('首页', () => {
  test('应该显示网站标题和主要内容', async ({ page }) => {
    await page.goto('/');

    // 检查页面标题
    await expect(page).toHaveTitle(/一生的整理|Wisdompace/i);

    // 检查主要内容区域存在
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('应该可以访问导航栏', async ({ page }) => {
    await page.goto('/');

    // 检查导航栏存在
    const nav = page.locator('header nav');
    await expect(nav).toBeVisible();

    // 检查登录/注册链接（未登录状态）
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toContainText('登录 / 注册');
  });

  test('应该在移动端正确显示', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // 页面应该正常加载
    await expect(page.locator('main')).toBeVisible();

    // 导航栏应该可见
    await expect(page.locator('header')).toBeVisible();
  });
});
