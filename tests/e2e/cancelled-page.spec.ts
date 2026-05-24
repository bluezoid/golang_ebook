import { test, expect } from '@playwright/test';

test.describe('Cancelled Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products/deep-dive-into-go/cancelled');
  });

  test('shows Payment Cancelled heading', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /payment cancelled/i })).toBeVisible();
  });

  test('assures user no charge was made', async ({ page }) => {
    await expect(page.getByText(/no charge was made/i)).toBeVisible();
  });

  test('"Back to page" link navigates to product page', async ({ page }) => {
    const link = page.getByRole('link', { name: /back to page/i });
    await expect(link).toHaveAttribute('href', '/products/deep-dive-into-go');
  });

  test('"Try again" link points to pricing section', async ({ page }) => {
    const link = page.getByRole('link', { name: /try again/i });
    await expect(link).toHaveAttribute('href', '/products/deep-dive-into-go#pricing');
  });

  test('support email link is present', async ({ page }) => {
    const emailLink = page.getByRole('link', { name: /support@bluezoid\.in/i });
    await expect(emailLink).toHaveAttribute('href', 'mailto:support@bluezoid.in');
  });

  test('page renders without 500 error', async ({ page }) => {
    await expect(page.getByText(/payment cancelled/i)).toBeVisible();
  });
});
