import { defineConfig } from '@playwright/test';
import { desktopContext } from './src/config/contexts';
import { env } from './src/config/env';
import { AUTH_FILE } from './src/config/paths';

/**
 * Projects
 *  unit    pure-logic tests, no browser, no network  -> deterministic CI gate
 *  public  guest flows on amazon.in                  -> no credentials needed
 *  setup   obtains a logged-in session (storageState)
 *  account flows that need a signed-in user          -> only registered when a session can be obtained
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 2 : undefined,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: env.isCI
    ? [['blob'], ['github'], ['list']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'unit', testMatch: /unit\/.*\.spec\.ts/ },
    { name: 'public', testMatch: /public\/.*\.spec\.ts/, use: desktopContext },
    ...(env.accountTestsEnabled
      ? [
          { name: 'setup', testMatch: /auth\.setup\.ts/, use: desktopContext },
          {
            name: 'account',
            testMatch: /account\/.*\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...desktopContext, storageState: AUTH_FILE },
          },
        ]
      : []),
  ],
});
