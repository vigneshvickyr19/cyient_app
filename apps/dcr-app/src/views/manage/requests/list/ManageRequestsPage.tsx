import type { RequestListItem } from '@cyient/api-client/dcr';
import { DataTable, Dropdown, errorMessage, ErrorState, FilterToolbar, PageHeader, StatusChip, useListState } from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { isDcrStatus, STATUS_ACTIONS, statusInfo } from '@/constants/request-status';
import { statusOptions } from '@/constants/static-dropdowns';
import { QUERY_PARAMS } from '@/constants/query-params';
import { useAdminRequests } from '@/hooks/manage/queries';

interface Filters {
  search?: string;
  status?: string;
}

const columns: GridColDef<RequestListItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 140, sortable: false, valueGetter: (_, row) => row.requestNo ?? STATUS_ACTIONS.DRAFT },
  { field: 'documentReference', headerName: 'Document reference', flex: 1, minWidth: 180, sortable: false },
  { field: 'requestFrom', headerName: 'Requested by', minWidth: 160, sortable: false, valueGetter: (_, row) => row.requestFrom.name },
  { field: 'status', headerName: 'Status', minWidth: 190, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'requestDate', headerName: 'Request date', minWidth: 120, sortable: false, valueFormatter: (value: string) => formatDate(value) },
];

/** Every request, drafts included, for request administrators. */
export function ManageRequestsPage() {
  const navigate = useNavigate();
  const list = useListState<Filters>([QUERY_PARAMS.SEARCH, QUERY_PARAMS.STATUS]);
  const requests = useAdminRequests({
    Search: list.filters.search,
    Status: isDcrStatus(list.filters.status) ? list.filters.status : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  return (
    <>
      <PageHeader title="All requests (administration)" subtitle="Every DCR, drafts included: cancel, correct and see its full history" />
      <FilterToolbar list={list} fields={['status']} searchName="search">
        {(filters, change) => (
          <>
            <Dropdown label="Status" options={statusOptions} value={isDcrStatus(filters.status) ? filters.status : null} emptyLabel="Any status" onChange={(status) => { change({ status: status ?? undefined }); }} />
          </>
        )}
      </FilterToolbar>
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
