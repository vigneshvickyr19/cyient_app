import type { paths } from '@cyient/api-client/platform';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { usePlatformApi } from '../../api/HttpClientContext';
import { useFileDownload } from '../../hooks/useFileDownload';
import { adminKeys } from '../adminKeys';

export type AuditQuery = NonNullable<paths['/api/v1/admin/audit']['get']['parameters']['query']>;

export function useAudit(query: AuditQuery) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.audit(query),
    queryFn: async ({ signal }) => api.get('/api/v1/admin/audit', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The audit trail with the same filters as an Excel file. */
export function useAuditExport() {
  const api = usePlatformApi();
  return useFileDownload((query: AuditQuery) => api.download('/api/v1/admin/audit/export', { query }), 'audit-trail.xlsx');
}
