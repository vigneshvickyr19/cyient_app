import { useQuery } from '@tanstack/react-query';
import { useEcnApi } from '../../lib/api';

export const reportKeys = {
  all: ['ecn', 'report'] as const,
  open: (customerId: number | undefined) => [...reportKeys.all, 'open', customerId ?? 'all'] as const,
};

/** The Report tab: open ECNs with the functions and members still holding open actions, for all customers or one. */
export function useOpenEcnReport(customerId: number | undefined) {
  const api = useEcnApi();
  return useQuery({
    queryKey: reportKeys.open(customerId),
    queryFn: async ({ signal }) => (await api.get('/api/v1/report', { query: { customerId }, signal })).data,
  });
}
