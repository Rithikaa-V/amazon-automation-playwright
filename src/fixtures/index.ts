import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';

/** Defense in depth: even if a test (or a future page object) clicks "Place order", the request dies. */
const ORDER_PLACEMENT = /place-?your-?order|place-?order|\/spc\/place/i;

type Fixtures = {
  home: HomePage;
  results: SearchResultsPage;
  orderGuard: void;
};

export const test = base.extend<Fixtures>({
  home: async ({ page }, use) => use(new HomePage(page)),
  results: async ({ page }, use) => use(new SearchResultsPage(page)),
  orderGuard: [
    async ({ context }, use) => {
      await context.route(ORDER_PLACEMENT, (route) => route.abort('blockedbyclient'));
      await use();
    },
    { auto: true },
  ],
});

export { expect };
