import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model — pages publiques site-v2
 * Fournit des helpers réutilisables pour tous les tests E2E.
 */
export class SitePage {
  readonly page: Page;
  readonly nav: Locator;
  readonly logo: Locator;
  readonly footer: Locator;
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.getByRole("navigation", { name: "Navigation principale" });
    this.logo = page.getByRole("link", { name: /CoworKing Café/i }).first();
    this.footer = page.locator("footer");
    this.mainContent = page.locator("#main-content");
  }

  async goto(path = "/") {
    await this.page.goto(path);
  }

  async expectNoConsoleErrors() {
    const errors: string[] = [];
    this.page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    return errors;
  }

  async expectPageLoaded() {
    await expect(this.nav).toBeVisible();
    await expect(this.footer).toBeVisible();
    await expect(this.mainContent).toBeVisible();
  }

  async expectH1(text: string | RegExp) {
    await expect(
      this.page.getByRole("heading", { level: 1 })
    ).toContainText(text);
  }

  async clickBooking() {
    await this.page.getByRole("link", { name: /Réserver/i }).first().click();
  }

  async openMobileMenu() {
    await this.page.getByRole("button", { name: /Ouvrir le menu/i }).click();
  }
}
