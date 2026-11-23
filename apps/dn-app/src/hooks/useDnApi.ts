import { createApiClient } from '@cyient/api-client';
import type { paths } from '@cyient/api-client/dn';
import { useHttpClient } from '@cyient/shared-ui';
import type { DnApi } from '@/types/api';

/**
 * The Deviation Note API, typed from its OpenAPI document, on the app's HTTP client (from AppProviders, so tests can give a mock
 * one). Every call carries the sign-in.
 */
export function useDnApi(): DnApi {
  return createApiClient<paths>(useHttpClient());
}
