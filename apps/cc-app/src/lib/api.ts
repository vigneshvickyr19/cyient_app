import { createApiClient, type ApiClient } from '@cyient/api-client';
import type { paths } from '@cyient/api-client/cc';
import { useHttpClient } from '@cyient/shared-ui';

export type CcApi = ApiClient<paths>;

/**
 * The Customer Complaint API, typed from its OpenAPI document, on the app's HTTP client (from AppProviders, so tests can give a mock
 * one). Every call carries the sign-in.
 */
export function useCcApi(): CcApi {
  return createApiClient<paths>(useHttpClient());
}
