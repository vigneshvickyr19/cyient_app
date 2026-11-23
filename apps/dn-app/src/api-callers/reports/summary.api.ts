import { dnEndpoints } from '@/api-callers/api-endpoints';
import type { DnApi } from '@/types/api';

/** The DN summary: submitted deviations by outcome, in total and by month of the request date. */
export const getSummary = async (api: DnApi, from: string | undefined, to: string | undefined, signal?: AbortSignal) =>
  (await api.get(dnEndpoints.summary.report, { query: { from, to }, signal })).data;
