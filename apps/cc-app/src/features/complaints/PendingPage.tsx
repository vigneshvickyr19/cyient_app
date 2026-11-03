import type { PendingItem } from '@cyient/api-client/cc';
import { DataTable, ErrorState, errorMessage, PageHeader, StatusChip, useListState } from '@cyient/shared-ui';
import { daysSince, formatDate, formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { usePendingComplaints } from './queries';

const columns: GridColDef<PendingItem>[] = [
  { field: 'complaintNo', headerName: 'Complaint no', minWidth: 140, sortable: false, valueGetter: (_, row) => row.complaintNo ?? 'Draft' },
  { field: 'customer', headerName: 'Customer', minWidth: 170, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'stageName', headerName: 'Waiting for', minWidth: 170, sortable: false, renderCell: ({ row }) => <StatusChip label={row.stageName} tone="info" /> },
  { field: 'actionDescription', headerName: 'Action', flex: 1, minWidth: 220, sortable: false },
  { field: 'targetDate', headerName: 'Target date', minWidth: 120, sortable: false, valueFormatter: (value: string | null) => formatDate(value) },
  { field: 'assignedAt', headerName: 'With you since', minWidth: 170, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'waiting', headerName: 'Days waiting', minWidth: 110, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
];

/** Pending Actions: the D5 actions the signed-in user owns and the complaints back with them to close, oldest first. */
export function PendingPage() {
  const navigate = useNavigate();
  const list = useListState([]);
  const pending = usePendingComplaints(list.page, list.pageSize);

  return (
    <>
      <PageHeader title="Pending actions" subtitle="Your open D5 actions, and complaints waiting for you to close them" />
      {pending.isError ? (
        <ErrorState message={errorMessage(pending.error)} onRetry={() => void pending.refetch()} />
      ) : (
        <DataTable<PendingItem>
          aria-label="Pending actions"
          rows={pending.data?.data ?? []}
          columns={columns}
          getRowId={(row) => `${row.publicId}-${row.stage}-${row.actionId ?? ''}`}
          loading={pending.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={pending.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/complaints/${row.publicId}${row.actionId === null ? '' : '?tab=d5'}`)}
          emptyTitle="Nothing is waiting for you"
          emptyMessage="Actions you own and complaints you need to close will appear here."
        />
      )}
    </>
  );
}
