import { devices } from '@playwright/test';

/**
 * Browser context shared by the config AND by code that creates contexts manually
 * (auth setup). A realistic desktop UA + India locale/timezone matches amazon.in
 * and avoids the "HeadlessChrome" user agent.
 */
export const desktopContext = {
  ...devices['Desktop Chrome'],
  locale: 'en-IN',
  timezoneId: 'Asia/Kolkata',
};
