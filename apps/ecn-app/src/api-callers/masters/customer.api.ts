import type { CustomerInput, CustomerUpdateInput } from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

/** The Customer Name list by name; switched-off customers too for the customer administration (ECN admins only). */
export const listCustomers = async (api: EcnApi, includeInactive: boolean, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.customer.collection, { query: { includeInactive }, signal })).data;

/** Adds a customer by name (kept in capitals); a name already in the list returns that customer. */
export const addCustomer = async (api: EcnApi, input: CustomerInput) => (await api.post(ecnEndpoints.customer.collection, { body: input })).data;

/** Renames a customer or switches it off or on (ECN admins). */
export const updateCustomer = (api: EcnApi, id: number, input: CustomerUpdateInput) =>
  api.put(ecnEndpoints.customer.adminItem, { path: { id }, body: input });
