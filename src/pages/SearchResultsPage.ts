import { expect, type Locator, type Page } from '@playwright/test';
import { clickAndFollow, clickAndWaitForUrlChange } from '../utils/navigation';
import { parsePrice } from '../utils/price';
import { scrollToBottom } from '../utils/scroll';
import { BasePage } from './BasePage';
import { PRODUCT_URL, ProductPage } from './ProductPage';

export type SortParam = 'price-asc-rank' | 'price-desc-rank';

export class SearchResultsPage extends BasePage {
  readonly results: Locator;
  /** Results that are not ads: sponsored items break price-order assertions. */
  readonly organicResults: Locator;

  constructor(page: Page) {
    super(page);
    this.results = page.locator('[data-component-type="s-search-result"]');
    this.organicResults = this.results
      .filter({ hasNot: page.locator('.puis-sponsored-label-text, .AdHolder, [data-component-type="sp-sponsored-result"]') })
      .filter({ hasNotText: /\bSponsored\b/ });
  }

  async search(term: string): Promise<void> {
    await this.header.search(term);
    await this.waitForResults();
  }

  async waitForResults(): Promise<void> {
    await expect(this.results.first()).toBeVisible({ timeout: 30_000 });
  }

  async filterByBrand(brand: string): Promise<void> {
    const option = this.page.locator('#s-refinements').getByText(brand, { exact: true }).first();
    await option.scrollIntoViewIfNeeded();
    await clickAndWaitForUrlChange(this.page, option);
    await this.waitForResults();
  }

  /**
   * Amazon's custom sort dropdown is racy (the popover often is not open when we look for the option),
   * so sorting uses its canonical URL parameter. Filters are kept because they live in the same URL.
   */
  async sortBy(param: SortParam): Promise<void> {
    const url = new URL(this.page.url());
    url.searchParams.set('s', param);
    await this.page.goto(url.toString(), { waitUntil: 'commit' });
    await this.waitForResults();
  }

  async loadMore(): Promise<void> {
    await scrollToBottom(this.page);
  }

  /** One browser round-trip (evaluateAll) instead of one per result. */
  async organicTitles(limit = 10): Promise<string[]> {
    const raw = await this.organicResults.evaluateAll((els) =>
      els.map((el) => el.querySelector('h2')?.textContent?.trim() ?? ''),
    );
    return raw.filter(Boolean).slice(0, limit);
  }

  async organicPrices(limit = 20): Promise<number[]> {
    const raw = await this.organicResults.evaluateAll((els) =>
      els.map((el) => el.querySelector('.a-price-whole')?.textContent ?? ''),
    );
    return raw
      .map(parsePrice)
      .filter((price): price is number => price !== null)
      .slice(0, limit);
  }

  /** Opens the first organic result in whichever tab Amazon uses and returns its page object. */
  async openFirstResult(): Promise<ProductPage> {
    const link = this.organicResults.first().locator('h2 a, a.a-link-normal').first();
    const productPage = new ProductPage(await clickAndFollow(this.page, link, PRODUCT_URL));
    await productPage.waitUntilReady();
    return productPage;
  }
}
