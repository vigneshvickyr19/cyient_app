import type { JobItem } from '@cyient/api-client/platform';
import { formatDateTime, humanize } from '@cyient/shared-utils';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Button } from '../../index';
import { ConfirmDialog } from '../../index';
import { InlineAlert, SectionCard, StatusChip } from '../../index';
import { ErrorState } from '../../index';
import { SectionSkeleton } from '../../index';
import { PageHeader } from '../../index';
import { SimpleTable, type SimpleColumn } from '../../index';
import { errorMessage } from '../../index';
import { useJobRunOutcomes, useJobs, useRunJob, type JobRunOutcome, duration } from './queries';

/** What a finished run says: the API's message, or when it ran and how long it took. */
function outcomeText(outcome: JobRunOutcome): string {
  if (outcome.result) {
    const run = outcome.result.data;
    return outcome.result.message ?? `Finished: started ${formatDateTime(run.startedAt)}, took ${duration(run.durationMs)}.`;
  }
  return errorMessage(outcome.error, 'The job failed.');
}

/** The daily jobs with their schedule, and running one now. */
export default function JobsPage() {
  const jobs = useJobs();
  const run = useRunJob();
  const outcomes = useJobRunOutcomes();
  const [confirming, setConfirming] = useState<JobItem | null>(null);
  const latest = outcomes.at(-1);
  const lastOf = (name: string) => outcomes.findLast((outcome) => outcome.name === name);

  const columns: readonly SimpleColumn<JobItem>[] = [
    {
      key: 'name',
      header: 'Job',
      render: (job) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {humanize(job.name)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {job.name}
          </Typography>
        </Stack>
      ),
    },
    { key: 'dailyAt', header: 'Runs daily at', render: (job) => `${job.dailyAt} (${job.timeZone})` },
    { key: 'status', header: 'Status', render: (job) => <StatusChip label={job.enabled ? 'On' : 'Switched off'} tone={job.enabled ? 'success' : 'neutral'} /> },
    { key: 'nextRun', header: 'Next run', render: (job) => (job.nextRun ? formatDateTime(job.nextRun) : 'Not scheduled') },
    {
      key: 'lastRun',
      header: 'Last run from this page',
      render: (job) => {
        const outcome = lastOf(job.name);
        if (!outcome) return <Typography variant="body2" color="text.secondary">Not run from here yet</Typography>;
        return (
          <Typography variant="body2" color={outcome.result ? 'text.primary' : 'error'}>
            {outcomeText(outcome)}
          </Typography>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (job) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<PlayArrowOutlinedIcon />}
          loading={run.isPending && run.variables === job.name}
          disabled={run.isPending}
          aria-label={`Run ${humanize(job.name)} now`}
          onClick={() => {
            setConfirming(job);
          }}
        >
          Run now
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Jobs" subtitle="The daily jobs, such as reminders and the directory sync. Run one now to try it or to catch up." />
      <Stack spacing={3}>
        {latest && (
          <InlineAlert severity={latest.result ? 'success' : 'error'} title={`${humanize(latest.name)} ${latest.result ? 'finished' : 'failed'}`}>
            {outcomeText(latest)}
          </InlineAlert>
        )}
        <SectionCard title="Daily jobs" flush>
          {jobs.isPending ? (
            <Box sx={{ p: 2 }}>
              <SectionSkeleton />
            </Box>
          ) : jobs.isError ? (
            <ErrorState title="We couldn't load the jobs" message={errorMessage(jobs.error)} onRetry={() => void jobs.refetch()} />
          ) : (
            <SimpleTable aria-label="Jobs" rows={jobs.data} columns={columns} getRowKey={(job) => job.name} emptyTitle="No jobs" />
          )}
        </SectionCard>
      </Stack>
      <ConfirmDialog
        open={confirming !== null}
        title={confirming ? `Run ${humanize(confirming.name)} now?` : ''}
        message={
          run.isPending
            ? 'The job is running. This can take a few minutes; the result shows here when it has finished.'
            : 'It runs now in this application, as it does on its schedule, and the result shows when it has finished.'
        }
        confirmLabel="Run now"
        loading={run.isPending}
        onClose={() => {
          setConfirming(null);
        }}
        onConfirm={() => {
          if (!confirming) return;
          run.mutate(confirming.name, {
            onSettled: () => {
              setConfirming(null);
            },
          });
        }}
      />
    </>
  );
}
