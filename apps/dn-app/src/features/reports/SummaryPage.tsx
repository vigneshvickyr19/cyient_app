import type { DnSummary, DnSummaryMonth } from '@cyient/api-client/dn';
import { DateField, EmptyState, ErrorState, errorMessage, FilterBar, PageHeader, SectionCard, SectionSkeleton, SimpleTable, useListState } from '@cyient/shared-ui';
import { formatNumber } from '@cyient/shared-utils';
import { Box, Card, CardContent, LinearProgress, Stack, Typography, type LinearProgressProps } from '@mui/material';
import { useSummary } from './queries';

interface Filters {
  from?: string;
  to?: string;
}

type Colour = NonNullable<LinearProgressProps['color']>;

/** The outcomes, in the order and colours the page shows them. */
const outcomes: { key: keyof Omit<DnSummary, 'months' | 'total'>; label: string; colour: Colour }[] = [
  { key: 'approved', label: 'Approved', colour: 'success' },
  { key: 'rejected', label: 'Rejected', colour: 'error' },
  { key: 'pending', label: 'Pending', colour: 'info' },
  { key: 'moreDetailsRequired', label: 'More details required', colour: 'warning' },
  { key: 'closedByAdmin', label: 'Closed by admin', colour: 'inherit' },
];

const closedOf = (month: DnSummaryMonth) => Math.max(0, month.raised - month.approved - month.rejected - month.open);

/** The parts of a month's bar: raised = approved + rejected + open + closed by admin. */
const barParts: { label: string; colour: string; count: (month: DnSummaryMonth) => number }[] = [
  { label: 'Approved', colour: 'success.main', count: (month) => month.approved },
  { label: 'Rejected', colour: 'error.main', count: (month) => month.rejected },
  { label: 'Open', colour: 'info.main', count: (month) => month.open },
  { label: 'Closed by admin', colour: 'grey.500', count: closedOf },
];

const monthName = (month: DnSummaryMonth) =>
  new Intl.DateTimeFormat('en-IN', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(month.year, month.month - 1, 1)));

const share = (count: number, total: number) => (total === 0 ? 0 : (count / total) * 100);

function OutcomeCards({ summary }: { summary: DnSummary }) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' } }}>
      <Card>
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Submitted
          </Typography>
          <Typography variant="h4" component="p">
            {formatNumber(summary.total, 0)}
          </Typography>
        </CardContent>
      </Card>
      {outcomes.map((outcome) => {
        const count = summary[outcome.key];
        const percent = share(count, summary.total);
        return (
          <Card key={outcome.key}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                {outcome.label}
              </Typography>
              <Typography variant="h4" component="p">
                {formatNumber(count, 0)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={percent}
                color={outcome.colour}
                aria-label={`${outcome.label}: ${Math.round(percent)}% of submitted`}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(percent)}% of submitted
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

function MonthBar({ month, widest }: { month: DnSummaryMonth; widest: number }) {
  return (
    <Box aria-hidden sx={{ display: 'flex', height: 14, width: `${share(month.raised, widest)}%`, minWidth: 4, borderRadius: 1, overflow: 'hidden' }}>
      {barParts
        .filter((part) => part.count(month) > 0)
        .map((part) => (
          <Box key={part.label} sx={{ width: `${share(part.count(month), month.raised)}%`, bgcolor: part.colour }} />
        ))}
    </Box>
  );
}

function ByMonth({ months }: { months: readonly DnSummaryMonth[] }) {
  const widest = Math.max(1, ...months.map((month) => month.raised));

  return (
    <SectionCard
      title="By month"
      subheader="Deviations raised each month (by request date) and where they stand now"
      flush
      actions={
        <Stack direction="row" useFlexGap spacing={2} sx={{ flexWrap: 'wrap', display: { xs: 'none', sm: 'flex' } }}>
          {barParts.map((part) => (
            <Stack key={part.label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: part.colour }} />
              <Typography variant="caption">{part.label}</Typography>
            </Stack>
          ))}
        </Stack>
      }
    >
      <SimpleTable<DnSummaryMonth>
        aria-label="Deviations by month"
        rows={months}
        getRowKey={(row) => `${row.year}-${row.month}`}
        columns={[
          { key: 'month', header: 'Month', width: 110, render: monthName },
          { key: 'bar', header: '', render: (row) => <MonthBar month={row} widest={widest} /> },
          { key: 'raised', header: 'Raised', align: 'right', width: 80, render: (row) => row.raised },
          { key: 'approved', header: 'Approved', align: 'right', width: 90, render: (row) => row.approved },
          { key: 'rejected', header: 'Rejected', align: 'right', width: 90, render: (row) => row.rejected },
          { key: 'open', header: 'Open', align: 'right', width: 80, render: (row) => row.open },
          { key: 'closed', header: 'Closed by admin', align: 'right', width: 90, render: closedOf },
        ]}
        emptyTitle="No deviations in these months"
      />
    </SectionCard>
  );
}

/** The DN summary report: submitted deviations by outcome, and by month for the graph, between two request dates. */
export function SummaryPage() {
  const list = useListState<Filters>(['from', 'to']);
  const { from, to } = list.filters;
  const summary = useSummary(from, to);

  return (
    <>
      <PageHeader title="DN summary" subtitle="Submitted deviations by outcome and by month" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <DateField label="Request date from" value={from ?? null} maxDate={to} onChange={(value) => { list.setFilters({ from: value ?? undefined }); }} />
        <DateField label="Request date to" value={to ?? null} minDate={from} onChange={(value) => { list.setFilters({ to: value ?? undefined }); }} />
      </FilterBar>

      {summary.isPending ? (
        <SectionSkeleton />
      ) : summary.isError ? (
        <ErrorState message={errorMessage(summary.error)} onRetry={() => void summary.refetch()} />
      ) : summary.data.total === 0 ? (
        <EmptyState
          title={list.filtered ? 'No deviations between these dates' : 'No deviations submitted yet'}
          message={list.filtered ? 'Try a wider date range.' : undefined}
        />
      ) : (
        <Stack spacing={3}>
          <OutcomeCards summary={summary.data} />
          <ByMonth months={summary.data.months} />
        </Stack>
      )}
    </>
  );
}
