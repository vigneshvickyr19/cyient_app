import { readAppEnv } from '@cyient/shared-ui';

/** The Deviation Note app's settings, checked once at start-up (see .env.example). */
export const env = readAppEnv(import.meta.env, 'cyient-dn-dev-user');
