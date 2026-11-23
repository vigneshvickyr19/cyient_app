import type { SourcingInput } from '@cyient/api-client/mppl';
import { mpplEndpoints } from '@/api-callers/api-endpoints';
import type { MpplApi } from '@/types/api';
import type { SourcingListQuery } from '@/types/issues';

/** The sourcing master, paged and filtered on the server. */
export const listSourcing = (api: MpplApi, query: SourcingListQuery, signal?: AbortSignal) =>
  api.get(mpplEndpoints.sourcing.collection, { query, signal });

/** One row with its current version, read again before it is changed. */
export const getSourcingRow = async (api: MpplApi, id: number, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.sourcing.item, { path: { id }, signal })).data;

/** Adds a row (id null) or changes one. */
export const saveSourcing = (api: MpplApi, id: number | null, input: SourcingInput) =>
  id === null ? api.post(mpplEndpoints.sourcing.collection, { body: input }) : api.put(mpplEndpoints.sourcing.item, { path: { id }, body: input });
