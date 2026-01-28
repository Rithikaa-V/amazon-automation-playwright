import { Page, expect, Locator, FrameLocator } from '@playwright/test';

export class AmazonCheckoutPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    proceedToCheckoutButton = () =>
        this.page.locator('input[name="proceedToRetailCheckout"], [data-feature-id="proceed-to-checkout-action"] input, #proceed-to-checkout-action input').first();

    changeAddressLink = () => this.page.locator('a:has-text("Change")').first();
    addressListContainer = () => this.page.locator('#address-list');

    async proceedToCheckout() {
        await this.page.goto('https://www.amazon.in/gp/cart/view.html?ref_=nav_cart');
        await this.proceedToCheckoutButton().click();
        await this.page.waitForLoadState('networkidle');
    }

    async changeAddress() {
        if (await this.changeAddressLink().isVisible()) {
            await this.changeAddressLink().click();
            await this.page.waitForLoadState('domcontentloaded');
        } else {
            console.log('Address selection page likely already active.');
        }
    }

    async selectAddress(partialAddressText: string) {
        console.log(`Selecting address containing: "${partialAddressText}"`);

        const addressTextLocator = this.page.locator('label, .address-book-entry').filter({ hasText: new RegExp(partialAddressText, 'i') }).first();
        try {
            await addressTextLocator.waitFor({ state: 'visible', timeout: 15000 });
        } catch (e) {
            console.log('Address text not visible yet, attempting selection anyway...');
        }


        const label = this.page.locator('label').filter({ hasText: new RegExp(partialAddressText, 'i') }).first();
        const addressContainer = this.page.locator('.address-book-entry').filter({ hasText: new RegExp(partialAddressText, 'i') }).first();

        try {
            await label.click({ timeout: 5000 });
            return;
        } catch (e) {
            console.log('Label click failed or not visible, trying other methods...');
        }

        if (await addressContainer.count() > 0) {
            const radioButton = addressContainer.locator('input[type="radio"]');
            if (await radioButton.isVisible()) {
                await radioButton.click({ force: true });
            } else {
                await addressContainer.locator('a:has-text("Deliver to this address"), button:has-text("Deliver to this address")').first().click({ force: true });
                return;
            }
        } else {
            const genericText = this.page.getByText(partialAddressText).first();
            if (await genericText.isVisible()) {
                console.log('Found address text generically, clicking it...');
                await genericText.click({ force: true });
            } else {
                const frames = this.page.frames();
                for (const frame of frames) {
                    const el = frame.getByText(partialAddressText).first();
                    if (await el.isVisible()) {
                        console.log('Found address in iframe!');
                        await el.click({ force: true });
                        const shipBtn = frame.locator('[data-testid="Address_selectShipToThisAddress"], #shipToThisAddressButton, input[value="Deliver to this address"]').first();
                        if (await shipBtn.isVisible()) await shipBtn.click();
                        return;
                    }
                }
                throw new Error(`Address containing "${partialAddressText}" not found.`);
            }
        }

    }
}
