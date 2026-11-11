import type { PageMeta } from '@cyient/api-client';
import type { AuditEntry, EmailListItem, HistoryEntry } from '@cyient/api-client/platform';
import { formatDateTime, humanize } from '@cyient/shared-utils';
import { Tab, Tabs } from '@mui/material';
import { keepPreviousData, useQuery, type QueryKey } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { platformPermissions } from '../auth/permissions';
import { RequirePermission } from '../auth/RequirePermission';
import { errorMessage } from '../errors/errorMessage';
import { SectionCard, StatusChip } from './display';
import { ErrorState } from './ErrorState';
import { SectionSkeleton } from './Loader';
import { Pagination } from './Pagination';
import { SimpleTable } from './SimpleTable';

/** Emails and audit records are read 20 at a time. */
export const recordPageSize = 20;

/** One page of a list, as the API's typed client returns it. */
export interface RecordPage<Row> {
  data: readonly Row[];
  meta: PageMeta | null;
}

/** What a loader is given: the 1-based page and its size (for the paged lists) and the query's abort signal. */
export interface RecordPageRequest {
  page: number;
  pageSize: number;
  signal: AbortSignal;
}

/** Calls to the app's own administration endpoints for one record (…/history, …/emails, …/audit). */
export interface RecordHistoryLoaders {
  history: (request: { signal: AbortSignal }) => Promise<readonly HistoryEntry[]>;
  emails: (request: RecordPageRequest) => Promise<RecordPage<EmailListItem>>;
  audit: (request: RecordPageRequest) => Promise<RecordPage<AuditEntry>>;
}

/** A tab an app adds after the three shared ones, for example a note's open tasks. */
export interface RecordExtraTab {
  value: string;
  label: string;
  /** Shown to holders of any of these permission codes. */
  anyOf: readonly string[];
  content: ReactNode;
}

export interface RecordHistoryTabsProps {
  loaders: RecordHistoryLoaders;
  /**
   * The start of the query keys, for example [...manageKeys.all, 'record', publicId], so that the app's
   * invalidation of its administration data also reads these again.
   */
  queryKey: QueryKey;
  /** Shows a workflow stage code in the history; by default the code as it is. */
  formatStage?: (stage: string) => string;
  extraTabs?: readonly RecordExtraTab[];
  /** The open tab, when the page keeps it (for example in the address); by default the component keeps it. */
  tab?: string;
  onTabChange?: (tab: string) => void;
}

function HistoryTab({ loaders, queryKey, formatStage }: Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey' | 'formatStage'>) {
  const history = useQuery({
    queryKey: [...queryKey, 'history'],
    queryFn: ({ signal }) => loaders.history({ signal }),
  });
  if (history.isPending) return <SectionSkeleton />;
  if (history.isError) return <ErrorState message={errorMessage(history.error)} onRetry={() => void history.refetch()} />;
  return (
    <SimpleTable<HistoryEntry>
      aria-label="History"
      rows={history.data}
      getRowKey={(row) => `${row.at}-${row.kind}-${row.field ?? ''}-${row.itemId ?? ''}-${row.action}`}
      columns={[
        { key: 'at', header: 'When', render: (row) => formatDateTime(row.at), width: 170 },
        { key: 'user', header: 'Who', render: (row) => row.user?.name ?? 'System', width: 150 },
        {
          key: 'what',
          header: 'What',
          render: (row) => [humanize(row.action), row.stage && formatStage ? formatStage(row.stage) : row.stage, row.item].filter(Boolean).join(' · '),
        },
        {
          key: 'detail',
          header: 'Detail',
          render: (row) => (row.field ? `${row.field}: ${row.oldValue ?? '—'} → ${row.newValue ?? '—'}` : (row.comment ?? '')),
        },
      ]}
      emptyTitle="No history"
    />
  );
}

