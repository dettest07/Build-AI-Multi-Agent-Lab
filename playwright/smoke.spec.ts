import { test, expect } from '@playwright/test';

test('home renders nav and heading', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation');
  await expect(nav).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Guestbook is not part of v1 navigation (DECISIONS D9).
  await expect(nav.locator('a[href="/guestbook"]')).toHaveCount(0);
});

test('contact page shows a mailto link (form hidden until backend is live)', async ({ page }) => {
  await page.goto('/contact');
  await expect(page.locator('main a[href^="mailto:"]')).toBeVisible();
});
