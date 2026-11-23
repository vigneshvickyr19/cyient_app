import { mpplEndpoints } from '@/api-callers/api-endpoints';
import type { MpplApi } from '@/types/api';

/** The PO details of a PO line from the daily PO data. */
export const getPoLine = async (api: MpplApi, poNumber: string, lineNumber: number, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.lookup.poLine, { path: { poNumber, lineNumber }, signal })).data;

/** The customer, segment, Sourcing Lead and escalation levels for a project and commodity, from the sourcing master. */
export const getSourcingLookup = async (api: MpplApi, projectId: number, commodityId: number, signal?: AbortSignal) =>
  (await api.get(mpplEndpoints.lookup.sourcing, { query: { projectId, commodityId }, signal })).data;
