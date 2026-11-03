import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCcApi } from '../../lib/api';
import { complaintKeys, type ComplaintListQuery } from './keys';

/** External complaints, paged, filtered and sorted on the server. */
export function useComplaintList(query: ComplaintListQuery) {
  const api = useCcApi();
  return useQuery({
    queryKey: complaintKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/complaints', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's Pending Actions: their open D5 actions and complaints back with them to close. */
export function usePendingComplaints(page: number, pageSize: number) {
  const api = useCcApi();
  return useQuery({
    queryKey: complaintKeys.pending(page, pageSize),
    queryFn: ({ signal }) => api.get('/api/v1/complaints/pending', { query: { page, pageSize }, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One complaint with its first page, team, D4 to D8, the actions open to the user and its version. */
export function useComplaint(publicId: string) {
  const api = useCcApi();
  return useQuery({
    queryKey: complaintKeys.detail(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/complaints/{publicId}', { path: { publicId }, signal })).data,
  });
}

/** The published complaints of a customer, to pick the one a repeat complaint repeats; asked only when needed. */
export function useEarlierComplaints(customerId: number | null, excluding: string | undefined, enabled: boolean) {
  const api = useCcApi();
  return useQuery({
    queryKey: complaintKeys.earlier(customerId ?? 0, excluding),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/complaints/earlier', { query: { customerId: customerId ?? 0, excluding }, signal })).data,
    enabled: enabled && customerId !== null,
  });
}

export function useComplaintLog(publicId: string) {
  const api = useCcApi();
  return useQuery({
    queryKey: complaintKeys.log(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/complaints/{publicId}/log', { path: { publicId }, signal })).data,
  });
}

export function useComplaintDocuments(publicId: string, allVersions: boolean) {
  const api = useCcApi();
  return useQuery({
    queryKey: complaintKeys.documents(publicId, allVersions),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/complaints/{publicId}/documents', { path: { publicId }, query: { allVersions }, signal })).data,
  });
}
