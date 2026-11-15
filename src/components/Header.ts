import { expect, type Locator, type Page } from '@playwright/test';

/** Global navigation bar, present on every Amazon page (component object). */
export class Header {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly accountLink: Locator;
  readonly accountGreeting: Locator;
  readonly locationLink: Locator;

  constructor(page: Page) {
    this.searchInput = page.locator('#twotabsearchtextbox');
    this.searchButton = page.locator('#nav-search-submit-button');
    this.cartLink = page.locator('#nav-cart');
    this.cartBadge = page.locator('#nav-cart-count');
    this.accountLink = page.locator('#nav-link-accountList');
    this.accountGreeting = page.locator('#nav-link-accountList-nav-line-1');
    this.locationLink = page.locator('#nav-global-location-popover-link');
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }

  async cartCount(): Promise<number> {
    await expect(this.cartBadge).toBeVisible();
    return Number.parseInt((await this.cartBadge.innerText()).trim(), 10) || 0;
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async isSignedIn(): Promise<boolean> {
    await expect(this.accountGreeting).toHaveText(/\S/);
    return !/sign in/i.test(await this.accountGreeting.innerText());
  }
}
