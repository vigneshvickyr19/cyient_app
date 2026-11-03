import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMpplApi } from '../../lib/api';
import { sourcingKeys } from '../sourcing/keys';
import { issueKeys, type IssueListQuery } from './keys';

/** Open Issues, Fixed Issues or the user's drafts, paged, filtered and sorted on the server. */
export function useIssueList(query: IssueListQuery) {
  const api = useMpplApi();
  return useQuery({
    queryKey: issueKeys.list(query),
    queryFn: ({ signal }) => api.get('/api/v1/issues', { query, signal }),
    placeholderData: keepPreviousData,
  });
}

/** The open issues waiting for the signed-in Sourcing Lead, longest waiting first. */
export function usePendingIssues(page: number, pageSize: number) {
  const api = useMpplApi();
  return useQuery({
    queryKey: issueKeys.pending(page, pageSize),
    queryFn: ({ signal }) => api.get('/api/v1/issues/pending', { query: { page, pageSize }, signal }),
    placeholderData: keepPreviousData,
  });
}

/** One issue with its PO and sourcing details, escalations, the actions open to the user and its version. */
export function useIssue(publicId: string) {
  const api = useMpplApi();
  return useQuery({
    queryKey: issueKeys.detail(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/issues/{publicId}', { path: { publicId }, signal })).data,
  });
}

export function useIssueLog(publicId: string) {
  const api = useMpplApi();
  return useQuery({
    queryKey: issueKeys.log(publicId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/issues/{publicId}/log', { path: { publicId }, signal })).data,
  });
}

export function useIssueDocuments(publicId: string, allVersions: boolean) {
  const api = useMpplApi();
  return useQuery({
    queryKey: issueKeys.documents(publicId, allVersions),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/issues/{publicId}/documents', { path: { publicId }, query: { allVersions }, signal })).data,
  });
}

/** The PO details of a PO line from the daily PO data; asked for once both the PO number and the line are entered. */
export function usePoLine(poNumber: string, lineNumber: number | null) {
  const api = useMpplApi();
  return useQuery({
    queryKey: issueKeys.poLine(poNumber, lineNumber ?? 0),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/po-lines/{poNumber}/{lineNumber}', { path: { poNumber, lineNumber: lineNumber ?? 0 }, signal })).data,
    enabled: poNumber !== '' && lineNumber !== null,
    staleTime: 5 * 60_000,
  });
}

/** The customer, segment, Sourcing Lead and escalation levels for a project and commodity, from the sourcing master. */
export function useSourcingLookup(projectId: number | null, commodityId: number | null) {
  const api = useMpplApi();
  return useQuery({
    queryKey: sourcingKeys.lookup(projectId ?? 0, commodityId ?? 0),
    queryFn: async ({ signal }) =>
      (await api.get('/api/v1/sourcing/lookup', { query: { projectId: projectId ?? 0, commodityId: commodityId ?? 0 }, signal })).data,
    enabled: projectId !== null && commodityId !== null,
    staleTime: 5 * 60_000,
  });
}
