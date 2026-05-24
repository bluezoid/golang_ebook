import { test, expect } from '@playwright/test';

test.describe('Success Page', () => {
  function mockVerifyPayment(page: Parameters<typeof test>[1]['page'], response: Record<string, unknown>) {
    return page.route('/api/verify-payment', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });
  }

  test('shows verifying spinner while loading', async ({ page }) => {
    // Route that never responds — simulate loading
    await page.route('/api/verify-payment', () => {}); // never fulfills

    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');

    await expect(page.getByText(/verifying your payment/i)).toBeVisible();
  });

  test('shows success card on fulfilled status', async ({ page }) => {
    await mockVerifyPayment(page, { status: 'fulfilled', email: 'customer@gmail.com' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');

    await expect(page.getByText(/payment successful/i)).toBeVisible();
    await expect(page.getByText(/customer@gmail\.com/i)).toBeVisible();
  });

  test('shows already_fulfilled message', async ({ page }) => {
    await mockVerifyPayment(page, { status: 'already_fulfilled' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-ALREADY01');

    await expect(page.getByText(/already processed/i)).toBeVisible();
  });

  test('redirects to cancelled page on failed status', async ({ page }) => {
    await mockVerifyPayment(page, { status: 'failed' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-FAILED01');

    await page.waitForURL(/\/cancelled/, { timeout: 5000 });
    expect(page.url()).toContain('/cancelled');
  });

  test('shows pending card on pending status', async ({ page }) => {
    await mockVerifyPayment(page, { status: 'pending' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-PENDING01');

    await expect(page.getByText(/payment is processing/i)).toBeVisible();
  });

  test('shows error card on network failure', async ({ page }) => {
    await page.route('/api/verify-payment', (route) => route.abort());
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-NETERR01');

    await expect(page.getByText(/something went wrong/i)).toBeVisible();
  });

  test('"Back to product page" link works', async ({ page }) => {
    await mockVerifyPayment(page, { status: 'fulfilled', email: 'x@gmail.com' });
    await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-OK001');

    await expect(page.getByText(/payment successful/i)).toBeVisible();

    const backLink = page.getByRole('link', { name: /back to product/i });
    await expect(backLink).toHaveAttribute('href', '/products/deep-dive-into-go');
  });
});
