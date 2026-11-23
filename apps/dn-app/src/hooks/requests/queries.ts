import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { dnTags } from '@/api-callers/api-tags';
import { listRequestDocuments } from '@/api-callers/requests/document.api';
import { getRequest, getRequestHistory, listPendingRequests, listRequests } from '@/api-callers/requests/request.api';
import { listReviewerBoxes } from '@/api-callers/requests/reviewer-box.api';
import { useDnApi } from '@/hooks/useDnApi';
import type { RequestListQuery } from '@/types/requests';

/** All Requests / My Requests, paged and filtered on the server, with Pending With and Pending Role. */
export function useRequestList(query: RequestListQuery) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.request.list(query),
    queryFn: ({ signal }) => listRequests(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The signed-in user's Pending Requests, also the initiator's after Require more details. */
export function usePendingRequests(page: number, pageSize: number) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.request.pending(page, pageSize),
    queryFn: ({ signal }) => listPendingRequests(api, page, pageSize, signal),
    placeholderData: keepPreviousData,
  });
}

/** One deviation with its reviewer sequence, the actions open to the user and its version. */
export function useRequest(publicId: string) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.request.detail(publicId),
    queryFn: ({ signal }) => getRequest(api, publicId, signal),
  });
}

/** The History tab: every workflow action with who, when, the step and the comment. */
export function useRequestHistory(publicId: string) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.request.history(publicId),
    queryFn: ({ signal }) => getRequestHistory(api, publicId, signal),
  });
}

export function useRequestDocuments(publicId: string, allVersions: boolean) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.request.documents(publicId, allVersions),
    queryFn: ({ signal }) => listRequestDocuments(api, publicId, allVersions, signal),
  });
}

/** The reviewer and approver boxes of a change category, in order, the head of department last. */
export function useReviewerBoxes(changeCategoryId: number | null) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.request.boxes(changeCategoryId ?? 0),
    queryFn: ({ signal }) => listReviewerBoxes(api, changeCategoryId ?? 0, signal),
    enabled: changeCategoryId !== null,
    staleTime: 5 * 60_000,
  });
}
