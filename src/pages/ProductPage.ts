import { expect, type Locator, type Page } from '@playwright/test';
import { handleBotChallenge } from '../utils/botCheck';
import { BasePage } from './BasePage';
import { CheckoutPage } from './CheckoutPage';

export const PRODUCT_URL = /\/(dp|gp\/product)\//;

export class ProductPage extends BasePage {
  readonly addToCartButton: Locator;
  readonly buyNowButton: Locator;
  readonly addedToCartConfirmation: Locator;
  readonly pincodeInput: Locator;
  readonly pincodeApply: Locator;
  readonly deliveryMessage: Locator;
  readonly availability: Locator;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = page.locator('#add-to-cart-button');
    this.buyNowButton = page.locator('#buy-now-button');
    this.addedToCartConfirmation = page
      .locator('.a-alert-success, #attach-added-to-cart-message, #NATC_SMART_WAGON_CONF_MSG_SUCCESS')
      .first(); // several nodes can match: .first() avoids a strict-mode violation
    this.pincodeInput = page.locator('#GLUXZipUpdateInput');
    this.pincodeApply = page.locator('input[aria-labelledby="GLUXZipUpdate-announce"]');
    this.deliveryMessage = page
      .locator(
        [
          '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE',
          '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_ID',
          '#ddmDeliveryMessage',
          '#deliveryMessageVisualizer',
        ].join(', '),
      )
      .first();
    this.availability = page.locator('#availability');
  }

  /** Product page is usable (or Amazon showed a challenge, which is then skipped/failed with a clear reason). */
  async waitUntilReady(): Promise<void> {
    const title = this.page.locator('#productTitle');
    const challenge = this.page.locator('form[action*="validateCaptcha"], #captchacharacters').first();
    await expect(title.or(challenge)).toBeVisible({ timeout: 45_000 });
    await handleBotChallenge(this.page);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.addedToCartConfirmation).toBeVisible({ timeout: 20_000 });
  }

  async buyNow(): Promise<CheckoutPage> {
    await this.buyNowButton.click();
    await this.page.waitForURL(/\/(checkout|buy|gp\/buy)\//, { waitUntil: 'domcontentloaded' });
    return new CheckoutPage(this.page);
  }

  async changeDeliveryPincode(pincode: string): Promise<void> {
    // The popover can open late; retry the click until the pincode box is really there.
    await expect(async () => {
      await this.header.locationLink.click();
      await expect(this.pincodeInput).toBeVisible({ timeout: 5_000 });
    }).toPass({ timeout: 30_000 });
    await this.pincodeInput.fill(pincode);
    await this.pincodeApply.click();
    await expect(this.deliveryMessage).toBeVisible({ timeout: 20_000 });
  }

  async availabilityText(): Promise<string> {
    await expect(this.availability).toBeVisible({ timeout: 20_000 });
    return (await this.availability.innerText()).trim();
  }
}
