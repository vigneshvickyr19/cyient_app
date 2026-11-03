import type { CftActionTemplateInput, CftFunctionInput, CustomerDetails, CustomerInput, CustomerUpdateInput } from '@cyient/api-client/ecn';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEcnApi } from '../../lib/api';
import { masterKeys } from './keys';

/** Adds a customer by name (kept in capitals); a name already in the list returns that customer. */
export function useAddCustomer() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CustomerInput) => (await api.post('/api/v1/customers', { body: input })).data,
    onSuccess: (customer) => {
      // Offered at once in the drop-downs, before the list is read again
      queryClient.setQueryData<CustomerDetails[]>(masterKeys.customers(false), (list) =>
        list && !list.some((c) => c.id === customer.id) ? [...list, customer].sort((a, b) => a.name.localeCompare(b.name)) : list,
      );
      return queryClient.invalidateQueries({ queryKey: masterKeys.allCustomers() });
    },
  });
}

/** Renames a customer or switches it off or on (ECN admins). */
export function useUpdateCustomer() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CustomerUpdateInput }) => api.put('/api/v1/admin/customers/{id}', { path: { id }, body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterKeys.allCustomers() }),
  });
}

/** Adds a CFT function (id null) or changes one; every view of the functions is read again. */
export function useSaveCftFunction() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number | null; input: CftFunctionInput }) =>
      id === null
        ? api.post('/api/v1/admin/cft-functions', { body: input })
        : api.put('/api/v1/admin/cft-functions/{id}', { path: { id }, body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterKeys.functions() }),
  });
}

/** Adds a predefined action to a function (actionId null) or changes one. */
export function useSaveCftActionTemplate() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ functionId, actionId, input }: { functionId: number; actionId: number | null; input: CftActionTemplateInput }) =>
      actionId === null
        ? api.post('/api/v1/admin/cft-functions/{id}/actions', { path: { id: functionId }, body: input })
        : api.put('/api/v1/admin/cft-functions/{id}/actions/{actionId}', { path: { id: functionId, actionId }, body: input }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: masterKeys.functions() }),
  });
}
