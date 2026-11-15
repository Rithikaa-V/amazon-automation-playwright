import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly userInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly verificationStep: Locator;

  constructor(page: Page) {
    super(page);
    this.userInput = page.locator('input#ap_email_login, input#ap_email').first();
    this.continueButton = page.locator('#continue, input[aria-labelledby="continue-announce"]').first();
    this.passwordInput = page.locator('input#ap_password');
    this.submitButton = page.locator('input#signInSubmit');
    this.verificationStep = page
      .locator(
        '#auth-error-message-box, #auth-mfa-otpcode, #auth-mfa-form, input[name="cvf_input_code"], #captchacharacters, #auth-captcha-guess',
      )
      .first();
  }

  /**
   * Interactive sign-in. Deliberately throws (never skips) when Amazon asks for OTP/CAPTCHA:
   * use `npm run auth:save` once and reuse the stored session instead.
   */
  async signIn(user: string, password: string): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.header.accountLink.click();

    await this.userInput.fill(user);
    await this.continueButton.click();
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    await expect(this.header.searchInput.or(this.verificationStep)).toBeVisible({ timeout: 30_000 });
    if (await this.verificationStep.isVisible()) {
      const detail = (await this.verificationStep.innerText().catch(() => '')).trim() || 'verification step';
      throw new Error(
        `Amazon sign-in did not complete: ${detail}. ` +
          'If OTP/CAPTCHA is required, run "npm run auth:save" once and reuse the saved session.',
      );
    }
  }
}
