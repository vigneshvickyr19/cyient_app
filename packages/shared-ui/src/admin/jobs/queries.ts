import type { ApiResult } from '@cyient/api-client';
import type { JobRunResult } from '@cyient/api-client/platform';
import { formatNumber, humanize } from '@cyient/shared-utils';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '../../index';
import { adminTags } from '../../api/api-tags';
import { platformEndpoints } from '../../api/api-endpoints';
import { toastMeta } from '../../notifications/MutationToasts';

export const duration = (ms: number) => (ms < 1000 ? `${ms} ms` : `${formatNumber(ms / 1000, 1)} seconds`);

export function useJobs() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminTags.jobs(),
    queryFn: async ({ signal }) => (await api.get(platformEndpoints.job.collection, { signal })).data,
  });
}

/** Runs a job now; the call answers when the job has finished. */
export function useRunJob() {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: adminTags.jobRun(),
    mutationFn: (name: string) => api.post(platformEndpoints.job.run, { path: { name } }),
    meta: toastMeta<ApiResult<JobRunResult>>({
      success: (result) => `${humanize(result.data.name)} finished in ${duration(result.data.durationMs)}.`,
      error: 'The job failed.',
    }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminTags.jobs(), exact: true });
    },
  });
}

export interface JobRunOutcome {
  name: string;
  result: ApiResult<JobRunResult> | undefined;
  error: Error | null;
}

/** The latest "Run now" of each job on this page, finished or failed, newest last. */
export function useJobRunOutcomes(): JobRunOutcome[] {
  return useMutationState({
    filters: { mutationKey: adminTags.jobRun() },
    select: (mutation) => ({
      name: String(mutation.state.variables),
      result: mutation.state.data as ApiResult<JobRunResult> | undefined,
      error: mutation.state.error,
    }),
  }).filter((outcome) => outcome.result !== undefined || outcome.error !== null);
}
