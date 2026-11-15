import { SEARCH } from '../../src/data/catalog';
import { expect, test } from '../../src/fixtures';

test.describe('Cart (guest)', () => {
  test('adding a product from search increments the cart', { tag: '@smoke' }, async ({ home, results }) => {
    await home.goto();
    await results.search(SEARCH.term);
    const product = await results.openFirstResult();

    await product.addToCart();

    await expect.poll(() => product.header.cartCount(), { message: 'cart badge never updated' }).toBeGreaterThan(0);
  });

  // The home feed is personalised/random: useful for exploration, too noisy for a PR gate.
  test('add the last product of the home feed', { tag: '@exploratory' }, async ({ home }) => {
    test.slow();
    await home.goto();
    const product = await home.openLastProduct();

    await product.addToCart();

    await expect.poll(() => product.header.cartCount()).toBeGreaterThan(0);
  });
});
