import { env } from '../../src/config/env';
import { expect, test } from '../../src/fixtures';
import { escapeRegExp } from '../../src/utils/regex';
import { requireOrSkip } from '../../src/utils/requirements';

test('Buy Now: choose a saved delivery address', { tag: '@regression' }, async ({ home, results }) => {
  test.slow();
  const name = requireOrSkip(env.addressName, 'AMAZON_ADDRESS_NAME');
  const pattern = new RegExp(escapeRegExp(name), 'i');

  await home.goto();
  await results.search('wireless mouse');
  const product = await results.openFirstResult();
  const checkout = await product.buyNow();

  await checkout.openAddressSelection();
  await checkout.selectAddress(pattern);

  // Assertion lives in selectAddress (summary shows the chosen address).
  // We STOP here: the framework never places an order.
  await expect(checkout.deliverySummary).toContainText(pattern);
});
