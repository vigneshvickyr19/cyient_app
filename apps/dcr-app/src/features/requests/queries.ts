import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDcrApi } from '../../lib/api';
import { requestKeys, type RequestListQuery } from './keys';

/** All Requests / My Requests, paged and filtered on the server. */
export function useRequestList(query: RequestListQuery) {
  const api = useDcrApi();
  return useQuery({
    queryKey: requestKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/requests', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's Pending Actions. */
export function usePendingRequests(page: number, pageSize: number) {
  const api = useDcrApi();
  return useQuery({
    queryKey: requestKeys.pending(page, pageSize),
    queryFn: ({ signal }) => api.get('/api/v1/requests/pending', { query: { page, pageSize }, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One DCR with its clause lines, approvers, the actions open to the user and its version. */
export function useRequest(publicId: string) {
  const api = useDcrApi();
  return useQuery({
    queryKey: requestKeys.detail(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/requests/{publicId}', { path: { publicId }, signal })).data,
  });
}

export function useRequestLog(publicId: string) {
  const api = useDcrApi();
  return useQuery({
    queryKey: requestKeys.log(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/requests/{publicId}/log', { path: { publicId }, signal })).data,
  });
}

export function useRequestDocuments(publicId: string, allVersions: boolean) {
  const api = useDcrApi();
  return useQuery({
    queryKey: requestKeys.documents(publicId, allVersions),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/requests/{publicId}/documents', { path: { publicId }, query: { allVersions }, signal })).data,
  });
}
