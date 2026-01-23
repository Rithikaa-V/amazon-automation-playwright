import { Page, expect } from '@playwright/test';

export class AmazonSearchPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  searchInput = () => this.page.locator('#twotabsearchtextbox');
  searchButton = () => this.page.locator('#nav-search-submit-button');

  searchResults = () =>
    this.page.locator('[data-component-type="s-search-result"]');

  productTitles = () =>
    this.page.locator('[data-component-type="s-search-result"] h2 span');

  productPrices = () =>
    this.page.locator(
      '[data-component-type="s-search-result"] span.a-price-whole'
    );

  brandCheckbox = (brand: string) =>
    this.page.locator(`//span[text()="${brand}"]/preceding-sibling::div//i`);

  priceRangeOption = (rangeText: string) =>
    this.page.locator(`#s-refinements a:has-text("${rangeText}")`);


  sortDropdownTrigger = () =>
    this.page.locator('#a-autoid-0-announce');

  sortLowToHighOption = () =>
    this.page.locator('a#s-result-sort-select_1');

  async navigate() {
    await this.page.goto(process.env.BASE_URL || 'https://www.amazon.in/', {
      waitUntil: 'domcontentloaded',
    });
  }

  async searchProduct(productName: string) {
    await this.searchInput().fill(productName);
    await this.searchButton().click();
    await this.searchResults().first().waitFor({ state: 'visible' });
  }

  async applyBrandFilter(brand: string) {
    const checkbox = this.brandCheckbox(brand);
    await expect(checkbox).toBeVisible();
    await checkbox.click();
    await this.page.waitForTimeout(2000);
    await this.searchResults().first().waitFor({ state: 'visible' });
  }

  async applyPriceRange(rangeText: string) {
    let range;
    if (rangeText === 'any') {
      const priceSection = this.page.locator('#s-refinements .a-section').filter({ hasText: 'Price' }).first();
      range = priceSection.locator('a').first();
      console.log('Selecting first available price filter...');
    } else {
      range = this.priceRangeOption(rangeText);
    }

    await range.scrollIntoViewIfNeeded();
    await expect(range).toBeVisible();
    await range.click();
    await this.page.waitForTimeout(2000);
    await this.searchResults().first().waitFor({ state: 'visible' });
  }

  async sortByPriceLowToHigh() {
    const sortDropdown = this.page.locator('.a-dropdown-container').filter({ hasText: /Sort by/i }).first();
    const trigger = this.page.locator('.a-dropdown-button').first();

    if (await sortDropdown.count() > 0) {
      await sortDropdown.click();
    } else {
      await trigger.click();
    }

    const option = this.page.locator('.a-popover-inner li a').filter({ hasText: 'Price: Low to High' });
    await expect(option).toBeVisible();
    await option.click();
    await this.page.waitForTimeout(2000);
  }

  async clickFirstResult() {
    // Wait for at least one search result to be visible
    const firstResult = this.searchResults().first();
    await firstResult.waitFor({ state: 'visible', timeout: 15000 });

    // Target any link that contains the product title - common classes: s-no-outline, a-link-normal
    const firstResultLink = firstResult.locator('h2 a, a.a-link-normal').first();
    await firstResultLink.waitFor({ state: 'visible', timeout: 10000 });
    await firstResultLink.click();
  }

  async loadAllResultsUsingEvaluate() {
    await this.page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 400;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    await this.page.waitForTimeout(1000);
  }

  async validateBrandFilter(brand: string) {
    await this.page.waitForTimeout(2000);
    const titles = await this.productTitles().allTextContents();

    const checkCount = Math.min(titles.length, 10);
    const failures: string[] = [];

    for (let i = 0; i < checkCount; i++) {
      const title = titles[i].toLowerCase();
      if (!title.includes(brand.toLowerCase())) {
        failures.push(titles[i]);
      }
    }

    if (failures.length > 0) {
      expect(failures, `Products not matching brand: ${failures.join(', ')}`)
        .toHaveLength(0);

    }
  }

  async validatePricesSortedLowToHigh() {

    const results = await this.searchResults().all();
    const prices: number[] = [];

    for (const result of results) {
      const textContent = await result.textContent() || '';
      const classAttribute = await result.getAttribute('class') || '';

      const isSponsored =
        textContent.includes('Sponsored') ||
        classAttribute.includes('AdHolder') ||
        classAttribute.includes('ad-result-item');

      if (isSponsored) {
        continue;
      }

      const priceElement = result.locator('span.a-price-whole').first();
      if (await priceElement.count() > 0) {
        const text = await priceElement.textContent();
        if (text) {
          const cleanPrice = parseFloat(text.replace(/[^0-9.]/g, ''));
          if (!isNaN(cleanPrice)) {
            prices.push(cleanPrice);
          }
        }
      }
    }

    expect(prices.length).toBeGreaterThan(1);

    let isSorted = true;
    for (let i = 0; i < prices.length - 1; i++) {
      if (prices[i] > prices[i + 1]) {
        const prev = i > 0 ? prices[i - 1] : 0;
        const next = prices[i + 1];

        if (prev <= next) {
          continue;
        }

        isSorted = false;
      }
    }

    if (!isSorted) {
      throw new Error('Prices are not sorted correctly!');
    }
  }

  async clickLastLoadedProduct() {
    let products = this.page.locator(
      'div[data-asin]:not([data-asin=""])'
    );

    if (await products.count() === 0) {
      console.log('No data-asin products found, falling back to generic product links...');
      products = this.page.locator('a.a-link-normal[href*="/dp/"]');
    }

    await expect(products.first()).toBeVisible({ timeout: 20000 });

    const count = await products.count();
    expect(count).toBeGreaterThan(0);

    const lastProduct = products.nth(count - 1);

    await lastProduct.scrollIntoViewIfNeeded();

    
    const tagName = await lastProduct.evaluate(el => el.tagName.toLowerCase());
    if (tagName === 'a') {
      await lastProduct.click();
    } else {
      await lastProduct.locator('h2 a, a.a-link-normal').first().click();
    }
  }

}
