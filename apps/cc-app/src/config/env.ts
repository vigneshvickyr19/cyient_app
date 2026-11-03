import { readAppEnv } from '@cyient/shared-ui';

/** The Customer Complaint app's settings, checked once at start-up (see .env.example). */
export const env = readAppEnv(import.meta.env, 'cyient-cc-dev-user');
