import { useQuery } from '@tanstack/react-query';
import { useDnApi } from '../../lib/api';

const reportKeys = {
  all: ['dn', 'reports'] as const,
  summary: (from: string | undefined, to: string | undefined) => [...reportKeys.all, 'summary', from ?? null, to ?? null] as const,
};

/** The DN summary: submitted deviations by outcome, in total and by month of the request date. */
export function useSummary(from: string | undefined, to: string | undefined) {
  const api = useDnApi();
  return useQuery({
    queryKey: reportKeys.summary(from, to),
    queryFn: async ({ signal }) => (await api.get('/api/v1/reports/summary', { query: { from, to }, signal })).data,
  });
}
