import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ccTags } from '@/api-callers/api-tags';
import { getInternalComplaint, listInternalComplaints } from '@/api-callers/internal/internal-complaint.api';
import { useCcApi } from '@/hooks/useCcApi';
import type { InternalListQuery } from '@/types/complaints';

/** Internal complaints, paged and filtered on the server. */
export function useInternalList(query: InternalListQuery) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.internal.list(query),
    queryFn: ({ signal }) => listInternalComplaints(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** One internal complaint with its action lines and its version. */
export function useInternalComplaint(publicId: string) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.internal.detail(publicId),
    queryFn: ({ signal }) => getInternalComplaint(api, publicId, signal),
  });
}
