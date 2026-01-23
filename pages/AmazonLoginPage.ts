import { Page, expect } from '@playwright/test';

export class AmazonLoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    signInButtonConfig = () => this.page.locator('#nav-link-accountList');
    emailInput = () => this.page.locator('input#ap_email_login');
    continueButton = () => this.page.locator('input[aria-labelledby="continue-announce"]');
    passwordInput = () => this.page.locator('input#ap_password');
    signInSubmitButton = () => this.page.locator('input#signInSubmit');

    async navigate() {
        await this.page.goto(process.env.BASE_URL || 'https://www.amazon.in/');
    }

    async login(username: string, password: string) {
        await this.signInButtonConfig().hover();
        const flyoutSignIn = this.page.locator('.nav-action-signin-button');

        if (await flyoutSignIn.isVisible()) {
            await flyoutSignIn.click();
        } else {
            await this.signInButtonConfig().click();
        }

        await this.emailInput().waitFor({ state: 'visible', timeout: 10000 });
        await this.emailInput().fill(username);

        await this.page.waitForTimeout(2000);

        await this.continueButton().click({ force: true });
        await this.page.waitForLoadState('domcontentloaded');

        await this.passwordInput().first().waitFor({ state: 'visible', timeout: 10000 });
        await this.passwordInput().fill(password);
        await this.signInSubmitButton().dispatchEvent('click');

        try {
            await this.page.waitForSelector('#twotabsearchtextbox', { state: 'visible', timeout: 20000 });
    
        } catch (error) {
         
            if (this.page.url().includes('signin')) {
                const errorText = await this.page.locator('#auth-error-message-box').innerText().catch(() => 'No error box');
            
            }
            throw error;
        }
    }
}
