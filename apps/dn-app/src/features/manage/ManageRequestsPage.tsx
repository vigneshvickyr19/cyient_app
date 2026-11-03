import type { RequestListItem } from '@cyient/api-client/dn';
import {
  DataTable,
  Dropdown,
  ErrorState,
  errorMessage,
  FilterBar,
  PageHeader,
  SearchField,
  StatusChip,
  useListState,
  useMasterOptions,
} from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { isDnStatus, statusInfo, statusOptions } from '../requests/status';
import { useAdminRequests } from './queries';

interface Filters {
  search?: string;
  status?: string;
  category?: string;
}

const columns: GridColDef<RequestListItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 120, sortable: false, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'requestDate', headerName: 'Date', minWidth: 110, sortable: false, valueFormatter: (value: string) => formatDate(value) },
  { field: 'initiator', headerName: 'Initiator', minWidth: 150, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'changeCategory', headerName: 'Type of change', minWidth: 140, sortable: false, valueGetter: (_, row) => row.changeCategory.name },
  { field: 'productFgNumber', headerName: 'Product FG number', flex: 1, minWidth: 150, sortable: false },
  { field: 'pendingWith', headerName: 'Pending with', minWidth: 150, sortable: false, valueGetter: (_, row) => row.pendingWith?.name },
  { field: 'pendingRole', headerName: 'Pending role', minWidth: 140, sortable: false },
  { field: 'status', headerName: 'Status', minWidth: 170, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
];

/** Every deviation, drafts included, for request administrators. */
export function ManageRequestsPage() {
  const navigate = useNavigate();
  const list = useListState<Filters>(['search', 'status', 'category']);
  const categories = useMasterOptions('ChangeCategory');
  const category = list.filters.category ? Number(list.filters.category) : undefined;
  const requests = useAdminRequests({
    Search: list.filters.search,
    Status: isDnStatus(list.filters.status) ? list.filters.status : undefined,
    ChangeCategoryId: category,
    Page: list.page,
    PageSize: list.pageSize,
  });

  return (
    <>
      <PageHeader title="All requests (administration)" subtitle="Every deviation, drafts included: close it, change its people and see its full history" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField value={list.filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="Request no, W.O no, product FG no…" />
        <Dropdown label="Status" options={statusOptions} value={isDnStatus(list.filters.status) ? list.filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
        <Dropdown label="Change category" options={categories} value={category ?? null} emptyLabel="Any category" onChange={(id) => { list.setFilters({ category: id?.toString() }); }} />
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
          emptyTitle={list.filtered ? 'No deviations match these filters' : 'No deviations yet'}
        />
      )}
    </>
  );
}
