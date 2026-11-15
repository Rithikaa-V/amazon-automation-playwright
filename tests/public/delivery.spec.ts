import { DELIVERY_LOCATIONS, SEARCH } from '../../src/data/catalog';
import { expect, test } from '../../src/fixtures';

test.describe('Product page: delivery location', () => {
  for (const { city, pincode } of DELIVERY_LOCATIONS) {
    test(`delivery message and stock for ${city} (${pincode})`, { tag: '@regression' }, async ({ home, results }) => {
      await home.goto();
      await results.search(SEARCH.term);
      const product = await results.openFirstResult();

      await product.changeDeliveryPincode(pincode);

      expect(await product.availabilityText()).toMatch(/in stock/i);
    });
  }
});
