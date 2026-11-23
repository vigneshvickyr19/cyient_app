import type { Option } from '@cyient/shared-ui';
import { useQuery } from '@tanstack/react-query';
import { ecnTags } from '@/api-callers/api-tags';
import { listAdminCftFunctions, listCftFunctions } from '@/api-callers/masters/cft-function.api';
import { listCustomers } from '@/api-callers/masters/customer.api';
import { useEcnApi } from '@/hooks/useEcnApi';

/** The Customer Name list by name; switched-off customers too for the customer administration (ECN admins only). */
export function useCustomers(includeInactive = false) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.master.customers(includeInactive),
    queryFn: ({ signal }) => listCustomers(api, includeInactive, signal),
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
    queryKey: ecnTags.master.functions(),
    queryFn: ({ signal }) => listCftFunctions(api, signal),
    staleTime: 5 * 60_000,
  });
}

/** Every CFT function and predefined action, switched-off ones included, for the administration screen. */
export function useAdminCftFunctions() {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.master.adminFunctions(),
    queryFn: ({ signal }) => listAdminCftFunctions(api, signal),
  });
}
