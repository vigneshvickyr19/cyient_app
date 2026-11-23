import type { CftActionTemplateInput, CftFunctionInput } from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

/** The active CFT functions in display order, each with its active predefined actions. */
export const listCftFunctions = async (api: EcnApi, signal?: AbortSignal) => (await api.get(ecnEndpoints.cftFunction.collection, { signal })).data;

/** Every CFT function and predefined action, switched-off ones included, for the administration screen. */
export const listAdminCftFunctions = async (api: EcnApi, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.cftFunction.adminCollection, { signal })).data;

/** Adds a CFT function (id null) or changes one. */
export const saveCftFunction = (api: EcnApi, id: number | null, input: CftFunctionInput) =>
  id === null
    ? api.post(ecnEndpoints.cftFunction.adminCollection, { body: input })
    : api.put(ecnEndpoints.cftFunction.adminItem, { path: { id }, body: input });

/** Adds a predefined action to a function (actionId null) or changes one. */
export const saveCftActionTemplate = (api: EcnApi, functionId: number, actionId: number | null, input: CftActionTemplateInput) =>
  actionId === null
    ? api.post(ecnEndpoints.cftFunction.adminActions, { path: { id: functionId }, body: input })
    : api.put(ecnEndpoints.cftFunction.adminActionItem, { path: { id: functionId, actionId }, body: input });
