import type { Locator, Page } from '@playwright/test';
import { clickAndFollow } from '../utils/navigation';
import { scrollToBottom } from '../utils/scroll';
import { BasePage } from './BasePage';
import { PRODUCT_URL, ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  readonly productCards: Locator;
  readonly productLinks: Locator;

  constructor(page: Page) {
    super(page);
    this.productCards = page.locator('div[data-asin]:not([data-asin=""])');
    this.productLinks = page.locator('a.a-link-normal[href*="/dp/"]');
  }

  async goto(): Promise<void> {
    await this.open('/');
  }

  /** Scrolls the home feed to the end and opens the last product card. */
  async openLastProduct(): Promise<ProductPage> {
    await scrollToBottom(this.page);
    const hasCards = (await this.productCards.count()) > 0;
    const link = hasCards
      ? this.productCards.last().locator('a[href*="/dp/"]').first()
      : this.productLinks.last();
    await link.scrollIntoViewIfNeeded();
    const productPage = new ProductPage(await clickAndFollow(this.page, link, PRODUCT_URL));
    await productPage.waitUntilReady();
    return productPage;
  }
}