function EmailsTab({ loaders, queryKey }: Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'>) {
  const [page, setPage] = useState(1);
  const emails = useQuery({
    queryKey: [...queryKey, 'emails', page],
    queryFn: ({ signal }) => loaders.emails({ page, pageSize: recordPageSize, signal }),
    placeholderData: keepPreviousData,
  });
  if (emails.isPending) return <SectionSkeleton />;
  if (emails.isError) return <ErrorState message={errorMessage(emails.error)} onRetry={() => void emails.refetch()} />;
  return (
    <SimpleTable<EmailListItem>
      aria-label="Emails"
      rows={emails.data.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'createdAt', header: 'Queued', render: (row) => formatDateTime(row.createdAt), width: 170 },
        { key: 'event', header: 'Event', render: (row) => humanize(row.eventType) },
        { key: 'to', header: 'To', render: (row) => row.toAddresses },
        { key: 'subject', header: 'Subject', render: (row) => row.subject },
        {
          key: 'status',
          header: 'Status',
          render: (row) => <StatusChip label={humanize(row.status)} tone={row.status === 'Failed' ? 'error' : row.status === 'Sent' ? 'success' : 'neutral'} />,
        },
      ]}
      emptyTitle="No emails"
      footer={<Pagination page={page} pageSize={recordPageSize} meta={emails.data.meta} onChange={setPage} pageSizeOptions={[recordPageSize]} />}
    />
  );
}

function AuditTab({ loaders, queryKey }: Pick<RecordHistoryTabsProps, 'loaders' | 'queryKey'>) {
  const [page, setPage] = useState(1);
  const audit = useQuery({
    queryKey: [...queryKey, 'audit', page],
    queryFn: ({ signal }) => loaders.audit({ page, pageSize: recordPageSize, signal }),
    placeholderData: keepPreviousData,
  });
  if (audit.isPending) return <SectionSkeleton />;
  if (audit.isError) return <ErrorState message={errorMessage(audit.error)} onRetry={() => void audit.refetch()} />;
  return (
    <SimpleTable<AuditEntry>
      aria-label="Audit trail"
      rows={audit.data.data}
      getRowKey={(row) => row.id}
      columns={[
        { key: 'changedAt', header: 'When', render: (row) => formatDateTime(row.changedAt), width: 170 },
        { key: 'user', header: 'Who', render: (row) => row.user?.name ?? 'System', width: 150 },
        { key: 'action', header: 'Action', render: (row) => humanize(row.action), width: 110 },
        { key: 'field', header: 'Field', render: (row) => row.fieldName ?? row.tableName },
        { key: 'change', header: 'Change', render: (row) => (row.fieldName ? `${row.oldValue ?? '—'} → ${row.newValue ?? '—'}` : '') },
      ]}
      emptyTitle="No audit records"
      footer={<Pagination page={page} pageSize={recordPageSize} meta={audit.data.meta} onChange={setPage} pageSizeOptions={[recordPageSize]} />}
    />
  );
}

/**
 * A record's History, Emails and Audit trail for administrators, in a "Record" card: the history and audit trail for
 * holders of platform.audit.view, the emails for holders of platform.email.manage. Emails and audit records are paged.
 */
export function RecordHistoryTabs({ loaders, queryKey, formatStage, extraTabs = [], tab, onTabChange }: RecordHistoryTabsProps) {
  const [ownTab, setOwnTab] = useState('history');
  const current = tab ?? ownTab;
  const extra = extraTabs.find((item) => item.value === current);

  return (
    <SectionCard title="Record" flush>
      <Tabs
        value={current}
        onChange={(_, value: string) => {
          if (onTabChange) onTabChange(value);
          else setOwnTab(value);
        }}
        aria-label="Record"
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ px: 2 }}
      >
        <Tab value="history" label="History" />
        <Tab value="emails" label="Emails" />
        <Tab value="audit" label="Audit trail" />
        {extraTabs.map((item) => (
          <Tab key={item.value} value={item.value} label={item.label} />
        ))}
      </Tabs>
      {current === 'history' && (
        <RequirePermission anyOf={[platformPermissions.audit]}>
          <HistoryTab loaders={loaders} queryKey={queryKey} formatStage={formatStage} />
        </RequirePermission>
      )}
      {current === 'emails' && (
        <RequirePermission anyOf={[platformPermissions.emails]}>
          <EmailsTab loaders={loaders} queryKey={queryKey} />
        </RequirePermission>
      )}
      {current === 'audit' && (
        <RequirePermission anyOf={[platformPermissions.audit]}>
          <AuditTab loaders={loaders} queryKey={queryKey} />
        </RequirePermission>
      )}
      {extra && <RequirePermission anyOf={extra.anyOf}>{extra.content}</RequirePermission>}
    </SectionCard>
  );
}
