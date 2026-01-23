import { Page, expect } from '@playwright/test';

export class AmazonProductPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    addToCartButton = () => this.page.locator('#add-to-cart-button');
    buyNowButton = () => this.page.locator('#buy-now-button');

    proceedToCheckoutButton = () => this.page.locator('input[name="proceedToRetailCheckout"]');
    addedToCartMessage = () => this.page.locator('#NATC_SMART_WAGON_CONF_MSG_SUCCESS, #attach-added-to-cart-message, h1:has-text("Added to Cart")');
    cartButton = () => this.page.locator('#nav-cart');
    cartCount = () => this.page.locator('#nav-cart-count');
    addedToCartContainer = () => this.page.locator('#NATC_SMART_WAGON_CONF_MSG_SUCCESS');


    deliveryLocationLink = () =>
        this.page.locator('#contextualIngressPtLabel_deliveryShortLine');

    pincodeInput = () =>
        this.page.locator('#GLUXZipUpdateInput');

    pincodeApplyButton = () =>
        this.page.locator('input[aria-labelledby="GLUXZipUpdate-announce"]');

    deliveryMessage = () =>
        this.page.locator(`
            #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE,
            #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_ID,
            #ddmDeliveryMessage,
            #deliveryMessageVisualizer`);


    availabilityStatus = () =>
        this.page.locator('#availability');

    async addToCart() {
        await expect(this.addToCartButton())
            .toBeVisible({ timeout: 20000 });

        await this.addToCartButton().click();

        // Wait for any of the success indicators
        const successMessage = this.page.locator('#NATC_SMART_WAGON_CONF_MSG_SUCCESS, #attach-added-to-cart-message, [data-v-c-message-success], .a-alert-success, h1:has-text("Added to Cart")');
        await expect(successMessage.first()).toBeVisible({ timeout: 20000 });
    }



    async buyNow() {
        await expect(this.buyNowButton()).toBeVisible();
        await this.buyNowButton().click();
    }

    async navigateToCart() {
        await this.cartButton().click();
    }

    async changePincode(pincode: string) {
        await expect(this.deliveryLocationLink()).toBeVisible();
        await this.deliveryLocationLink().click();

        await expect(this.pincodeInput()).toBeVisible({ timeout: 15000 });

        await this.pincodeInput().fill('');
        await this.pincodeInput().fill(pincode);

        await expect(this.pincodeApplyButton()).toBeEnabled();
        await this.pincodeApplyButton().click();

        await this.page.waitForLoadState('networkidle');

        await expect(this.deliveryMessage()).toBeVisible({ timeout: 20000 });
    }

    async getDeliveryMessage(): Promise<string> {
        await expect(this.deliveryMessage().first()).toBeVisible({ timeout: 20000 });

        return await this.deliveryMessage()
            .first()
            .evaluate(el => el.textContent?.replace(/\s+/g, ' ').trim() || '');
    }

    async getAvailabilityStatus(): Promise<string> {
        await expect(this.availabilityStatus()).toBeVisible({ timeout: 20000 });
        return (await this.availabilityStatus().innerText()).trim();
    }

    async getCartCount(): Promise<number> {
        await expect(this.cartCount()).toBeVisible({ timeout: 20000 });
        return parseInt(await this.cartCount().innerText(), 10);
    }

}
