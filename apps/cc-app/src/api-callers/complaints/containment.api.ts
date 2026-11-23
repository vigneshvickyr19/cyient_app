import type { ContainmentInput } from '@cyient/api-client/cc';
import { ccEndpoints } from '@/api-callers/api-endpoints';
import type { CcApi } from '@/types/api';

/** Adds (lineId null) or changes a containment action (D3); no email is sent. */
export const saveContainment = (api: CcApi, publicId: string, lineId: number | null, input: ContainmentInput) =>
  lineId === null
    ? api.post(ccEndpoints.containment.collection, { path: { publicId }, body: input })
    : api.put(ccEndpoints.containment.item, { path: { publicId, lineId }, body: input });

export const deleteContainment = (api: CcApi, publicId: string, lineId: number) =>
  api.delete(ccEndpoints.containment.item, { path: { publicId, lineId } });
