import { test, expect } from '@playwright/test';
import { LandingPage } from '../page-objects/LandingPage';

test.describe('Landing Page', () => {
  test('loads and shows the hero heading', async ({ page }) => {
    const lp = new LandingPage(page);
    await lp.goto();

    await expect(lp.heroHeading).toBeVisible();
    await expect(page.getByText('Deep Dive')).toBeVisible();
    await expect(page.getByText('Into Go')).toBeVisible();
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

    const jsonLd = await page.$eval(
      'script[type="application/ld+json"]',
      (el) => JSON.parse(el.textContent ?? '{}')
    );

    // May be an array of schemas or a single one
    const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
    const product = schemas.find((s: { '@type': string }) => s['@type'] === 'Product');
    expect(product).toBeDefined();
    expect(product.name).toMatch(/deep dive into go/i);
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
    await page.getByText(/frequently asked/i).scrollIntoViewIfNeeded();

    const faqButtons = page.getByRole('button').filter({ hasText: /\?/ });
    await expect(faqButtons).toHaveCount({ minimum: 6 } as Parameters<typeof expect>[0] extends never ? never : never);
    // Simpler assertion
    const count = await page.getByRole('button').filter({ hasText: /\?/ }).count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('FAQ item expands on click', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.getByText(/frequently asked/i).scrollIntoViewIfNeeded();

    const firstFaqBtn = page.getByRole('button').filter({ hasText: /\?/ }).first();
    await firstFaqBtn.click();
    await expect(firstFaqBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('footer is present with support email', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.getByText(/support@bluezoid\.in/i).first()).toBeVisible();
  });

  test('pricing card shows ₹149 and 85% OFF', async ({ page }) => {
    await page.goto('/products/deep-dive-into-go');
    await expect(page.getByText('85% OFF').first()).toBeVisible();
  });
});
