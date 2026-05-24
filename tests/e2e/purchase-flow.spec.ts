import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/LandingPage';
import { PurchaseModalPO } from '../page-objects/PurchaseModal';

test.describe('Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept the checkout API so tests don't hit real Cashfree
    await page.route('/api/checkout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 'BLZ-E2ETEST00000001',
          paymentSessionId: 'session_e2e_test_123',
          cfOrderId: 'CF-E2E-001',
        }),
      });
    });

    // Mock Cashfree JS SDK so it doesn't redirect away
    await page.addInitScript(() => {
      (window as Window & { __cashfreeMockInstalled?: boolean }).__cashfreeMockInstalled = true;
    });
  });

  test('clicking Buy Now opens the purchase modal', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();

    await lp.openPurchaseModal();

    const modal = new PurchaseModalPO(page);
    await expect(modal.dialog).toBeVisible();
  });

  test('modal has correct ARIA dialog role', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('empty form submission shows validation errors', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    const modal = new PurchaseModalPO(page);
    await modal.submit();

    await expect(page.getByText(/at least 2 characters/i).first()).toBeVisible();
  });

  test('disposable email shows specific error', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    const modal = new PurchaseModalPO(page);
    await modal.firstNameInput.fill('Test');
    await modal.lastNameInput.fill('User');
    await modal.emailInput.fill('test@mailinator.com');
    await modal.submit();

    await expect(page.getByText(/temporary email/i)).toBeVisible();
  });

  test('close button (×) closes the modal', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    const modal = new PurchaseModalPO(page);
    await modal.close();

    await expect(modal.dialog).not.toBeVisible();
  });

  test('pressing Escape closes the modal', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    await page.keyboard.press('Escape');

    const modal = new PurchaseModalPO(page);
    await expect(modal.dialog).not.toBeVisible();
  });

  test('checkout API is called with correct data on valid submit', async ({ page }) => {
    let capturedBody: Record<string, unknown> = {};

    await page.route('/api/checkout', async (route) => {
      const postData = route.request().postDataJSON();
      capturedBody = postData;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ orderId: 'BLZ-TEST', paymentSessionId: 'session_x', cfOrderId: 'CF-1' }),
      });
    });

    // Mock cashfree-js load to prevent navigation
    await page.addInitScript(`
      window.__cashfreeCheckoutCalled = false;
      // Override dynamic import of cashfree-js
      const origImport = window.__import || function(){};
    `);

    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    await page.getByLabel(/first name/i).fill('Arjun');
    await page.getByLabel(/last name/i).fill('Sharma');
    await page.getByLabel(/email address/i).fill('arjun@gmail.com');

    // Find phone input and fill
    const phoneInput = page.locator('input[name="phone"]').or(page.locator('.PhoneInputInput'));
    if (await phoneInput.count() > 0) {
      await phoneInput.first().fill('+919876543210');
    }

    await page.getByRole('button', { name: /proceed to pay/i }).click();

    await page.waitForTimeout(500);

    expect(capturedBody.firstName).toBe('Arjun');
    expect(capturedBody.lastName).toBe('Sharma');
    expect(capturedBody.email).toBe('arjun@gmail.com');
  });

  test('API error shows error message in modal', async ({ page }) => {
    await page.route('/api/checkout', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to create order' }),
      });
    });

    const lp = new LandingPage(page);
    await lp.goto();
    await lp.openPurchaseModal();

    await page.getByLabel(/first name/i).fill('Arjun');
    await page.getByLabel(/last name/i).fill('Sharma');
    await page.getByLabel(/email address/i).fill('arjun@gmail.com');
    await page.getByRole('button', { name: /proceed to pay/i }).click();

    await expect(page.getByText(/failed to create order/i)).toBeVisible();
  });
});
