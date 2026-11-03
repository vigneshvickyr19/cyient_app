import type { ComplaintListItem, ComplaintScope, ComplaintSort } from '@cyient/api-client/cc';
import {
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
  useListState,
  useMasterOptions,
  type Option,
} from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import AddIcon from '@mui/icons-material/Add';
import { Box, Tab, Tabs } from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { masterTypes } from '../../lib/masters';
import { permissions } from '../../lib/permissions';
import type { ComplaintListQuery } from './keys';
import { useComplaintList } from './queries';
import { isComplaintStatus, statusInfo, statusOptions } from './status';

interface Filters {
  scope?: string;
  search?: string;
  status?: string;
  customer?: string;
  critical?: string;
  initiator?: string;
  initiatorName?: string;
  from?: string;
  to?: string;
}

const filterNames = ['scope', 'search', 'status', 'customer', 'critical', 'initiator', 'initiatorName', 'from', 'to'] as const;

/** Grid columns the API can sort by, and its name for each. */
const sortFields: Record<string, ComplaintSort> = {
  complaintNo: 'ComplaintNo',
  complaintDate: 'ComplaintDate',
  status: 'Status',
};

const criticalOptions: Option<'yes' | 'no'>[] = [
  { value: 'yes', label: 'Critical' },
  { value: 'no', label: 'Not critical' },
];

const columns: GridColDef<ComplaintListItem>[] = [
  { field: 'complaintNo', headerName: 'Complaint no', minWidth: 140, valueGetter: (_, row) => row.complaintNo ?? 'Draft' },
  { field: 'customer', headerName: 'Customer', minWidth: 170, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'complaintDescription', headerName: 'Complaint', flex: 1, minWidth: 220, sortable: false },
  { field: 'customerPartNo', headerName: 'Customer part no', minWidth: 140, sortable: false },
  {
    field: 'isCritical',
    headerName: 'Critical',
    minWidth: 100,
    sortable: false,
    renderCell: ({ row }) => (row.isCritical ? <StatusChip label="Critical" tone="error" /> : null),
  },
  { field: 'isRepeat', headerName: 'Repeat', minWidth: 90, sortable: false, valueGetter: (_, row) => (row.isRepeat ? 'Yes' : 'No') },
  { field: 'status', headerName: 'Status', minWidth: 200, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'initiator', headerName: 'Initiator', minWidth: 160, sortable: false, valueGetter: (_, row) => row.initiator.name },
  { field: 'complaintDate', headerName: 'Complaint date', minWidth: 130, valueFormatter: (value: string) => formatDate(value) },
];

/** All external complaints and My complaints: search, filter, sort and open a complaint. */
export function ComplaintsPage() {
  const { can } = useAuth();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const canSeeAll = can(permissions.viewAll);
  const scope: ComplaintScope = canSeeAll && filters.scope !== 'Mine' ? 'All' : 'Mine';
  const customers = useMasterOptions(masterTypes.customer);
  const critical = filters.critical === 'yes' || filters.critical === 'no' ? filters.critical : null;
  const initiatorId = toNumber(filters.initiator);

  const query: ComplaintListQuery = {
    Scope: scope,
    Search: filters.search,
    Status: isComplaintStatus(filters.status) ? filters.status : undefined,
    CustomerId: toNumber(filters.customer),
    IsCritical: critical === null ? undefined : critical === 'yes',
    InitiatorUserId: initiatorId,
    From: filters.from,
    To: filters.to,
    Sort: list.sort ? sortFields[list.sort.field] : undefined,
    Descending: list.sort?.descending,
    Page: list.page,
    PageSize: list.pageSize,
  };
  const complaints = useComplaintList(query);

  return (
    <>
      <PageHeader
        title="External complaints"
        subtitle={scope === 'All' ? 'Every published customer complaint' : 'The complaints you raised, are on the team of or own an action of'}
        actions={
          can(permissions.create) && (
            <LinkButton variant="contained" startIcon={<AddIcon />} to="/complaints/new">
              New complaint
            </LinkButton>
          )
        }
      />

      {canSeeAll && (
        <Tabs
          value={scope}
          onChange={(_, value: ComplaintScope) => {
            list.setFilters({ scope: value === 'Mine' ? 'Mine' : undefined });
          }}
          sx={{ mb: 2 }}
        >
          <Tab value="All" label="All complaints" />
          <Tab value="Mine" label="My complaints" />
        </Tabs>
      )}

      <FilterBar
        active={list.filtered && filterNames.some((name) => name !== 'scope' && Boolean(filters[name]))}
        onClear={() => {
          list.setFilters({ search: undefined, status: undefined, customer: undefined, critical: undefined, initiator: undefined, initiatorName: undefined, from: undefined, to: undefined });
        }}
      >
        <SearchField value={filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="Complaint no, part no, description…" />
        <Dropdown label="Status" options={statusOptions} value={isComplaintStatus(filters.status) ? filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
        <Dropdown label="Customer" options={customers} value={toNumber(filters.customer) ?? null} emptyLabel="Any customer" onChange={(id) => { list.setFilters({ customer: id?.toString() }); }} />
        <Dropdown label="Critical" options={criticalOptions} value={critical} emptyLabel="Any" onChange={(value) => { list.setFilters({ critical: value ?? undefined }); }} />
        <Box sx={{ minWidth: 220 }}>
          <PeoplePicker
            label="Initiator"
            value={initiatorId ? { id: initiatorId, name: filters.initiatorName ?? '' } : null}
            onChange={(person) => { list.setFilters({ initiator: person?.id.toString(), initiatorName: person?.name }); }}
          />
        </Box>
        <DateField label="Complaint date from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { list.setFilters({ from: from ?? undefined }); }} />
        <DateField label="Complaint date to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { list.setFilters({ to: to ?? undefined }); }} />
      </FilterBar>

      {complaints.isError ? (
        <ErrorState message={errorMessage(complaints.error)} onRetry={() => void complaints.refetch()} />
      ) : (
        <DataTable<ComplaintListItem>
          aria-label="External complaints"
          rows={complaints.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={complaints.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={complaints.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          sort={list.sort}
          onSortChange={list.setSort}
          onRowClick={(row) => void navigate(`/complaints/${row.publicId}`)}
          emptyTitle={list.filtered ? 'No complaints match these filters' : 'No complaints yet'}
          emptyMessage={can(permissions.create) && !list.filtered ? 'Register one with New complaint.' : undefined}
        />
      )}
    </>
  );
}
