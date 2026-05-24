import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/LandingPage';

test.describe('Landing Page', () => {
  test('loads and shows the hero heading', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();

    await expect(lp.heroHeading).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Deep Dive');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Into Go');
  });

  test('page title contains the book name', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await expect(page).toHaveTitle(/deep dive into go/i);
  });

  test('book cover image loads without error', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();

    await expect(lp.coverImage).toBeVisible();
    // Verify the image actually loaded (naturalWidth > 0)
    const naturalWidth = await lp.coverImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('Buy Now button is visible and clickable', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await expect(lp.buyNowButton).toBeVisible();
    await expect(lp.buyNowButton).toBeEnabled();
  });

  test('Preview Book button is visible', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();
    await expect(lp.previewBookButton).toBeVisible();
  });

  test('JSON-LD Product structured data is present in head', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.waitForLoadState('domcontentloaded');

    // Next.js <Script> with dangerouslySetInnerHTML is injected after hydration.
    // Poll until the element appears (up to 10s).
    const scriptContent = await page.waitForFunction(() => {
      const byType = document.querySelector('script[type="application/ld+json"]');
      const byId = document.querySelector('#json-ld-deep-dive-go');
      const el = byType ?? byId;
      return el ? el.textContent : null;
    }, undefined, { timeout: 10000 })
      .then((handle) => handle.jsonValue() as Promise<string | null>)
      .catch(() => null as null);

    expect(scriptContent).not.toBeNull();
    const jsonLd = JSON.parse(scriptContent ?? '{}');
    // Schema uses @graph — flatten to find Product
    const graph: { '@type': string; name?: string }[] = jsonLd['@graph'] ?? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
    const product = graph.find((s) => s['@type'] === 'Product');
    expect(product).toBeDefined();
    expect(product!.name).toMatch(/deep dive into go/i);
  });

  test('OG meta tags are present', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');

    const ogTitle = await page.$eval(
      'meta[property="og:title"]',
      (el) => el.getAttribute('content')
    );
    expect(ogTitle).toMatch(/deep dive into go/i);
  });

  test('canonical link tag is present', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');

    const canonical = await page.$eval(
      'link[rel="canonical"]',
      (el) => el.getAttribute('href')
    );
    expect(canonical).toContain('/products/deep-dive-into-go');
  });

  test('FAQ section renders at least 6 questions', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.getByText(/common.*questions/i).first().scrollIntoViewIfNeeded();

    const count = await page.getByRole('button').filter({ hasText: /\?/ }).count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('FAQ item expands on click', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.getByText(/common.*questions/i).first().scrollIntoViewIfNeeded();

    const firstFaqBtn = page.getByRole('button').filter({ hasText: /\?/ }).first();
    await firstFaqBtn.click();
    await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('footer is present with support email', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByText(/support@bluezoid\.in/i).first()).toBeVisible();
  });

  test('pricing card shows current price and discount badge', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    // Price comes from API — just verify a discount badge and ₹ symbol are present
    await expect(page.getByText(/% OFF/i).first()).toBeVisible();
    await expect(page.getByText(/₹/).first()).toBeVisible();
  });
});
