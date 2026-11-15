import { SEARCH, SORTS } from '../../src/data/catalog';
import { expect, test } from '../../src/fixtures';
import { firstOutOfOrder } from '../../src/utils/price';

test.describe('Search: brand filter + price sorting', () => {
  for (const sort of SORTS) {
    test(`"${SEARCH.term}" by ${SEARCH.brand}, sorted ${sort.label}`, { tag: '@smoke' }, async ({ home, results }) => {
      await home.goto();
      await results.search(SEARCH.term);
      await results.filterByBrand(SEARCH.brand);
      await results.sortBy(sort.param);
      await results.loadMore();

      const titles = await results.organicTitles(10);
      expect(titles.length, 'no organic results after filtering').toBeGreaterThan(0);
      const offenders = titles.filter((t) => !t.toLowerCase().includes(SEARCH.brand.toLowerCase()));
      expect(offenders, `titles not matching brand "${SEARCH.brand}"`).toEqual([]);

      const prices = await results.organicPrices(20);
      expect(prices.length, 'need at least 2 priced results to check ordering').toBeGreaterThan(1);
      expect(
        firstOutOfOrder(prices, sort.direction),
        `prices are not ${sort.direction}: ${JSON.stringify(prices)}`,
      ).toBeNull();
    });
  }
});
