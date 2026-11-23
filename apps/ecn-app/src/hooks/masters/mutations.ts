import { toastMeta } from '@cyient/shared-ui';
import type { CftActionTemplateInput, CftFunctionInput, CustomerDetails, CustomerInput, CustomerUpdateInput } from '@cyient/api-client/ecn';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ecnTags } from '@/api-callers/api-tags';
import { saveCftActionTemplate, saveCftFunction } from '@/api-callers/masters/cft-function.api';
import { addCustomer, updateCustomer } from '@/api-callers/masters/customer.api';
import { useEcnApi } from '@/hooks/useEcnApi';

/** Adds a customer by name (kept in capitals); a name already in the list returns that customer. */
export function useAddCustomer() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<{ name: string }>({ success: (customer) => `${customer.name} is in the customer list.`, error: 'The customer could not be added.' }),
    mutationFn: (input: CustomerInput) => addCustomer(api, input),
    onSuccess: (customer) => {
      // Offered at once in the drop-downs, before the list is read again
      queryClient.setQueryData<CustomerDetails[]>(ecnTags.master.customers(false), (list) =>
        list && !list.some((c) => c.id === customer.id) ? [...list, customer].sort((a, b) => a.name.localeCompare(b.name)) : list,
      );
      return queryClient.invalidateQueries({ queryKey: ecnTags.master.allCustomers() });
    },
  });
}

/** Renames a customer or switches it off or on (ECN admins). */
export function useUpdateCustomer() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'Customer saved.', error: 'The customer could not be saved.' }),
    mutationFn: ({ id, input }: { id: number; input: CustomerUpdateInput }) => updateCustomer(api, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ecnTags.master.allCustomers() }),
  });
}

/** Adds a CFT function (id null) or changes one; every view of the functions is read again. */
export function useSaveCftFunction() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta<unknown, { id: number | null }>({ success: (_, { id }) => (id === null ? 'CFT function added. It is on the CFT Team tab of every new note.' : 'CFT function saved.'), error: 'The CFT function could not be saved.' }),
    mutationFn: ({ id, input }: { id: number | null; input: CftFunctionInput }) => saveCftFunction(api, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ecnTags.master.functions() }),
  });
}

/** Adds a predefined action to a function (actionId null) or changes one. */
export function useSaveCftActionTemplate() {
  const api = useEcnApi();
  const queryClient = useQueryClient();
  return useMutation({
    meta: toastMeta({ success: 'Predefined action saved. Notes published to the CFT from now on get it.', error: 'The action could not be saved.' }),
    mutationFn: ({ functionId, actionId, input }: { functionId: number; actionId: number | null; input: CftActionTemplateInput }) =>
      saveCftActionTemplate(api, functionId, actionId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ecnTags.master.functions() }),
  });
}
