import type { paths } from '@cyient/api-client/platform';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { useFileDownload } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';

export type AuditQuery = NonNullable<paths[typeof platformEndpoints.audit.collection]['get']['parameters']['query']>;

export function useAudit(query: AuditQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.audit(query),
    queryFn: async ({ signal }) => api.get(platformEndpoints.audit.collection, { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The audit trail with the same filters as an Excel file. */
export function useAuditExport() {
  const api = usePlatformApi();
  return useFileDownload((query: AuditQuery) => api.download(platformEndpoints.audit.export, { query }), 'audit-trail.xlsx');
}
