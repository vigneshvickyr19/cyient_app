import type { EmailListItem, EmailStatus } from '@cyient/api-client/platform';
import { formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { StatusChip } from '../../components/display';
import { DataTable } from '../../components/DataTable';
import { ErrorState } from '../../components/ErrorState';
import { Dropdown } from '../../components/inputs';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar, SearchField } from '../../components/SearchFilter';
import { errorMessage } from '../../errors/errorMessage';
import { useListState } from '../../hooks/useListState';
import { useAdminPath } from '../shared/AdminBase';
import { DateRangeFilter, orUndefined, toInt } from '../shared/filters';
import { emailStatuses, emailStatusTone, useEmails } from './queries';

type EmailFilters = Partial<Record<'status' | 'event' | 'reference' | 'recipient' | 'from' | 'to', string>>;

const isStatus = (value: string | undefined): value is EmailStatus => emailStatuses.some((status) => status === value);

const columns: readonly GridColDef<EmailListItem>[] = [
  { field: 'createdAt', headerName: 'Queued', minWidth: 170, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'subject', headerName: 'Subject', flex: 2, minWidth: 220, sortable: false },
  { field: 'toAddresses', headerName: 'To', flex: 1.5, minWidth: 200, sortable: false },
  { field: 'eventType', headerName: 'Event', flex: 1, minWidth: 150, sortable: false },
  { field: 'referenceId', headerName: 'Reference', minWidth: 100, sortable: false },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 120,
    sortable: false,
    renderCell: ({ row }) => <StatusChip label={row.status} tone={emailStatusTone(row.status)} />,
  },
  { field: 'attemptCount', headerName: 'Attempts', minWidth: 100, sortable: false, align: 'right', headerAlign: 'right' },
  { field: 'sentAt', headerName: 'Sent', minWidth: 170, sortable: false, valueFormatter: (value: string | null) => formatDateTime(value) },
];

/** The emails the system queued, newest first; an email opens its details. */
export default function EmailsPage() {
  const list = useListState<EmailFilters>(['status', 'event', 'reference', 'recipient', 'from', 'to']);
  const { filters } = list;
  const navigate = useNavigate();
  const adminPath = useAdminPath();

  const emails = useEmails({
    Page: list.page,
    PageSize: list.pageSize,
    Status: isStatus(filters.status) ? filters.status : undefined,
    EventType: orUndefined(filters.event),
    ReferenceId: toInt(filters.reference),
    Recipient: orUndefined(filters.recipient),
    From: filters.from,
    To: filters.to,
  });

  return (
    <>
      <PageHeader title="Email log" subtitle="Every email the system queued: who it went to, whether it was sent, and why not." />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <Dropdown<EmailStatus>
          label="Status"
          value={isStatus(filters.status) ? filters.status : null}
          options={emailStatuses.map((status) => ({ value: status, label: status }))}
          emptyLabel="Any status"
          onChange={(status) => {
            list.setFilters({ status: status ?? undefined });
          }}
        />
        <SearchField
          label="Event"
          placeholder="For example Submitted"
          value={filters.event ?? ''}
          onSearch={(event) => {
            list.setFilters({ event });
          }}
        />
        <SearchField
          label="Reference ID"
          placeholder="The request's ID"
          value={filters.reference ?? ''}
          onSearch={(reference) => {
            list.setFilters({ reference: reference.replace(/\D/g, '') });
          }}
        />
        <SearchField
          label="Recipient"
          placeholder="Part of an email address"
          value={filters.recipient ?? ''}
          onSearch={(recipient) => {
            list.setFilters({ recipient });
          }}
        />
        <DateRangeFilter from={filters.from} to={filters.to} onChange={list.setFilters} />
      </FilterBar>
      {emails.isError ? (
        <ErrorState title="We couldn't load the email log" message={errorMessage(emails.error)} onRetry={() => void emails.refetch()} />
      ) : (
        <DataTable
          aria-label="Email log"
          rows={emails.data?.data ?? []}
          columns={columns}
          getRowId={(email) => email.id}
          loading={emails.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={emails.data?.meta}
          onPageChange={list.setPage}
          onRowClick={(email) => {
            void navigate(adminPath('emails', email.id));
          }}
          emptyTitle={list.filtered ? 'No emails match' : 'No emails yet'}
          emptyMessage={list.filtered ? 'Try other filters, or clear them.' : undefined}
        />
      )}
    </>
  );
}
