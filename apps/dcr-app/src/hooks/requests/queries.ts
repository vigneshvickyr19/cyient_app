import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dcrTags } from '@/api-callers/api-tags';
import { listRequestDocuments } from '@/api-callers/requests/document.api';
import { getRequest, getRequestLog, listPendingRequests, listRequests } from '@/api-callers/requests/request.api';
import { useDcrApi } from '@/hooks/useDcrApi';
import type { RequestListQuery } from '@/types/requests';

/** All Requests / My Requests, paged and filtered on the server. */
export function useRequestList(query: RequestListQuery) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.request.list(query),
    queryFn: ({ signal }) => listRequests(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's Pending Actions. */
export function usePendingRequests(page: number, pageSize: number) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.request.pending(page, pageSize),
    queryFn: ({ signal }) => listPendingRequests(api, page, pageSize, signal),
    placeholderData: keepPreviousData,
  });
}

/** One DCR with its clause lines, approvers, the actions open to the user and its version. */
export function useRequest(publicId: string) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.request.detail(publicId),
    queryFn: ({ signal }) => getRequest(api, publicId, signal),
  });
}

export function useRequestLog(publicId: string) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.request.log(publicId),
    queryFn: ({ signal }) => getRequestLog(api, publicId, signal),
  });
}

export function useRequestDocuments(publicId: string, allVersions: boolean) {
  const api = useDcrApi();
  return useQuery({
    queryKey: dcrTags.request.documents(publicId, allVersions),
    queryFn: ({ signal }) => listRequestDocuments(api, publicId, allVersions, signal),
  });
}
