import type { NumberingCheckResult, SequenceItem } from '@cyient/api-client/platform';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { InlineAlert, SectionCard, StatusChip } from '../../components/display';
import { ErrorState } from '../../components/ErrorState';
import { SectionSkeleton } from '../../components/Loader';
import { PageHeader } from '../../components/PageHeader';
import { SimpleTable, type SimpleColumn } from '../../components/SimpleTable';
import { errorMessage } from '../../errors/errorMessage';
import { useNumberingCheck, useSequences } from './queries';

const counterColumns: readonly SimpleColumn<SequenceItem>[] = [
  { key: 'key', header: 'Counter', render: (item) => item.key },
  { key: 'year', header: 'Year', render: (item) => item.year },
  { key: 'lastNumber', header: 'Last number given', align: 'right', render: (item) => item.lastNumber },
];

/** Up to 20 numbers, then how many more. */
function numberList(numbers: readonly number[]): string {
  if (numbers.length === 0) return 'None';
  const shown = numbers.slice(0, 20).join(', ');
  return numbers.length > 20 ? `${shown} and ${numbers.length - 20} more` : shown;
}

function problems(result: NumberingCheckResult): string[] {
  const found: string[] = [];
  if (result.missing.length > 0) found.push(`Missing: ${numberList(result.missing)}`);
  if (result.repeated.length > 0) found.push(`Repeated: ${numberList(result.repeated)}`);
  if (result.counterBehind) found.push(`The counter (${result.lastNumber}) is below the highest number used (${result.highestUsed}).`);
  return found;
}

const checkColumns: readonly SimpleColumn<NumberingCheckResult>[] = [
  { key: 'key', header: 'Counter', render: (result) => `${result.key} ${result.year}` },
  {
    key: 'state',
    header: 'Result',
    render: (result) => <StatusChip label={result.isHealthy ? 'In order' : 'Needs attention'} tone={result.isHealthy ? 'success' : 'error'} />,
  },
  { key: 'lastNumber', header: 'Counter', align: 'right', render: (result) => result.lastNumber },
  { key: 'highestUsed', header: 'Highest used', align: 'right', render: (result) => result.highestUsed },
  { key: 'usedCount', header: 'Numbers used', align: 'right', render: (result) => result.usedCount },
  {
    key: 'problems',
    header: 'Problems',
    render: (result) =>
      result.isHealthy ? (
        <Typography variant="body2" color="text.secondary">
          None
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {problems(result).map((problem) => (
            <Typography key={problem} variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {problem}
            </Typography>
          ))}
        </Stack>
      ),
  },
];

/** The request-number counters, and a check that no number is missing or repeated. Read-only. */
export default function NumberingPage() {
  const sequences = useSequences();
  const [requested, setRequested] = useState(false);
  const check = useNumberingCheck(requested);
  const unhealthy = check.data?.filter((result) => !result.isHealthy) ?? [];

  return (
    <>
      <PageHeader
        title="Numbering"
        subtitle="Request numbers are given out without gaps. The check compares each counter with the numbers actually used."
        actions={
          <Button
            variant="contained"
            startIcon={<FactCheckOutlinedIcon />}
            loading={check.isFetching}
            onClick={() => {
              if (requested) void check.refetch();
              else setRequested(true);
            }}
          >
            Check numbering
          </Button>
        }
      />
      <Stack spacing={3}>
        {check.isError && (
          <ErrorState title="The check could not be run" message={errorMessage(check.error)} onRetry={() => void check.refetch()} />
        )}
        {check.data && (
          <SectionCard title="Check results">
            <Stack spacing={2}>
              {unhealthy.length === 0 ? (
                <InlineAlert severity="success" title="Numbering is in order">
                  No missing or repeated numbers, and no counter is below a number already used.
                </InlineAlert>
              ) : (
                <InlineAlert severity="error" title={`${unhealthy.length} ${unhealthy.length === 1 ? 'counter needs' : 'counters need'} attention`}>
                  Numbers are missing or repeated, or a counter is below a number already used. Ask support to look into it before more
                  requests are numbered.
                </InlineAlert>
              )}
              <SimpleTable
                aria-label="Numbering check results"
                rows={check.data}
                columns={checkColumns}
                getRowKey={(result) => `${result.key}-${result.year}`}
                emptyTitle="No counters to check"
              />
            </Stack>
          </SectionCard>
        )}
        <SectionCard title="Counters" flush>
          {sequences.isPending ? (
            <Box sx={{ p: 2 }}>
              <SectionSkeleton />
            </Box>
          ) : sequences.isError ? (
            <ErrorState title="We couldn't load the counters" message={errorMessage(sequences.error)} onRetry={() => void sequences.refetch()} />
          ) : (
            <SimpleTable
              aria-label="Counters"
              rows={sequences.data}
              columns={counterColumns}
              getRowKey={(item) => `${item.key}-${item.year}`}
              emptyTitle="No counters yet"
              emptyMessage="A counter starts when the first request of a year is numbered."
            />
          )}
        </SectionCard>
      </Stack>
    </>
  );
}
