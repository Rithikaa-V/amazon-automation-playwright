import { expect, type Frame, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SAFETY: this page object intentionally has NO method that places an order.
 * (An auto fixture additionally aborts any place-order request. See fixtures/index.ts.)
 */
export class CheckoutPage extends BasePage {
  readonly changeAddressLink: Locator;
  readonly deliverySummary: Locator;

  constructor(page: Page) {
    super(page);
    this.changeAddressLink = page.locator('a:has-text("Change")').first();
    this.deliverySummary = page.locator('#deliver-to-customer-text, #deliver-to-address-text').first();
  }

  /** Opens the address chooser; if it is already open, does nothing. */
  async openAddressSelection(): Promise<void> {
    const available = await this.changeAddressLink
      .waitFor({ state: 'visible', timeout: 10_000 })
      .then(() => true, () => false);
    if (available) await this.changeAddressLink.click();
  }

  async selectAddress(pattern: RegExp): Promise<void> {
    const entry = await this.findInAnyFrame(
      (ctx) => ctx.locator('.address-book-entry, label').filter({ hasText: pattern }),
      15_000,
    );
    expect(entry, `No saved address matching ${pattern}`).toBeDefined();
    await entry?.click();

    // Some checkout variants need an explicit confirmation, others apply on selection.
    const confirm = await this.findInAnyFrame(
      (ctx) =>
        ctx.locator(
          '[data-testid="Address_selectShipToThisAddress"], #shipToThisAddressButton, input[value="Deliver to this address"]',
        ),
      5_000,
    );
    await confirm?.click();

    await expect(this.deliverySummary).toContainText(pattern, { timeout: 20_000 });
  }

  /** The chooser can render inside an iframe; poll every frame until one has a visible match. */
  private async findInAnyFrame(
    build: (ctx: Page | Frame) => Locator,
    timeout: number,
  ): Promise<Locator | undefined> {
    let found: Locator | undefined;
    await expect
      .poll(
        async () => {
          for (const frame of this.page.frames()) {
            const candidate = build(frame).first();
            if (await candidate.isVisible().catch(() => false)) {
              found = candidate;
              return true;
            }
          }
          return false;
        },
        { timeout },
      )
      .toBe(true)
      .catch(() => undefined);
    return found as Locator | undefined;
  }
}
