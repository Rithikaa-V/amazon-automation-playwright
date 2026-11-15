import { test as setup } from '@playwright/test';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { desktopContext } from '../src/config/contexts';
import { env } from '../src/config/env';
import { AUTH_FILE } from '../src/config/paths';
import { Header } from '../src/components/Header';
import { LoginPage } from '../src/pages/LoginPage';

/**
 * Obtains ONE signed-in session for every `account` test (storageState).
 * Priority: CI secret -> session saved by `npm run auth:save` -> credentials login.
 * Uses plain page.goto (no bot-check skip) so a broken session FAILS here, loudly.
 */
setup('establish authenticated session', async ({ browser }) => {
  mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  if (env.storageStateB64) {
    writeFileSync(AUTH_FILE, Buffer.from(env.storageStateB64, 'base64'));
  }

  if (existsSync(AUTH_FILE)) {
    const context = await browser.newContext({ ...desktopContext, storageState: AUTH_FILE });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const signedIn = await new Header(page).isSignedIn();
    await context.close();
    if (signedIn) return;
    if (!env.hasCredentials) {
      throw new Error('Stored Amazon session has expired. Run "npm run auth:save" and refresh the secret.');
    }
  }

  if (!env.phone || !env.password) {
    throw new Error('No session available: set AMAZON_PHONE/AMAZON_PASSWORD or run "npm run auth:save".');
  }
  const context = await browser.newContext(desktopContext);
  const page = await context.newPage();
  await new LoginPage(page).signIn(env.phone, env.password);
  await context.storageState({ path: AUTH_FILE });
  await context.close();
});
