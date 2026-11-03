import type { RequestListItem } from '@cyient/api-client/dcr';
import { DataTable, Dropdown, ErrorState, errorMessage, FilterBar, PageHeader, SearchField, StatusChip, useListState } from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { isDcrStatus, statusInfo, statusOptions } from '../requests/status';
import { useAdminRequests } from './queries';

interface Filters {
  search?: string;
  status?: string;
}

const columns: GridColDef<RequestListItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 140, sortable: false, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'documentReference', headerName: 'Document reference', flex: 1, minWidth: 180, sortable: false },
  { field: 'requestFrom', headerName: 'Requested by', minWidth: 160, sortable: false, valueGetter: (_, row) => row.requestFrom.name },
  { field: 'status', headerName: 'Status', minWidth: 190, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'requestDate', headerName: 'Request date', minWidth: 120, sortable: false, valueFormatter: (value: string) => formatDate(value) },
];

/** Every request, drafts included, for request administrators. */
export function ManageRequestsPage() {
  const navigate = useNavigate();
  const list = useListState<Filters>(['search', 'status']);
  const requests = useAdminRequests({
    Search: list.filters.search,
    Status: isDcrStatus(list.filters.status) ? list.filters.status : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  return (
    <>
      <PageHeader title="All requests (administration)" subtitle="Every DCR, drafts included: cancel, correct and see its full history" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField value={list.filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} />
        <Dropdown label="Status" options={statusOptions} value={isDcrStatus(list.filters.status) ? list.filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
      </FilterBar>
      {requests.isError ? (
        <ErrorState message={errorMessage(requests.error)} onRetry={() => void requests.refetch()} />
      ) : (
        <DataTable<RequestListItem>
          aria-label="All requests"
          rows={requests.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={requests.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={requests.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/manage/requests/${row.publicId}`)}
          emptyTitle="No requests found"
        />
      )}
    </>
  );
}
