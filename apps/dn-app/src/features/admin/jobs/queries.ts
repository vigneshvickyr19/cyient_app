import type { ApiResult } from '@cyient/api-client';
import type { JobRunResult } from '@cyient/api-client/platform';
import { useMutation, useMutationState, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePlatformApi } from '@cyient/shared-ui';
import { adminKeys } from '../adminKeys';

export function useJobs() {
  const api = usePlatformApi();
  return useQuery({
    queryKey: adminKeys.jobs(),
    queryFn: async ({ signal }) => (await api.get('/api/v1/admin/jobs', { signal })).data,
  });
}

/** Runs a job now; the call answers when the job has finished. */
export function useRunJob() {
  const api = usePlatformApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: adminKeys.jobRun(),
    mutationFn: (name: string) => api.post('/api/v1/admin/jobs/{name}/run', { path: { name } }),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.jobs(), exact: true });
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
    filters: { mutationKey: adminKeys.jobRun() },
    select: (mutation) => ({
      name: String(mutation.state.variables),
      result: mutation.state.data as ApiResult<JobRunResult> | undefined,
      error: mutation.state.error,
    }),
  }).filter((outcome) => outcome.result !== undefined || outcome.error !== null);
}
