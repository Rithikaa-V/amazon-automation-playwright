import type { Page } from '@playwright/test';

/**
 * Scroll until the page stops growing (infinite scroll / lazy rows).
 * Event-based: waits for the document height to increase instead of sleeping.
 */
export async function scrollToBottom(page: Page, maxRounds = 15): Promise<void> {
  let previous = await page.evaluate(() => document.body.scrollHeight);
  for (let round = 0; round < maxRounds; round++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const grew = await page
      .waitForFunction((height) => document.body.scrollHeight > height, previous, { timeout: 2_000 })
      .then(() => true, () => false);
    if (!grew) return;
    previous = await page.evaluate(() => document.body.scrollHeight);
  }
}
