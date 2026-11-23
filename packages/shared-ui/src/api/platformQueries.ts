import type { MasterItemDetails, PersonResult } from '@cyient/api-client/platform';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Option } from '../components/custom-select';
import { usePlatformApi } from './HttpClientContext';
import { platformTags } from './api-tags';
import { platformEndpoints } from './api-endpoints';

/** The active items of a master list (Location, Department, Customer...), for drop-downs. Cached for 10 minutes. */
export function useMasterItems(masterType: string) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: platformTags.masters(masterType),
    queryFn: async ({ signal }): Promise<MasterItemDetails[]> =>
      (await api.get(platformEndpoints.master.items, { path: { masterType }, signal })).data,
    staleTime: 10 * 60_000,
  });
}

/** The active items of a master list as drop-down options (id and name). */
export function useMasterOptions(masterType: string): Option<number>[] {
  return (useMasterItems(masterType).data ?? []).map((item) => ({ value: item.id, label: item.name }));
}

/** Active people by name, login or email, for the people picker; searches from 2 characters. */
export function usePeopleSearch(search: string, limit = 20) {
  const api = usePlatformApi();
  const term = search.trim();
  return useQuery({
    queryKey: platformTags.people(term, limit),
    queryFn: async ({ signal }): Promise<PersonResult[]> =>
      (await api.get(platformEndpoints.directory.users, { query: { search: term, limit }, signal })).data,
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

