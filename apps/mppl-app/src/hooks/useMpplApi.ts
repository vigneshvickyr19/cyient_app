import { createApiClient } from '@cyient/api-client';
import type { paths } from '@cyient/api-client/mppl';
import { useHttpClient } from '@cyient/shared-ui';
import type { MpplApi } from '@/types/api';

/**
 * The MPPL API, typed from its OpenAPI document, on the app's HTTP client (from AppProviders, so tests can give a mock
 * one). Every call carries the sign-in.
 */
export function useMpplApi(): MpplApi {
  return createApiClient<paths>(useHttpClient());
}
