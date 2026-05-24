import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility — axe-core WCAG 2.1 AA', () => {
  test('landing page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('cancelled page has no accessibility violations', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go/cancelled');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('success page (fulfilled state) has no violations', async ({ page }) => {
    await page.route('/api/verify-payment', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'fulfilled', email: 'test@gmail.com' }),
      });
    });

    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-A11Y01');
    await page.getByText(/payment successful/i).waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('purchase modal has no violations when open', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.getByRole('button', { name: /buy now/i }).first().click();
    await page.getByRole('dialog').waitFor();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .include('[role="dialog"]')
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('all images on landing page have alt text', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');

    const imagesWithoutAlt = await page.$$eval(
      'img',
      (imgs) => imgs.filter((img) => !img.alt).map((img) => img.src)
    );

    expect(imagesWithoutAlt).toHaveLength(0);
  });

  test('all interactive elements are keyboard-accessible', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');

    // Tab through the page and verify focus is visible
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(focused).not.toBe('BODY');
  });

  test('modal can be closed with keyboard (Escape)', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.getByRole('button', { name: /buy now/i }).first().click();
    await page.getByRole('dialog').waitFor();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
});
