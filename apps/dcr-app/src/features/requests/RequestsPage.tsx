import type { RequestListItem, RequestScope, RequestSort } from '@cyient/api-client/dcr';
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
  SearchField,
  StatusChip,
  useAuth,
  useFileDownload,
  toNumber,
  useListState,
  useMasterOptions,
} from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { Tab, Tabs } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { useDcrApi } from '../../lib/api';
import { permissions } from '../../lib/permissions';
import type { RequestListQuery } from './keys';
import { useRequestList } from './queries';
import { isDcrStatus, isReleasedStatus, releasedInfo, releasedOptions, statusInfo, statusOptions } from './status';

interface Filters {
  scope?: string;
  search?: string;
  status?: string;
  released?: string;
  location?: string;
  department?: string;
  reason?: string;
  from?: string;
  to?: string;
}

const filterNames = ['scope', 'search', 'status', 'released', 'location', 'department', 'reason', 'from', 'to'] as const;

/** Grid columns the API can sort by, and its name for each. */
const sortFields: Record<string, RequestSort> = {
  requestNo: 'RequestNo',
  requestDate: 'Created',
  needByDate: 'NeedByDate',
  releaseDate: 'ReleaseDate',
  status: 'Status',
};

const columns: GridColDef<RequestListItem>[] = [
  { field: 'requestNo', headerName: 'Request no', minWidth: 140, valueGetter: (_, row) => row.requestNo ?? 'Draft' },
  { field: 'documentReference', headerName: 'Document reference', flex: 1, minWidth: 180, sortable: false },
  { field: 'requestFrom', headerName: 'Requested by', minWidth: 160, sortable: false, valueGetter: (_, row) => row.requestFrom.name },
  { field: 'location', headerName: 'Location', minWidth: 140, sortable: false, valueGetter: (_, row) => row.location.name },
  { field: 'department', headerName: 'Department', minWidth: 140, sortable: false, valueGetter: (_, row) => row.department.name },
  {
    field: 'status',
    headerName: 'Status',
    minWidth: 190,
    renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} />,
  },
  {
    field: 'releasedStatus',
    headerName: 'Released',
    minWidth: 140,
    sortable: false,
    renderCell: ({ row }) => <StatusChip {...releasedInfo[row.releasedStatus]} />,
  },
  { field: 'requestDate', headerName: 'Request date', minWidth: 120, valueFormatter: (value: string) => formatDate(value) },
  { field: 'needByDate', headerName: 'Need by', minWidth: 120, valueFormatter: (value: string) => formatDate(value) },
  { field: 'releaseDate', headerName: 'Release date', minWidth: 120, valueFormatter: (value: string | null) => formatDate(value) },
];

/** All Requests and My Requests: search, filter, sort, open a request, and export the list to Excel. */
export function RequestsPage() {
  const { can } = useAuth();
  const api = useDcrApi();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const canSeeAll = can(permissions.viewAll);
  const scope: RequestScope = canSeeAll && filters.scope !== 'Mine' ? 'All' : 'Mine';
  const locations = useMasterOptions('Location');
  const departments = useMasterOptions('Department');
  const reasons = useMasterOptions('ReasonCategory');

  const query: RequestListQuery = {
    Scope: scope,
    Search: filters.search,
    Status: isDcrStatus(filters.status) ? filters.status : undefined,
    ReleasedStatus: isReleasedStatus(filters.released) ? filters.released : undefined,
    LocationId: toNumber(filters.location),
    DepartmentId: toNumber(filters.department),
    ReasonCategoryId: toNumber(filters.reason),
    From: filters.from,
    To: filters.to,
    Sort: list.sort ? sortFields[list.sort.field] : undefined,
    Descending: list.sort?.descending,
    Page: list.page,
    PageSize: list.pageSize,
  };
  const requests = useRequestList(query);
  const exportList = useFileDownload(() => api.download('/api/v1/requests/export', { query: { ...query, Page: undefined, PageSize: undefined } }), 'Requests.xlsx');

  return (
    <>
      <PageHeader
        title="Requests"
        subtitle={scope === 'All' ? 'Every submitted DCR' : 'The DCRs you raised, drafts included'}
        actions={
          <>
            {can(permissions.export) && (
              <Button startIcon={<FileDownloadOutlinedIcon />} loading={exportList.isPending} onClick={() => { exportList.mutate(); }}>
                Export to Excel
              </Button>
            )}
            {can(permissions.create) && (
              <LinkButton variant="contained" startIcon={<AddIcon />} to="/requests/new">
                New request
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

      <FilterBar active={list.filtered && filterNames.some((name) => name !== 'scope' && Boolean(filters[name]))} onClear={() => { list.setFilters({ search: undefined, status: undefined, released: undefined, location: undefined, department: undefined, reason: undefined, from: undefined, to: undefined }); }}>
        <SearchField value={filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="Request no, document reference…" />
        <Dropdown label="Status" options={statusOptions} value={isDcrStatus(filters.status) ? filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
        <Dropdown label="Released" options={releasedOptions} value={isReleasedStatus(filters.released) ? filters.released : null} emptyLabel="Any" onChange={(released) => { list.setFilters({ released: released ?? undefined }); }} />
        <Dropdown label="Location" options={locations} value={toNumber(filters.location) ?? null} emptyLabel="Any location" onChange={(id) => { list.setFilters({ location: id?.toString() }); }} />
        <Dropdown label="Department" options={departments} value={toNumber(filters.department) ?? null} emptyLabel="Any department" onChange={(id) => { list.setFilters({ department: id?.toString() }); }} />
        <Dropdown label="Reason category" options={reasons} value={toNumber(filters.reason) ?? null} emptyLabel="Any reason" onChange={(id) => { list.setFilters({ reason: id?.toString() }); }} />
        <DateField label="Requested from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { list.setFilters({ from: from ?? undefined }); }} />
        <DateField label="Requested to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { list.setFilters({ to: to ?? undefined }); }} />
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
          emptyTitle={list.filtered ? 'No requests match these filters' : 'No requests yet'}
          emptyMessage={can(permissions.create) && !list.filtered ? 'Raise one with New request.' : undefined}
        />
      )}
    </>
  );
}
