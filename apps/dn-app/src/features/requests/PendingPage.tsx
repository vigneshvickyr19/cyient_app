import type { PendingItem } from '@cyient/api-client/dn';
import { DataTable, ErrorState, errorMessage, PageHeader, StatusChip, useListState } from '@cyient/shared-ui';
import { daysSince, formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { usePendingRequests } from './queries';
import { statusInfo } from './status';

const columns: GridColDef<PendingItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 120, sortable: false, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'workOrderNo', headerName: 'W.O no', minWidth: 110, sortable: false },
  { field: 'productFgNumber', headerName: 'Product FG number', flex: 1, minWidth: 150, sortable: false },
  { field: 'changeCategory', headerName: 'Type of change', minWidth: 140, sortable: false, valueGetter: (_, row) => row.changeCategory.name },
  { field: 'initiator', headerName: 'Initiator', minWidth: 150, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'pendingRole', headerName: 'Your step', minWidth: 150, sortable: false },
  { field: 'status', headerName: 'Status', minWidth: 170, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'assignedAt', headerName: 'With you since', minWidth: 160, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'waiting', headerName: 'Days waiting', minWidth: 110, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
];

/** Pending Requests: deviations waiting for the signed-in user's review, or for their answer after Require more details. */
export function PendingPage() {
  const navigate = useNavigate();
  const list = useListState([]);
  const pending = usePendingRequests(list.page, list.pageSize);

  return (
    <>
      <PageHeader title="Pending requests" subtitle="Deviations waiting for your review, or for more details from you" />
      {pending.isError ? (
        <ErrorState message={errorMessage(pending.error)} onRetry={() => void pending.refetch()} />
      ) : (
        <DataTable<PendingItem>
          aria-label="Pending requests"
          rows={pending.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={pending.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={pending.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/requests/${row.publicId}`)}
          emptyTitle="Nothing is waiting for you"
          emptyMessage="Deviations you need to review or answer will appear here."
        />
      )}
    </>
  );
}
