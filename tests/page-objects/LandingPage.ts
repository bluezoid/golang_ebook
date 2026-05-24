import { type Page, type Locator } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly buyNowButton: Locator;
  readonly previewBookButton: Locator;
  readonly coverImage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.buyNowButton = page.getByRole('button', { name: /buy now/i }).first();
    this.previewBookButton = page.getByRole('button', { name: /preview book/i }).first();
    this.coverImage = page.getByAltText('Deep Dive Into Go — book cover').first();
  }

  async goto() {
    await this.page.goto('/products/deep-dive-into-go');
  }

  async openPurchaseModal() {
    await this.buyNowButton.click();
  }

  async clickPreviewBook() {
    await this.previewBookButton.click();
  }
}
