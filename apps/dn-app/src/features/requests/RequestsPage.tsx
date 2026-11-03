import type { RequestListItem, RequestScope, RequestSort } from '@cyient/api-client/dn';
import {
  Button,
  DataTable,
  DateField,
  Dropdown,
  ErrorState,
  errorMessage,
  FilterBar,
  LinkButton,
  PageHeader,
  PeoplePicker,
  SearchField,
  StatusChip,
  toNumber,
  useAuth,
  useFileDownload,
  useListState,
  useMasterOptions,
} from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Tab, Tabs } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { useDnApi } from '../../lib/api';
import { permissions } from '../../lib/permissions';
import type { RequestListQuery } from './keys';
import { useRequestList } from './queries';
import { isDnStatus, statusInfo, statusOptions } from './status';

interface Filters {
  scope?: string;
  search?: string;
  status?: string;
  category?: string;
  customer?: string;
  unit?: string;
  department?: string;
  initiator?: string;
  initiatorName?: string;
  from?: string;
  to?: string;
}

const filterNames = ['scope', 'search', 'status', 'category', 'customer', 'unit', 'department', 'initiator', 'initiatorName', 'from', 'to'] as const;

/** Grid columns the API can sort by, and its name for each. */
const sortFields: Record<string, RequestSort> = {
  requestNo: 'RequestNo',
  requestDate: 'RequestDate',
  status: 'Status',
};

const columns: GridColDef<RequestListItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 120, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'requestDate', headerName: 'Date', minWidth: 110, valueFormatter: (value: string) => formatDate(value) },
  { field: 'initiator', headerName: 'Initiator', minWidth: 150, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'initiatorDepartment', headerName: 'Department', minWidth: 130, sortable: false, valueGetter: (_, row) => row.initiatorDepartment.name },
  { field: 'changeCategory', headerName: 'Type of change', minWidth: 140, sortable: false, valueGetter: (_, row) => row.changeCategory.name },
  { field: 'customer', headerName: 'Customer', minWidth: 150, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'unit', headerName: 'Unit', minWidth: 130, sortable: false, valueGetter: (_, row) => row.unit.name },
  { field: 'workOrderNo', headerName: 'W.O no', minWidth: 110, sortable: false },
  { field: 'productFgNumber', headerName: 'Product FG number', flex: 1, minWidth: 150, sortable: false },
  { field: 'pendingWith', headerName: 'Pending with', minWidth: 150, sortable: false, valueGetter: (_, row) => row.pendingWith?.name },
  { field: 'pendingRole', headerName: 'Pending role', minWidth: 140, sortable: false },
  { field: 'status', headerName: 'Status', minWidth: 170, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'validUntil', headerName: 'Valid until', minWidth: 110, sortable: false, valueFormatter: (value: string | null) => formatDate(value) },
];

