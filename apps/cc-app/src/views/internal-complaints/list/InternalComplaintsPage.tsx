import type { ComplaintScope, InternalListItem } from '@cyient/api-client/cc';
import { DataTable, DateField, Dropdown, errorMessage, ErrorState, FilterToolbar, LinkButton, PageHeader, SegmentedTabs, StatusChip, Tab, toNumber, useAuth, useListState, useMasterOptions } from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { masterTypes } from '@/constants/masters';
import { permissions } from '@/constants/permissions';
import { QUERY_PARAMS } from '@/constants/query-params';
import type { InternalListQuery } from '@/types/complaints';
import { useInternalList } from '@/hooks/internal/queries';
import { internalStatusInfo, isInternalStatus } from '@/constants/internal-status';
import { internalStatusOptions } from '@/constants/static-dropdowns';

interface Filters {
  scope?: string;
  search?: string;
  status?: string;
  customer?: string;
  from?: string;
  to?: string;
}

const filterNames = [
  QUERY_PARAMS.SCOPE,
  QUERY_PARAMS.SEARCH,
  QUERY_PARAMS.STATUS,
  QUERY_PARAMS.CUSTOMER,
  QUERY_PARAMS.FROM,
  QUERY_PARAMS.TO,
] as const;

const columns: GridColDef<InternalListItem>[] = [
  { field: 'complaintNo', headerName: 'Complaint no', minWidth: 140, sortable: false },
  { field: 'customer', headerName: 'Customer', minWidth: 170, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'problemDescription', headerName: 'Problem', flex: 1, minWidth: 220, sortable: false },
  { field: 'internalPartNo', headerName: 'Internal part no', minWidth: 140, sortable: false },
  { field: 'rejectedQuantity', headerName: 'Rejected qty', minWidth: 110, sortable: false },
  { field: 'openActions', headerName: 'Open actions', minWidth: 110, sortable: false },
  { field: 'status', headerName: 'Status', minWidth: 110, sortable: false, renderCell: ({ row }) => <StatusChip {...internalStatusInfo[row.status]} /> },
  { field: 'initiator', headerName: 'Recorded by', minWidth: 160, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'complaintDate', headerName: 'Complaint date', minWidth: 130, sortable: false, valueFormatter: (value: string) => formatDate(value) },
];

/** Internal complaints (in-house rejections): search, filter and open one. */
export function InternalComplaintsPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const canSeeAll = can(permissions.internalViewAll);
  const scope: ComplaintScope = canSeeAll && filters.scope !== 'Mine' ? 'All' : 'Mine';
  const customers = useMasterOptions(masterTypes.customer);

  const query: InternalListQuery = {
    Scope: scope,
    Search: filters.search,
    Status: isInternalStatus(filters.status) ? filters.status : undefined,
    CustomerId: toNumber(filters.customer),
    From: filters.from,
    To: filters.to,
    Page: list.page,
    PageSize: list.pageSize,
  };
  const complaints = useInternalList(query);

  return (
    <>
      <PageHeader
        title="Internal complaints"
        subtitle={scope === 'All' ? 'Every internal complaint' : 'The internal complaints you recorded or own an action of'}
        actions={
          can(permissions.internalCreate) && (
            <LinkButton variant="contained" startIcon={<AddIcon />} to="/internal-complaints/new">
              New internal complaint
            </LinkButton>
          )
        }
      />

      {canSeeAll && (
        <SegmentedTabs
          value={scope}
          onChange={(_, value: ComplaintScope) => {
            list.setFilters({ scope: value === 'Mine' ? 'Mine' : undefined });
          }}
          sx={{ mb: 2 }}
        >
          <Tab value="All" label="All internal complaints" />
          <Tab value="Mine" label="My internal complaints" />
        </SegmentedTabs>
      )}

      <FilterToolbar list={list} fields={['status', 'customer', 'from', 'to']} searchName="search" searchPlaceholder="Complaint no, part no, problem…">
        {(filters, change) => (
          <>
            <Dropdown label="Status" options={internalStatusOptions} value={isInternalStatus(filters.status) ? filters.status : null} emptyLabel="Any status" onChange={(status) => { change({ status: status ?? undefined }); }} />
            <Dropdown label="Customer" options={customers} value={toNumber(filters.customer) ?? null} emptyLabel="Any customer" onChange={(id) => { change({ customer: id?.toString() }); }} />
            <DateField label="Complaint date from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { change({ from: from ?? undefined }); }} />
            <DateField label="Complaint date to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { change({ to: to ?? undefined }); }} />
          </>
        )}
      </FilterToolbar>

      {complaints.isError ? (
        <ErrorState message={errorMessage(complaints.error)} onRetry={() => void complaints.refetch()} />
      ) : (
        <DataTable<InternalListItem>
          aria-label="Internal complaints"
          rows={complaints.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={complaints.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={complaints.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/internal-complaints/${row.publicId}`)}
          emptyTitle={list.filtered ? 'No internal complaints match these filters' : 'No internal complaints yet'}
          emptyMessage={can(permissions.internalCreate) && !list.filtered ? 'Record one with New internal complaint.' : undefined}
        />
      )}
    </>
  );
}
