import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDnApi } from '../../lib/api';
import { requestKeys, type RequestListQuery } from './keys';

/** All Requests / My Requests, paged and filtered on the server, with Pending With and Pending Role. */
export function useRequestList(query: RequestListQuery) {
  const api = useDnApi();
  return useQuery({
    queryKey: requestKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/requests', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's Pending Requests, also the initiator's after Require more details. */
export function usePendingRequests(page: number, pageSize: number) {
  const api = useDnApi();
  return useQuery({
    queryKey: requestKeys.pending(page, pageSize),
    queryFn: ({ signal }) => api.get('/api/v1/requests/pending', { query: { page, pageSize }, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One deviation with its reviewer sequence, the actions open to the user and its version. */
export function useRequest(publicId: string) {
  const api = useDnApi();
  return useQuery({
    queryKey: requestKeys.detail(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/requests/{publicId}', { path: { publicId }, signal })).data,
  });
}

/** The History tab: every workflow action with who, when, the step and the comment. */
export function useRequestHistory(publicId: string) {
  const api = useDnApi();
  return useQuery({
    queryKey: requestKeys.history(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/requests/{publicId}/history', { path: { publicId }, signal })).data,
  });
}

export function useRequestDocuments(publicId: string, allVersions: boolean) {
  const api = useDnApi();
  return useQuery({
    queryKey: requestKeys.documents(publicId, allVersions),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/requests/{publicId}/documents', { path: { publicId }, query: { allVersions }, signal })).data,
  });
}

/** The reviewer and approver boxes of a change category, in order, the head of department last. */
export function useReviewerBoxes(changeCategoryId: number | null) {
  const api = useDnApi();
  return useQuery({
    queryKey: requestKeys.boxes(changeCategoryId ?? 0),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/reviewer-boxes', { query: { changeCategoryId: changeCategoryId ?? 0 }, signal })).data,
    enabled: changeCategoryId !== null,
    staleTime: 5 * 60_000,
  });
}
