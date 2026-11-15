import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { AUTH_FILE } from './paths';

config({ quiet: true });

/** Treat empty strings (e.g. unset CI secrets) as "not provided". */
const read = (name: string): string | undefined => {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
};

const phone = read('AMAZON_PHONE') ?? read('PHONE'); // legacy name still supported
const password = read('AMAZON_PASSWORD') ?? read('PASSWORD');
const storageStateB64 = read('AMAZON_STORAGE_STATE_B64');
const isCI = Boolean(read('CI'));

export type BotCheckPolicy = 'skip' | 'fail';

/** The ONLY module that reads process.env. */
export const env = {
  baseUrl: read('BASE_URL') ?? 'https://www.amazon.in',
  phone,
  password,
  addressName: read('AMAZON_ADDRESS_NAME'),
  storageStateB64,
  isCI,
  botCheckPolicy: (read('ON_BOT_CHECK') ?? (isCI ? 'skip' : 'fail')) as BotCheckPolicy,
  hasCredentials: Boolean(phone && password),
  accountTestsEnabled: Boolean(phone && password) || Boolean(storageStateB64) || existsSync(AUTH_FILE),
} as const;
