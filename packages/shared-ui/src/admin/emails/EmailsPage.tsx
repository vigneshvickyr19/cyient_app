import type { EmailListItem, EmailStatus } from '@cyient/api-client/platform';
import { formatDateTime, QUERY_PARAMS } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { StatusChip } from '../../index';
import { DataTable } from '../../index';
import { ErrorState } from '../../index';
import { Dropdown } from '../../index';
import { PageHeader } from '../../index';
import { FilterToolbar } from '../../index';
import { Input } from '../../index';
import { errorMessage } from '../../index';
import { useListState } from '../../index';
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
  const list = useListState<EmailFilters>([
    QUERY_PARAMS.STATUS,
    QUERY_PARAMS.EVENT,
    QUERY_PARAMS.REFERENCE,
    QUERY_PARAMS.RECIPIENT,
    QUERY_PARAMS.FROM,
    QUERY_PARAMS.TO,
  ]);
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
      <FilterToolbar list={list} fields={['status', 'event', 'reference', 'recipient', 'from', 'to']}>
        {(filters, change) => (
          <>
            <Dropdown<EmailStatus>
              label="Status"
              value={isStatus(filters.status) ? filters.status : null}
              options={emailStatuses.map((status) => ({ value: status, label: status }))}
              emptyLabel="Any status"
              onChange={(status) => {
                change({ status: status ?? undefined });
              }}
            />
            <Input
              label="Event"
              placeholder="For example Submitted"
              value={filters.event ?? ''}
              onChange={(event) => {
                change({ event });
              }}
            />
            <Input
              label="Reference ID"
              placeholder="The request's ID"
              value={filters.reference ?? ''}
              onChange={(reference) => {
                change({ reference: reference.replace(/\D/g, '') });
              }}
            />
            <Input
              label="Recipient"
              placeholder="Part of an email address"
              value={filters.recipient ?? ''}
              onChange={(recipient) => {
                change({ recipient });
              }}
            />
            <DateRangeFilter from={filters.from} to={filters.to} onChange={change} />
      
          </>
        )}
      </FilterToolbar>
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
