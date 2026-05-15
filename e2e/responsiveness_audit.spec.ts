import { test } from '@playwright/test';

const resolutions = [
  { width: 1024, height: 768, label: '1024x768' },
  { width: 1440, height: 900, label: '1440x900' },
  { width: 1920, height: 1080, label: '1920x1080' },
];

const pages = [
  { url: '/', name: 'home' },
  { url: '/chapter/read-instructions', name: 'instructions' },
  { url: '/about-simon', name: 'about' },
];

for (const res of resolutions) {
  for (const p of pages) {
    test(`screenshot ${p.name} at ${res.label}`, async ({ page }) => {
      await page.setViewportSize({ width: res.width, height: res.height });
      await page.goto(`http://localhost:3000${p.url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `audit_${p.name}_${res.label}.png`, fullPage: true });
    });
  }
}
