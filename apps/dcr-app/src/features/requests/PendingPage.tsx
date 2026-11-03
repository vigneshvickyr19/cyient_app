import type { PendingItem } from '@cyient/api-client/dcr';
import { DataTable, ErrorState, errorMessage, PageHeader, StatusChip, useListState } from '@cyient/shared-ui';
import { daysSince, formatDate, formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { usePendingRequests } from './queries';
import { statusInfo } from './status';

const columns: GridColDef<PendingItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 140, sortable: false, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'documentReference', headerName: 'Document reference', flex: 1, minWidth: 180, sortable: false },
  { field: 'stage', headerName: 'Waiting at', minWidth: 190, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.stage]} /> },
  { field: 'requestFrom', headerName: 'Requested by', minWidth: 160, sortable: false, valueGetter: (_, row) => row.requestFrom.name },
  { field: 'assignedAt', headerName: 'With you since', minWidth: 170, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'waiting', headerName: 'Days waiting', minWidth: 110, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
  { field: 'needByDate', headerName: 'Need by', minWidth: 120, sortable: false, valueFormatter: (value: string) => formatDate(value) },
];

/** Pending Actions: the reviews waiting for the signed-in user, oldest first. */
export function PendingPage() {
  const navigate = useNavigate();
  const list = useListState([]);
  const pending = usePendingRequests(list.page, list.pageSize);

  return (
    <>
      <PageHeader title="Pending actions" subtitle="Requests waiting for your review" />
      {pending.isError ? (
        <ErrorState message={errorMessage(pending.error)} onRetry={() => void pending.refetch()} />
      ) : (
        <DataTable<PendingItem>
          aria-label="Pending actions"
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
          emptyMessage="Requests you need to review will appear here."
        />
      )}
    </>
  );
}
