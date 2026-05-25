import { test, expect } from '@playwright/test';

const LEGAL_PAGES = [
  {
    path: '/privacy',
    heading: /privacy policy/i,
    keywords: [/information we collect/i, /support@bluezoid\.in/i],
  },
  {
    path: '/terms',
    heading: /terms of service/i,
    keywords: [/license/i, /support@bluezoid\.in/i],
  },
  {
    path: '/refund',
    heading: /refund.*cancellation/i,
    keywords: [/eligible refund/i, /support@bluezoid\.in/i],
  },
];

for (const lp of LEGAL_PAGES) {
  test.describe(`Legal page: ${lp.path}`, () => {
    test('loads with 200 and correct heading', async ({ page }) => {
      const response = await page.goto(lp.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(lp.heading);
    });

    test('shows expected content sections', async ({ page }) => {
      await page.goto(lp.path);
      for (const keyword of lp.keywords) {
        await expect(page.getByText(keyword).first()).toBeVisible();
      }
    });

    test('"Back to product" link navigates to product page', async ({ page }) => {
      await page.goto(lp.path);
      await page.getByRole('link', { name: /back to product/i }).click();
      await expect(page).toHaveURL(/\/products\/deep-dive-into-go/);
    });

    test('has correct page title', async ({ page }) => {
      await page.goto(lp.path);
      await expect(page).toHaveTitle(/bluezoid/i);
    });
  });
}
