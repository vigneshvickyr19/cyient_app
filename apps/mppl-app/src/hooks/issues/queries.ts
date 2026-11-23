import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mpplTags } from '@/api-callers/api-tags';
import { listIssueDocuments } from '@/api-callers/issues/document.api';
import { getIssue, getIssueLog, listIssues, listPendingIssues } from '@/api-callers/issues/issue.api';
import { getPoLine, getSourcingLookup } from '@/api-callers/issues/lookup.api';
import { useMpplApi } from '@/hooks/useMpplApi';
import type { IssueListQuery } from '@/types/issues';

/** Open Issues, Fixed Issues or the user's drafts, paged, filtered and sorted on the server. */
export function useIssueList(query: IssueListQuery) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.issue.list(query),
    queryFn: ({ signal }) => listIssues(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** The open issues waiting for the signed-in Sourcing Lead, longest waiting first. */
export function usePendingIssues(page: number, pageSize: number) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.issue.pending(page, pageSize),
    queryFn: ({ signal }) => listPendingIssues(api, page, pageSize, signal),
    placeholderData: keepPreviousData,
  });
}

/** One issue with its PO and sourcing details, escalations, the actions open to the user and its version. */
export function useIssue(publicId: string) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.issue.detail(publicId),
    queryFn: ({ signal }) => getIssue(api, publicId, signal),
  });
}

export function useIssueLog(publicId: string) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.issue.log(publicId),
    queryFn: ({ signal }) => getIssueLog(api, publicId, signal),
  });
}

export function useIssueDocuments(publicId: string, allVersions: boolean) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.issue.documents(publicId, allVersions),
    queryFn: ({ signal }) => listIssueDocuments(api, publicId, allVersions, signal),
  });
}

/** The PO details of a PO line from the daily PO data; asked for once both the PO number and the line are entered. */
export function usePoLine(poNumber: string, lineNumber: number | null) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.issue.poLine(poNumber, lineNumber ?? 0),
    queryFn: ({ signal }) => getPoLine(api, poNumber, lineNumber ?? 0, signal),
    enabled: poNumber !== '' && lineNumber !== null,
    staleTime: 5 * 60_000,
  });
}

/** The customer, segment, Sourcing Lead and escalation levels for a project and commodity, from the sourcing master. */
export function useSourcingLookup(projectId: number | null, commodityId: number | null) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.sourcing.lookup(projectId ?? 0, commodityId ?? 0),
    queryFn: ({ signal }) => getSourcingLookup(api, projectId ?? 0, commodityId ?? 0, signal),
    enabled: projectId !== null && commodityId !== null,
    staleTime: 5 * 60_000,
  });
}
