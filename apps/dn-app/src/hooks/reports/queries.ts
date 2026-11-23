import { useQuery } from '@tanstack/react-query';
import { dnTags } from '@/api-callers/api-tags';
import { getSummary } from '@/api-callers/reports/summary.api';
import { useDnApi } from '@/hooks/useDnApi';

/** The DN summary: submitted deviations by outcome, in total and by month of the request date. */
export function useSummary(from: string | undefined, to: string | undefined) {
  const api = useDnApi();
  return useQuery({
    queryKey: dnTags.report.summary(from, to),
    queryFn: ({ signal }) => getSummary(api, from, to, signal),
  });
}
