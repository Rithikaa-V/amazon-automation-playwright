import type { Locator, Page } from '@playwright/test';
import { CHALLENGE_URL } from './botCheck';

const NAVIGATION_TIMEOUT = 45_000;

/** The destination OR an Amazon challenge page, so a CAPTCHA gives a clear error, not a 30 s timeout. */
const orChallenge = (destination: RegExp): RegExp =>
  new RegExp(`${destination.source}|${CHALLENGE_URL.source}`);

/**
 * Click a link and return the Page that now shows the destination.
 * Deterministic: it reads the link's `target` BEFORE clicking, instead of racing
 * `context.waitForEvent('page').catch(() => null)`.
 *
 * Waits for the URL to COMMIT, not for DOMContentLoaded: Amazon pages can take very long to
 * finish loading, and readiness is asserted afterwards with web-first assertions.
 */
export async function clickAndFollow(page: Page, link: Locator, destination: RegExp): Promise<Page> {
  const target = orChallenge(destination);
  const opensNewTab = (await link.getAttribute('target')) === '_blank';
  if (opensNewTab) {
    const [popup] = await Promise.all([page.context().waitForEvent('page'), link.click()]);
    await popup.waitForURL(target, { waitUntil: 'commit', timeout: NAVIGATION_TIMEOUT });
    return popup;
  }
  await Promise.all([
    page.waitForURL(target, { waitUntil: 'commit', timeout: NAVIGATION_TIMEOUT }),
    link.click(),
  ]);
  return page;
}

/** Click something that re-renders the page (filter) and wait for the URL to change. */
export async function clickAndWaitForUrlChange(page: Page, target: Locator): Promise<void> {
  const before = page.url();
  await Promise.all([
    page.waitForURL((url) => url.href !== before, { waitUntil: 'commit', timeout: NAVIGATION_TIMEOUT }),
    target.click(),
  ]);
}
