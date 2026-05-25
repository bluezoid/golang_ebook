import { test, expect } from '@playwright/test';

test.describe('Middleware redirects', () => {
  test('/ redirects to the product page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/products\/deep-dive-into-go/);
  });

  test('/about redirects to the product page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/products\/deep-dive-into-go/);
  });

  test('/some/random/path redirects to the product page', async ({ page }) => {
    await page.goto('/some/random/path');
    await expect(page).toHaveURL(/\/products\/deep-dive-into-go/);
  });

  test('/products/deep-dive-into-go is NOT redirected', async ({ page }) => {
    const response = await page.goto('/products/deep-dive-into-go');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/products/deep-dive-into-go');
  });

  test('/products/deep-dive-into-go/success is NOT redirected', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go/success?order_id=TEST');
    // Should land on the success page, not redirect
    await expect(page).toHaveURL(/\/success/);
  });

  test('/products/deep-dive-into-go/cancelled is NOT redirected', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go/cancelled');
    await expect(page).toHaveURL(/\/cancelled/);
    await expect(page.getByText(/payment cancelled/i)).toBeVisible();
  });

  test('/privacy is NOT redirected', async ({ page }) => {
    const response = await page.goto('/privacy');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/privacy');
  });

  test('/terms is NOT redirected', async ({ page }) => {
    const response = await page.goto('/terms');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/terms');
  });

  test('/refund is NOT redirected', async ({ page }) => {
    const response = await page.goto('/refund');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveURL('/refund');
  });

  test('/sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

  test('/robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });
});
