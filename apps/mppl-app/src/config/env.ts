import { readAppEnv } from '@cyient/shared-ui';

/** The MPPL Escalation Tracker app's settings, checked once at start-up (see .env.example). */
export const env = readAppEnv(import.meta.env, 'cyient-mppl-dev-user');
