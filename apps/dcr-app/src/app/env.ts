import { readAppEnv } from '@cyient/shared-ui';

/** The DCR app's settings, checked once at start-up (see .env.example). */
export const env = readAppEnv(import.meta.env, 'cyient-dcr-dev-user');
