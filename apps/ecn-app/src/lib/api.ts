import { createApiClient, type ApiClient } from '@cyient/api-client';
import type { paths } from '@cyient/api-client/ecn';
import { useHttpClient } from '@cyient/shared-ui';

export type EcnApi = ApiClient<paths>;

/**
 * The ECN API, typed from its OpenAPI document, on the app's HTTP client (from AppProviders, so tests can give a mock
 * one). Every call carries the sign-in.
 */
export function useEcnApi(): EcnApi {
  return createApiClient<paths>(useHttpClient());
}
