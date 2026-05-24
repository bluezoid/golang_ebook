import { type Page, type Locator } from '@playwright/test';

export class PurchaseModalPO {
  readonly page: Page;
  readonly dialog: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly closeButton: Locator;
  readonly errorBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.firstNameInput = page.getByLabel(/first name/i);
    this.lastNameInput = page.getByLabel(/last name/i);
    this.emailInput = page.getByLabel(/email address/i);
    this.submitButton = page.getByRole('button', { name: /buy now/i });
    this.closeButton = page.getByRole('button', { name: /close/i });
    this.errorBox = page.locator('text=Failed to').first();
  }

  async fillForm(data: { firstName: string; lastName: string; email: string; phone?: string }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
  }

  async submit() {
    await this.submitButton.click();
  }

  async close() {
    await this.closeButton.click();
  }

  async isVisible() {
    return this.dialog.isVisible();
  }
}
