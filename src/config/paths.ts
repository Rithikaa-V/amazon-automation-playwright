import path from 'node:path';

/** Saved browser session (cookies + localStorage) of the signed-in test user. */
export const AUTH_FILE = path.resolve(__dirname, '../../.auth/amazon-user.json');
