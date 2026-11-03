import type { Option } from '@cyient/shared-ui';
import { useQuery } from '@tanstack/react-query';
import { useEcnApi } from '../../lib/api';
import { masterKeys } from './keys';

/** The Customer Name list by name; switched-off customers too for the customer administration (ECN admins only). */
export function useCustomers(includeInactive = false) {
  const api = useEcnApi();
  return useQuery({
    queryKey: masterKeys.customers(includeInactive),
    queryFn: async ({ signal }) => (await api.get('/api/v1/customers', { query: { includeInactive }, signal })).data,
    staleTime: 5 * 60_000,
  });
}

/** Active customers as drop-down choices. */
export function useCustomerOptions(): Option<number>[] {
  return (useCustomers().data ?? []).map((customer) => ({ value: customer.id, label: customer.name }));
}

/** The active CFT functions in display order, each with its active predefined actions. */
export function useCftFunctions() {
  const api = useEcnApi();
  return useQuery({
    queryKey: masterKeys.functions(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/cft-functions', { signal })).data,
    staleTime: 5 * 60_000,
  });
}

/** Every CFT function and predefined action, switched-off ones included, for the administration screen. */
export function useAdminCftFunctions() {
  const api = useEcnApi();
  return useQuery({
    queryKey: masterKeys.adminFunctions(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/cft-functions', { signal })).data,
  });
}
