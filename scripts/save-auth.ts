/**
 * One-time, interactive: sign in by hand (OTP / CAPTCHA are fine), then this saves the session.
 *   npm run auth:save
 * CI secret:  base64 -w0 .auth/amazon-user.json   (macOS: base64 -i .auth/amazon-user.json)
 */
import { chromium } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { desktopContext } from '../src/config/contexts';
import { env } from '../src/config/env';
import { AUTH_FILE } from '../src/config/paths';

async function main(): Promise<void> {
  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ...desktopContext, baseURL: env.baseUrl });
  const page = await context.newPage();
  await page.goto('/');
  console.log('Sign in in the opened browser window. Waiting up to 5 minutes...');

  await page.waitForFunction(
    () => {
      const el = document.querySelector('#nav-link-accountList-nav-line-1');
      return !!el && !/sign in/i.test(el.textContent ?? '');
    },
    null,
    { timeout: 300_000 },
  );

  await context.storageState({ path: AUTH_FILE });
  await browser.close();
  console.log(`Session saved to ${AUTH_FILE} (${readFileSync(AUTH_FILE).length} bytes). Never commit it.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
