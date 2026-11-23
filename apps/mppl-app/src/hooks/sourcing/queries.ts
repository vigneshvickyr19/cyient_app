import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { mpplTags } from '@/api-callers/api-tags';
import { getSourcingRow, listSourcing } from '@/api-callers/sourcing/sourcing.api';
import { useMpplApi } from '@/hooks/useMpplApi';
import type { SourcingListQuery } from '@/types/issues';

/** The sourcing master, paged and filtered on the server. */
export function useSourcingList(query: SourcingListQuery) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.sourcing.list(query),
    queryFn: ({ signal }) => listSourcing(api, query, signal),
    placeholderData: keepPreviousData,
  });
}

/** One row with its current version, read again before it is changed. */
export function useSourcingRow(id: number) {
  const api = useMpplApi();
  return useQuery({
    queryKey: mpplTags.sourcing.row(id),
    queryFn: ({ signal }) => getSourcingRow(api, id, signal),
  });
}
