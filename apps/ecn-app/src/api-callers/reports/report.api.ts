import { ecnEndpoints } from '@/api-callers/api-endpoints';
import type { EcnApi } from '@/types/api';

/** The Report tab: open ECNs with the functions and members still holding open actions, for all customers or one. */
export const getOpenEcnReport = async (api: EcnApi, customerId: number | undefined, signal?: AbortSignal) =>
  (await api.get(ecnEndpoints.report.openReport, { query: { customerId }, signal })).data;

export const exportOpenEcnReport = (api: EcnApi, customerId: number | undefined) => api.download(ecnEndpoints.report.openReportExport, { query: { customerId } });

export const downloadTracker = (api: EcnApi, customerId: number | undefined) => api.download(ecnEndpoints.report.tracker, { query: { customerId } });
