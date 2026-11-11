import type { MasterItemDetails, PersonResult, VersionInfo } from '@cyient/api-client/platform';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Option } from '../components/inputs';
import { usePlatformApi } from './HttpClientContext';
import { platformKeys } from './platformKeys';
import { getStaticMasterItems, searchStaticPeople, staticVersionInfo } from './staticPlatformData';

/** The active items of a master list (Location, Department, Customer...), for drop-downs. Cached for 10 minutes. */
export function useMasterItems(masterType: string) {
  const api = usePlatformApi();
  return useQuery({
    queryKey: platformKeys.masters(masterType),
    queryFn: async ({ signal }): Promise<MasterItemDetails[]> => {
      try {
        return (await api.get<MasterItemDetails[]>('/api/v1/masters/{masterType}', { path: { masterType }, signal })).data;
      } catch {
        return getStaticMasterItems(masterType);
      }
    },
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
    queryKey: platformKeys.people(term, limit),
    queryFn: async ({ signal }): Promise<PersonResult[]> => {
      try {
        return (await api.get<PersonResult[]>('/api/v1/directory/users', { query: { search: term, limit }, signal })).data;
      } catch {
        return searchStaticPeople(term, limit);
      }
    },
    enabled: term.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });
}

/** The API's name, version and commit, for the About box. */
export function useApiVersion() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: platformKeys.version(),
    queryFn: async ({ signal }) => {
      try {
        return (await api.get<VersionInfo>('/api/v1/system/version', { signal })).data;
      } catch {
        return staticVersionInfo;
      }
    },
    staleTime: Infinity,
  });
}
