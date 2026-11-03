import type { ComplaintListItem } from '@cyient/api-client/cc';
import { DataTable, Dropdown, ErrorState, errorMessage, FilterBar, PageHeader, SearchField, StatusChip, useListState } from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { isComplaintStatus, statusInfo, statusOptions } from '../complaints/status';
import { useAdminComplaints } from './queries';

interface Filters {
  search?: string;
  status?: string;
}

const columns: GridColDef<ComplaintListItem>[] = [
  { field: 'complaintNo', headerName: 'Complaint no', minWidth: 140, sortable: false, valueGetter: (_, row) => row.complaintNo ?? 'Draft' },
  { field: 'customer', headerName: 'Customer', minWidth: 170, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'complaintDescription', headerName: 'Complaint', flex: 1, minWidth: 200, sortable: false },
  { field: 'initiator', headerName: 'Initiator', minWidth: 160, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'status', headerName: 'Status', minWidth: 200, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'complaintDate', headerName: 'Complaint date', minWidth: 130, sortable: false, valueFormatter: (value: string) => formatDate(value) },
];

/** Every complaint, drafts included, for request administrators. */
export function ManageComplaintsPage() {
  const navigate = useNavigate();
  const list = useListState<Filters>(['search', 'status']);
  const complaints = useAdminComplaints({
    Search: list.filters.search,
    Status: isComplaintStatus(list.filters.status) ? list.filters.status : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  return (
    <>
      <PageHeader title="All complaints (administration)" subtitle="Every external complaint, drafts included: cancel it and see its full history" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField value={list.filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} />
        <Dropdown label="Status" options={statusOptions} value={isComplaintStatus(list.filters.status) ? list.filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
      </FilterBar>
      {complaints.isError ? (
        <ErrorState message={errorMessage(complaints.error)} onRetry={() => void complaints.refetch()} />
      ) : (
        <DataTable<ComplaintListItem>
          aria-label="All complaints"
          rows={complaints.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={complaints.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={complaints.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/manage/complaints/${row.publicId}`)}
          emptyTitle="No complaints found"
        />
      )}
    </>
  );
}
