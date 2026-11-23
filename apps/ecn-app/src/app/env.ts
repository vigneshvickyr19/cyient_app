import { readAppEnv } from '@cyient/shared-ui';

/** The Engineering Change Note app's settings, checked once at start-up (see .env.example). */
export const env = readAppEnv(import.meta.env, 'cyient-ecn-dev-user');
