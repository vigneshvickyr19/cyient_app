import { useQuery } from '@tanstack/react-query';
import { ecnTags } from '@/api-callers/api-tags';
import { getOpenEcnReport } from '@/api-callers/reports/report.api';
import { useEcnApi } from '@/hooks/useEcnApi';

/** The Report tab: open ECNs with the functions and members still holding open actions, for all customers or one. */
export function useOpenEcnReport(customerId: number | undefined) {
  const api = useEcnApi();
  return useQuery({
    queryKey: ecnTags.report.open(customerId),
    queryFn: ({ signal }) => getOpenEcnReport(api, customerId, signal),
  });
}
