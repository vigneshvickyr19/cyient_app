import type { ImmediateActionInput } from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

/** Adds (actionId null) or changes an Immediate Actions row. */
export const saveImmediateAction = (api: EcnApi, publicId: string, actionId: number | null, input: ImmediateActionInput) =>
  actionId === null
    ? api.post(ecnEndpoints.immediateAction.collection, { path: { publicId }, body: input })
    : api.put(ecnEndpoints.immediateAction.item, { path: { publicId, actionId }, body: input });

export const deleteImmediateAction = (api: EcnApi, publicId: string, actionId: number) =>
  api.delete(ecnEndpoints.immediateAction.item, { path: { publicId, actionId } });
