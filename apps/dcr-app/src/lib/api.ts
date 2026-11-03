import { createApiClient, type ApiClient } from '@cyient/api-client';
import type { paths } from '@cyient/api-client/dcr';
import { useHttpClient } from '@cyient/shared-ui';

export type DcrApi = ApiClient<paths>;

/**
 * The DCR API, typed from its OpenAPI document, on the app's HTTP client (from AppProviders, so tests can give a mock
 * one). Every call carries the sign-in.
 */
export function useDcrApi(): DcrApi {
  return createApiClient<paths>(useHttpClient());
}
