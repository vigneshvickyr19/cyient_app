import type { PartInput } from '@cyient/api-client/ecn';
import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

/** Adds (partId null) or changes an ECN Parts row. */
export const savePart = (api: EcnApi, publicId: string, partId: number | null, input: PartInput) =>
  partId === null
    ? api.post(ecnEndpoints.part.collection, { path: { publicId }, body: input })
    : api.put(ecnEndpoints.part.item, { path: { publicId, partId }, body: input });

export const deletePart = (api: EcnApi, publicId: string, partId: number) =>
  api.delete(ecnEndpoints.part.item, { path: { publicId, partId } });
