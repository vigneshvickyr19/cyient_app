import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ccTags } from '@/api-callers/api-tags';
import { getComplaint, getComplaintLog, listComplaints, listEarlierComplaints, listPendingComplaints } from '@/api-callers/complaints/complaint.api';
import { listComplaintDocuments } from '@/api-callers/complaints/document.api';
import { useCcApi } from '@/hooks/useCcApi';
import type { ComplaintListQuery } from '@/types/complaints';

/** External complaints, paged, filtered and sorted on the server. */
export function useComplaintList(query: ComplaintListQuery) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.complaint.list(query),
    queryFn: ({ signal }) => listComplaints(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's Pending Actions: their open D5 actions and complaints back with them to close. */
export function usePendingComplaints(page: number, pageSize: number) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.complaint.pending(page, pageSize),
    queryFn: ({ signal }) => listPendingComplaints(api, page, pageSize, signal),
    placeholderData: keepPreviousData,
  });
}

/** One complaint with its first page, team, D4 to D8, the actions open to the user and its version. */
export function useComplaint(publicId: string) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.complaint.detail(publicId),
    queryFn: ({ signal }) => getComplaint(api, publicId, signal),
  });
}

/** The published complaints of a customer, to pick the one a repeat complaint repeats; asked only when needed. */
export function useEarlierComplaints(customerId: number | null, excluding: string | undefined, enabled: boolean) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.complaint.earlier(customerId ?? 0, excluding),
    queryFn: ({ signal }) => listEarlierComplaints(api, customerId ?? 0, excluding, signal),
    enabled: enabled && customerId !== null,
  });
}

export function useComplaintLog(publicId: string) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.complaint.log(publicId),
    queryFn: ({ signal }) => getComplaintLog(api, publicId, signal),
  });
}

export function useComplaintDocuments(publicId: string, allVersions: boolean) {
  const api = useCcApi();
  return useQuery({
    queryKey: ccTags.complaint.documents(publicId, allVersions),
    queryFn: ({ signal }) => listComplaintDocuments(api, publicId, allVersions, signal),
  });
}
