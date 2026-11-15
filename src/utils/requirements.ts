import { test } from '@playwright/test';

/** Returns the value, or skips the test with a clear reason when it is missing. */
export function requireOrSkip<T>(value: T | undefined, name: string): T {
  if (value === undefined) test.skip(true, `Missing ${name} (see .env.example)`);
  return value as T;
}
