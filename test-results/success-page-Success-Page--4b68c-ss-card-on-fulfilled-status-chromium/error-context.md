# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: success-page.spec.ts >> Success Page >> shows success card on fulfilled status
- Location: tests/e2e/success-page.spec.ts:23:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/payment successful/i)
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText(/payment successful/i)

```

```yaml
- main:
  - heading "Payment is processing" [level=1]
  - paragraph: Your payment is still being confirmed. If money was deducted, you will receive the eBook automatically once confirmed.
  - paragraph:
    - text: Questions?
    - link "support@bluezoid.in":
      - /url: mailto:support@bluezoid.in
    - text: "· Order: BLZ-TEST123"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Success Page', () => {
  4  |   function mockVerifyPayment(page: Parameters<typeof test>[1]['page'], response: Record<string, unknown>) {
  5  |     return page.route('/api/verify-payment', (route) => {
  6  |       route.fulfill({
  7  |         status: 200,
  8  |         contentType: 'application/json',
  9  |         body: JSON.stringify(response),
  10 |       });
  11 |     });
  12 |   }
  13 | 
  14 |   test('shows verifying spinner while loading', async ({ page }) => {
  15 |     // Route that never responds — simulate loading
  16 |     await page.route('/api/verify-payment', () => {}); // never fulfills
  17 | 
  18 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');
  19 | 
  20 |     await expect(page.getByText(/verifying your payment/i)).toBeVisible();
  21 |   });
  22 | 
  23 |   test('shows success card on fulfilled status', async ({ page }) => {
  24 |     await mockVerifyPayment(page, { status: 'fulfilled', email: 'customer@gmail.com' });
  25 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-TEST123');
  26 | 
> 27 |     await expect(page.getByText(/payment successful/i)).toBeVisible();
     |                                                         ^ Error: expect(locator).toBeVisible() failed
  28 |     await expect(page.getByText(/customer@gmail\.com/i)).toBeVisible();
  29 |   });
  30 | 
  31 |   test('shows already_fulfilled message', async ({ page }) => {
  32 |     await mockVerifyPayment(page, { status: 'already_fulfilled' });
  33 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-ALREADY01');
  34 | 
  35 |     await expect(page.getByText(/already processed/i)).toBeVisible();
  36 |   });
  37 | 
  38 |   test('redirects to cancelled page on failed status', async ({ page }) => {
  39 |     await mockVerifyPayment(page, { status: 'failed' });
  40 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-FAILED01');
  41 | 
  42 |     await page.waitForURL(/\/cancelled/, { timeout: 5000 });
  43 |     expect(page.url()).toContain('/cancelled');
  44 |   });
  45 | 
  46 |   test('shows pending card on pending status', async ({ page }) => {
  47 |     await mockVerifyPayment(page, { status: 'pending' });
  48 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-PENDING01');
  49 | 
  50 |     await expect(page.getByText(/payment is processing/i)).toBeVisible();
  51 |   });
  52 | 
  53 |   test('shows error card on network failure', async ({ page }) => {
  54 |     await page.route('/api/verify-payment', (route) => route.abort());
  55 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-NETERR01');
  56 | 
  57 |     await expect(page.getByText(/something went wrong/i)).toBeVisible();
  58 |   });
  59 | 
  60 |   test('"Back to product page" link works', async ({ page }) => {
  61 |     await mockVerifyPayment(page, { status: 'fulfilled', email: 'x@gmail.com' });
  62 |     await page.goto('/products/deep-dive-into-go/success?order_id=BLZ-OK001');
  63 | 
  64 |     await expect(page.getByText(/payment successful/i)).toBeVisible();
  65 | 
  66 |     const backLink = page.getByRole('link', { name: /back to product/i });
  67 |     await expect(backLink).toHaveAttribute('href', '/products/deep-dive-into-go');
  68 |   });
  69 | });
  70 | 
```