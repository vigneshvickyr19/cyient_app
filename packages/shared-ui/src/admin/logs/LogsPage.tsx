import type { AppLogItem } from '@cyient/api-client/platform';
import { formatDateTime } from '@cyient/shared-utils';
import ExpandLessOutlinedIcon from '@mui/icons-material/ExpandLessOutlined';
import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import { Box, Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { SectionCard, StatusChip, type Tone } from '../../components/display';
import { ErrorState } from '../../components/ErrorState';
import { Dropdown } from '../../components/inputs';
import { SectionSkeleton } from '../../components/Loader';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { FilterBar, SearchField } from '../../components/SearchFilter';
import { SimpleTable, type SimpleColumn } from '../../components/SimpleTable';
import { errorMessage } from '../../errors/errorMessage';
import { useListState } from '../../hooks/useListState';
import { DateRangeFilter, orUndefined, toInt, UserFilter } from '../shared/filters';
import { useLogs } from './queries';

type LogFilters = Partial<Record<'level' | 'traceId' | 'userId' | 'userName' | 'search' | 'from' | 'to', string>>;

const levels = ['Information', 'Warning', 'Error', 'Fatal'] as const;

function levelTone(level: string | null): Tone {
  if (level === 'Error' || level === 'Fatal') return 'error';
  if (level === 'Warning') return 'warning';
  return 'neutral';
}

/** The technical log, newest first; search for a failed response's trace ID to see what happened. */
export default function LogsPage() {
  const list = useListState<LogFilters>(['level', 'traceId', 'userId', 'userName', 'search', 'from', 'to']);
  const { filters } = list;
  const [expanded, setExpanded] = useState<ReadonlySet<number>>(new Set());

  const logs = useLogs({
    Page: list.page,
    PageSize: list.pageSize,
    Level: orUndefined(filters.level),
    TraceId: orUndefined(filters.traceId),
    UserId: toInt(filters.userId),
    Search: orUndefined(filters.search),
    From: filters.from,
    To: filters.to,
  });

  const toggle = (id: number) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  const columns: readonly SimpleColumn<AppLogItem>[] = [
    { key: 'timestamp', header: 'When', width: '15%', render: (entry) => formatDateTime(entry.timestamp) },
    { key: 'level', header: 'Level', render: (entry) => <StatusChip label={entry.level ?? 'Unknown'} tone={levelTone(entry.level)} /> },
    {
      key: 'message',
      header: 'Message',
      width: '50%',
      render: (entry) => (
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {entry.message}
          </Typography>
          {entry.path && (
            <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
              {[entry.method, entry.path, entry.statusCode, entry.durationMs === null ? null : `${entry.durationMs} ms`].filter((part) => part !== null).join(' · ')}
            </Typography>
          )}
          {entry.exception && (
            <Collapse in={expanded.has(entry.id)} unmountOnExit>
              <Box
                component="pre"
                sx={{ m: 0, mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, overflowX: 'auto', typography: 'caption', fontFamily: 'monospace' }}
              >
                {entry.exception}
              </Box>
            </Collapse>
          )}
        </Stack>
      ),
    },
    { key: 'user', header: 'User', render: (entry) => entry.userName ?? '' },
    {
      key: 'traceId',
      header: 'Trace ID',
      render: (entry) => (
        <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>
          {entry.traceId}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: 'Details',
      align: 'right',
      render: (entry) =>
        entry.exception && (
          <Tooltip title={expanded.has(entry.id) ? 'Hide the error details' : 'Show the error details'}>
            <IconButton
              aria-label={expanded.has(entry.id) ? 'Hide the error details' : 'Show the error details'}
              aria-expanded={expanded.has(entry.id)}
              onClick={() => {
                toggle(entry.id);
              }}
            >
              {expanded.has(entry.id) ? <ExpandLessOutlinedIcon /> : <ExpandMoreOutlinedIcon />}
            </IconButton>
          </Tooltip>
        ),
    },
  ];

  return (
    <>
      <PageHeader title="Technical log" subtitle="What the API recorded, newest first. Search for the reference of an error to see what happened." />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <Dropdown<string>
          label="Level"
          value={filters.level ?? null}
          options={levels.map((level) => ({ value: level, label: level }))}
          emptyLabel="Any level"
          onChange={(level) => {
            list.setFilters({ level: level ?? undefined });
          }}
        />
        <SearchField
          label="Trace ID"
          placeholder="The reference of an error"
          value={filters.traceId ?? ''}
          onSearch={(traceId) => {
            list.setFilters({ traceId });
          }}
        />
        <UserFilter userId={filters.userId} userName={filters.userName} onChange={list.setFilters} />
        <SearchField
          label="Search"
          placeholder="Part of the message"
          value={filters.search ?? ''}
          onSearch={(search) => {
            list.setFilters({ search });
          }}
        />
        <DateRangeFilter from={filters.from} to={filters.to} onChange={list.setFilters} />
      </FilterBar>
      <SectionCard title="Entries" flush>
        {logs.isPending ? (
          <Box sx={{ p: 2 }}>
            <SectionSkeleton />
          </Box>
        ) : logs.isError ? (
          <ErrorState title="We couldn't load the log" message={errorMessage(logs.error)} onRetry={() => void logs.refetch()} />
        ) : (
          <SimpleTable
            aria-label="Technical log"
            rows={logs.data.data}
            columns={columns}
            getRowKey={(entry) => entry.id}
            emptyTitle={list.filtered ? 'No entries match' : 'The log is empty'}
            emptyMessage={list.filtered ? 'Try other filters, or clear them.' : undefined}
            footer={<Pagination page={list.page} pageSize={list.pageSize} meta={logs.data.meta} onChange={list.setPage} />}
          />
        )}
      </SectionCard>
    </>
  );
}
