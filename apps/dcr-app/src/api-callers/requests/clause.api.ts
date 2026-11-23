import type { ClauseInput } from '@cyient/api-client/dcr';
import { dcrEndpoints } from '@/api-callers/api-endpoints';
import type { DcrApi } from '@/types/api';

/** Adds a clause line (clauseId null) or changes one. */
export const saveClause = (api: DcrApi, publicId: string, clauseId: number | null, input: ClauseInput) =>
  clauseId === null
    ? api.post(dcrEndpoints.clause.collection, { path: { publicId }, body: input })
    : api.put(dcrEndpoints.clause.item, { path: { publicId, clauseId }, body: input });

export const deleteClause = (api: DcrApi, publicId: string, clauseId: number) =>
  api.delete(dcrEndpoints.clause.item, { path: { publicId, clauseId } });
