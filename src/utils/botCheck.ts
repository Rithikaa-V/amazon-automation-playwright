import { test, type Page } from '@playwright/test';
import { env } from '../config/env';

export const CHALLENGE_URL = /\/errors\/validateCaptcha|\/ap\/cvf\/|\/ap\/challenge/;

export async function isBotChallenge(page: Page): Promise<boolean> {
  if (CHALLENGE_URL.test(page.url())) return true;
  const marker = page
    .locator('form[action*="validateCaptcha"]')
    .or(page.locator('#captchacharacters'))
    .or(page.getByText(/enter the characters you see below/i))
    .first();
  return marker.isVisible().catch(() => false);
}

/**
 * Separates "the product is broken" from "Amazon blocked this IP".
 * - ON_BOT_CHECK=skip (CI default): test is annotated + skipped, not reported as a failure.
 * - ON_BOT_CHECK=fail (local default): fails loudly so you can solve it in a headed run.
 */
export async function handleBotChallenge(page: Page): Promise<void> {
  if (!(await isBotChallenge(page))) return;
  const reason = `Amazon bot-detection challenge at ${page.url()}`;
  test.info().annotations.push({ type: 'blocked-by-bot-detection', description: reason });
  if (env.botCheckPolicy === 'skip') test.skip(true, reason);
  throw new Error(`${reason}. Re-run headed, or set ON_BOT_CHECK=skip.`);
}
