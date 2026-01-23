import { test, expect } from '@playwright/test';
import { AmazonLoginPage } from '../pages/AmazonLoginPage';
import { AmazonSearchPage } from '../pages/AmazonSearchPage';
import { AmazonProductPage } from '../pages/AmazonProductPage';
import { AmazonCheckoutPage } from '../pages/AmazonCheckoutPage';
import { autoScroll } from '../utils/scrollUtil';

test('Amazon Product search with filters & sorting', async ({ page }) => {
  const amazonPage = new AmazonSearchPage(page);

  await amazonPage.navigate();
  await amazonPage.searchProduct('wireless headphones');

  await amazonPage.applyBrandFilter('boAt');

  await amazonPage.applyPriceRange('any');

  await amazonPage.sortByPriceLowToHigh();

  await amazonPage.loadAllResultsUsingEvaluate();

  await amazonPage.validateBrandFilter('boAt');
  await amazonPage.validatePricesSortedLowToHigh();
});

test('Amazon Checkout - Select specific address', async ({ page, context }) => {
  test.setTimeout(120000);

  const loginPage = new AmazonLoginPage(page);
  const searchPage = new AmazonSearchPage(page);

  await loginPage.navigate();

  if (!process.env.PHONE || !process.env.PASSWORD) {
    throw new Error('Please provide PHONE and PASSWORD in .env file');
  }
  await loginPage.login(process.env.PHONE, process.env.PASSWORD);
  await searchPage.searchProduct('wireless mouse');

  const pagePromise = context.waitForEvent('page').catch(() => null);
  await searchPage.clickFirstResult();
  const newPage = await pagePromise;

  const activePage = newPage || page;
  await activePage.waitForLoadState('domcontentloaded');

  const productPage = new AmazonProductPage(activePage);

  await productPage.buyNow();

  await activePage.waitForLoadState('domcontentloaded');

  const checkoutPage = new AmazonCheckoutPage(activePage);

  await checkoutPage.changeAddress();

  const targetAddress = 'Aatheeswaran';
  await checkoutPage.selectAddress(targetAddress);
});


test('Amazon Product - Change Delivery Location', async ({ page, context }) => {
  test.setTimeout(120000);

  const searchPage = new AmazonSearchPage(page);

  await searchPage.navigate();
  await searchPage.searchProduct('wireless headphones');

  const pagePromise = context.waitForEvent('page').catch(() => null);
  await searchPage.clickFirstResult();
  const newPage = await pagePromise;

  const activePage = newPage || page;
  await activePage.waitForLoadState('domcontentloaded');

  const productPage = new AmazonProductPage(activePage);

  await productPage.changePincode('560001');

  const availability = await productPage.getAvailabilityStatus();
  expect(availability.toLowerCase()).toContain('in stock');
});

test('Cart Persistence after Login', async ({ page, context }) => {
  test.setTimeout(120000);

  const searchPage = new AmazonSearchPage(page);

  await searchPage.navigate();
  await searchPage.searchProduct('wireless headphones');

  const pagePromise = context.waitForEvent('page').catch(() => null);
  await searchPage.clickFirstResult();

  const productTab = (await pagePromise) || page;
  await productTab.waitForLoadState('domcontentloaded');

  const productPage = new AmazonProductPage(productTab);

  await productPage.addToCart();
  const cartCountBeforeLogin = await productPage.getCartCount();

  expect(cartCountBeforeLogin).toBeGreaterThan(0);

  const loginPage = new AmazonLoginPage(productTab);
  await loginPage.login(
    process.env.PHONE!,
    process.env.PASSWORD!
  );

  await productPage.navigateToCart();
  const cartCountAfterLogin = await productPage.getCartCount();
  expect(cartCountAfterLogin).toBe(cartCountBeforeLogin);
});

test('Amazon Home - Scroll till bottom and add last product to cart', async ({ page, context }) => {
  test.setTimeout(180000);

  const searchPage = new AmazonSearchPage(page);

  await searchPage.navigate();

  await autoScroll(page);
  await page.waitForTimeout(3000);

  const pagePromise = context.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await searchPage.clickLastLoadedProduct();

  const newTab = await pagePromise;
  const productTab = newTab || page;

  if (!newTab) {
    await productTab.waitForLoadState('domcontentloaded');
  }
  await productTab.waitForTimeout(3000);

  const productPage = new AmazonProductPage(productTab);
  await productPage.addToCart();
  await productTab.waitForTimeout(3000);

  const cartCount = await productPage.getCartCount();
  expect(cartCount).toBeGreaterThan(0);
});

