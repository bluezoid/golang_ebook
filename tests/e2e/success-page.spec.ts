import { test, expect, type Page, type Route } from '@playwright/test';

test.describe('Success Page', () => {
  function mockVerifyPayment(page: Page, response: Record<string, unknown>) {
    return page.route('/api/verify-payment', (route: Route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  test('shows verifying spinner while loading', async ({ page }) => {
    await page.route('/api/verify-payment', () => {}); // never fulfills
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');
    await expect(page.getByText(/verifying your payment/i)).toBeVisible();
  });

  test('shows success card when paid=true', async ({ page }) => {
    await mockVerifyPayment(page, { paid: true, status: 'paid', productTitle: 'Deep Dive Into Go' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');
    await expect(page.getByText(/payment successful/i)).toBeVisible();
  });

  test('redirects to product page on failed status', async ({ page }) => {
    await mockVerifyPayment(page, { paid: false, status: 'failed' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-FAILED01');
    await page.waitForURL(/\/products\/deep-dive-into-go/, { timeout: 5000 });
    expect(page.url()).toContain('/products/deep-dive-into-go');
  });

  test('redirects to product page on cancelled status', async ({ page }) => {
    await mockVerifyPayment(page, { paid: false, status: 'cancelled' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-CANCEL01');
    await page.waitForURL(/\/products\/deep-dive-into-go/, { timeout: 5000 });
    expect(page.url()).toContain('/products/deep-dive-into-go');
  });

  test('shows pending card on pending status', async ({ page }) => {
    await mockVerifyPayment(page, { paid: false, status: 'pending' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-PENDING01');
    await expect(page.getByText(/payment is processing/i)).toBeVisible();
  });

  test('shows error card on network failure', async ({ page }) => {
    await page.route('/api/verify-payment', (route) => route.abort());
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-NETERR01');
    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test('"Back to product page" link is present on success state', async ({ page }) => {
    await mockVerifyPayment(page, { paid: true, status: 'paid', productTitle: 'Deep Dive Into Go' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-OK001');
    await expect(page.getByText(/payment successful/i)).toBeVisible();
    const backLink = page.getByRole('link', { name: /back to product/i });
    await expect(backLink).toHaveAttribute('href', '/products/deep-dive-into-go');
  });
});
