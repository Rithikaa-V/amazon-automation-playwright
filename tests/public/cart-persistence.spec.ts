import { env } from '../../src/config/env';
import { SEARCH } from '../../src/data/catalog';
import { expect, test } from '../../src/fixtures';
import { LoginPage } from '../../src/pages/LoginPage';
import { requireOrSkip } from '../../src/utils/requirements';

test('guest cart items survive sign-in', { tag: '@regression' }, async ({ home, results }) => {
  test.slow();
  const phone = requireOrSkip(env.phone, 'AMAZON_PHONE');
  const password = requireOrSkip(env.password, 'AMAZON_PASSWORD');

  await home.goto();
  await results.search(SEARCH.term);
  const product = await results.openFirstResult();
  await product.addToCart();
  await expect.poll(() => product.header.cartCount()).toBeGreaterThan(0);
  const before = await product.header.cartCount();

  await new LoginPage(product.page).signIn(phone, password);
  await product.header.openCart();

  // >= not ===: the account may already hold items, and Amazon MERGES the guest cart into it.
  await expect.poll(() => product.header.cartCount()).toBeGreaterThanOrEqual(before);
});
