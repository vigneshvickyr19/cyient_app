import type { InternalActionInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';

/** Adds (actionId null) or changes a line of the action matrix. */
export const saveInternalAction = async (api: CcApi, publicId: string, actionId: number | null, input: InternalActionInput) =>
  (actionId === null
    ? await api.post(ccEndpoints.internalAction.collection, { path: { publicId }, body: input })
    : await api.put(ccEndpoints.internalAction.item, { path: { publicId, actionId }, body: input })
  ).data;

export const deleteInternalAction = (api: CcApi, publicId: string, actionId: number) =>
  api.delete(ccEndpoints.internalAction.item, { path: { publicId, actionId } });