/** All Requests and My Requests: search, filter, sort, open a deviation, and export the list to Excel. */
export function RequestsPage() {
  const { can } = useAuth();
  const api = useDnApi();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const canSeeAll = can(permissions.viewAll);
  const scope: RequestScope = canSeeAll && filters.scope !== 'Mine' ? 'All' : 'Mine';
  const categories = useMasterOptions('ChangeCategory');
  const customers = useMasterOptions('Customer');
  const units = useMasterOptions('Unit');
  const departments = useMasterOptions('Department');
  const initiatorId = toNumber(filters.initiator);
  const filtered = filterNames.some((name) => name !== 'scope' && Boolean(filters[name]));

  const query: RequestListQuery = {
    Scope: scope,
    Search: filters.search,
    Status: isDnStatus(filters.status) ? filters.status : undefined,
    ChangeCategoryId: toNumber(filters.category),
    CustomerId: toNumber(filters.customer),
    UnitId: toNumber(filters.unit),
    InitiatorDepartmentId: toNumber(filters.department),
    InitiatorUserId: scope === 'All' ? initiatorId : undefined,
    From: filters.from,
    To: filters.to,
    Sort: list.sort ? sortFields[list.sort.field] : undefined,
    Descending: list.sort?.descending,
    Page: list.page,
    PageSize: list.pageSize,
  };
  const requests = useRequestList(query);
  const exportList = useFileDownload(
    () => api.download('/api/v1/requests/export', { query: { ...query, Page: undefined, PageSize: undefined } }),
    'Deviation requests.xlsx',
  );

  return (
    <>
      <PageHeader
        title="Requests"
        subtitle={scope === 'All' ? 'Every submitted deviation' : 'The deviations you raised, drafts included'}
        actions={
          <>
            {can(permissions.export) && (
              <Button startIcon={<FileDownloadOutlinedIcon />} loading={exportList.isPending} onClick={() => { exportList.mutate(); }}>
                Export to Excel
              </Button>
            )}
            {can(permissions.create) && (
              <LinkButton variant="contained" startIcon={<AddIcon />} to="/requests/new">
                New deviation
              </LinkButton>
            )}
          </>
        }
      />

      {canSeeAll && (
        <Tabs
          value={scope}
          onChange={(_, value: RequestScope) => {
            list.setFilters({ scope: value === 'Mine' ? 'Mine' : undefined });
          }}
          sx={{ mb: 2 }}
        >
          <Tab value="All" label="All requests" />
          <Tab value="Mine" label="My requests" />
        </Tabs>
      )}

      <FilterBar
        active={filtered}
        onClear={() => {
          list.setFilters({
            search: undefined,
            status: undefined,
            category: undefined,
            customer: undefined,
            unit: undefined,
            department: undefined,
            initiator: undefined,
            initiatorName: undefined,
            from: undefined,
            to: undefined,
          });
        }}
      >
        <SearchField value={filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="Request no, W.O no, product FG no…" />
        <Dropdown label="Status" options={statusOptions} value={isDnStatus(filters.status) ? filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
        <Dropdown label="Change category" options={categories} value={toNumber(filters.category) ?? null} emptyLabel="Any category" onChange={(id) => { list.setFilters({ category: id?.toString() }); }} />
        <Dropdown label="Customer" options={customers} value={toNumber(filters.customer) ?? null} emptyLabel="Any customer" onChange={(id) => { list.setFilters({ customer: id?.toString() }); }} />
        <Dropdown label="Unit" options={units} value={toNumber(filters.unit) ?? null} emptyLabel="Any unit" onChange={(id) => { list.setFilters({ unit: id?.toString() }); }} />
        <Dropdown label="Initiator department" options={departments} value={toNumber(filters.department) ?? null} emptyLabel="Any department" onChange={(id) => { list.setFilters({ department: id?.toString() }); }} />
        {scope === 'All' && (
          <PeoplePicker
            label="Initiator"
            value={initiatorId ? { id: initiatorId, name: filters.initiatorName ?? '' } : null}
            onChange={(person) => { list.setFilters({ initiator: person?.id.toString(), initiatorName: person?.name }); }}
          />
        )}
        <DateField label="Date from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { list.setFilters({ from: from ?? undefined }); }} />
        <DateField label="Date to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { list.setFilters({ to: to ?? undefined }); }} />
      </FilterBar>

      {requests.isError ? (
        <ErrorState message={errorMessage(requests.error)} onRetry={() => void requests.refetch()} />
      ) : (
        <DataTable<RequestListItem>
          aria-label="Requests"
          rows={requests.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={requests.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={requests.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          sort={list.sort}
          onSortChange={list.setSort}
          onRowClick={(row) => void navigate(`/requests/${row.publicId}`)}
          emptyTitle={filtered ? 'No deviations match these filters' : 'No deviations yet'}
          emptyMessage={can(permissions.create) && !filtered ? 'Raise one with New deviation.' : undefined}
        />
      )}
    </>
  );
}
