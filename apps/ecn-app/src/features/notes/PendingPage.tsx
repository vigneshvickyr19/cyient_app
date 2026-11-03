import type { PendingItem } from '@cyient/api-client/ecn';
import { DataTable, ErrorState, errorMessage, PageHeader, StatusChip, useListState } from '@cyient/shared-ui';
import { daysSince, formatDate, formatDateTime } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { usePendingNotes } from './queries';
import { isNoteStatus, stageLabel, statusInfo, typeLabels } from './status';

const columns: GridColDef<PendingItem>[] = [
  { field: 'noteNo', headerName: 'Number', minWidth: 140, sortable: false },
  { field: 'noteType', headerName: 'Type', minWidth: 80, sortable: false, valueGetter: (_, row) => typeLabels[row.noteType] },
  { field: 'productNumber', headerName: 'Product number', flex: 1, minWidth: 160, sortable: false },
  {
    field: 'stage',
    headerName: 'Waiting for',
    minWidth: 190,
    sortable: false,
    renderCell: ({ row }) =>
      isNoteStatus(row.stage) ? <StatusChip {...statusInfo[row.stage]} /> : <StatusChip label={row.stageName ?? stageLabel(row.stage)} tone="info" />,
  },
  { field: 'initiator', headerName: 'Initiator', minWidth: 160, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'assignedAt', headerName: 'With you since', minWidth: 170, sortable: false, valueFormatter: (value: string) => formatDateTime(value) },
  { field: 'waiting', headerName: 'Days waiting', minWidth: 110, sortable: false, valueGetter: (_, row) => daysSince(row.assignedAt) },
  { field: 'targetDate', headerName: 'Target date', minWidth: 120, sortable: false, valueFormatter: (value: string | null) => formatDate(value) },
];

/** Pending Actions: CFT actions to close, a note to publish to the Reviewer, a review, an approval or a release, oldest first. */
export function PendingPage() {
  const navigate = useNavigate();
  const list = useListState([]);
  const pending = usePendingNotes(list.page, list.pageSize);

  return (
    <>
      <PageHeader title="Pending actions" subtitle="ECNs and TCNs waiting for you" />
      {pending.isError ? (
        <ErrorState message={errorMessage(pending.error)} onRetry={() => void pending.refetch()} />
      ) : (
        <DataTable<PendingItem>
          aria-label="Pending actions"
          rows={pending.data?.data ?? []}
          columns={columns}
          getRowId={(row) => `${row.publicId}-${row.stage}`}
          loading={pending.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={pending.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/notes/${row.publicId}`)}
          emptyTitle="Nothing is waiting for you"
          emptyMessage="CFT actions, reviews, approvals and releases waiting for you will appear here."
        />
      )}
    </>
  );
}
