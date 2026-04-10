import { test, expect } from '@playwright/test';

test.describe('认证功能', () => {
  test('应该显示登录页面', async ({ page }) => {
    await page.goto('/login');

    // 验证登录表单元素存在
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();

    // 验证登录按钮存在
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  test('未登录用户应该看到登录按钮', async ({ page }) => {
    await page.goto('/');

    // 验证登录/注册链接可见
    const loginLink = page.locator('a[href="/login"]');
    await expect(loginLink).toContainText('登录 / 注册');
  });

  test('登录页面应该有注册链接', async ({ page }) => {
    await page.goto('/login');

    // 查找注册链接
    const registerLink = page.locator('a[href="/register"], a:has-text("注册")');
    await expect(registerLink).toBeVisible();
  });
});
