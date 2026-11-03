import type { NoteListItem, NoteSort, NoteType, NoteView } from '@cyient/api-client/ecn';
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
import { useEcnApi } from '../../lib/api';
import { permissions } from '../../lib/permissions';
import { useCustomerOptions } from '../masters/queries';
import type { NoteListQuery } from './keys';
import { useNoteList } from './queries';
import { isEcnKind, isNoteStatus, isNoteType, kindLabels, kindOptions, openStatusOptions, statusInfo, statusOptions, typeLabels } from './status';

interface Filters {
  type?: string;
  search?: string;
  customer?: string;
  status?: string;
  kind?: string;
  category1?: string;
  category2?: string;
  initiator?: string;
  initiatorName?: string;
  from?: string;
  to?: string;
}

const filterNames = ['type', 'search', 'customer', 'status', 'kind', 'category1', 'category2', 'initiator', 'initiatorName', 'from', 'to'] as const;

/** Grid columns the API can sort by, and its name for each. */
const sortFields: Record<string, NoteSort> = {
  noteNo: 'NoteNo',
  createdAt: 'Created',
  targetDate: 'TargetDate',
  status: 'Status',
};

/** Each list's title and what it holds. */
const views: Record<NoteView, { title: string; subtitle: string; empty: string }> = {
  InProgress: { title: 'In progress', subtitle: 'ECNs and TCNs not yet closed', empty: 'Nothing in progress' },
  Closed: { title: 'Closed', subtitle: 'Released ECNs and TCNs', empty: 'Nothing closed yet' },
  All: { title: 'Search', subtitle: 'Every ECN and TCN, open and closed', empty: 'No ECNs or TCNs yet' },
};

const columns: GridColDef<NoteListItem>[] = [
  { field: 'noteNo', headerName: 'Number', minWidth: 140 },
  {
    field: 'noteType',
    headerName: 'Type',
    minWidth: 110,
    sortable: false,
    valueGetter: (_, row) => [typeLabels[row.noteType], row.ecnKind ? kindLabels[row.ecnKind] : null].filter(Boolean).join(' · '),
  },
  { field: 'customer', headerName: 'Customer', minWidth: 160, flex: 1, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'productNumber', headerName: 'Product number', minWidth: 150, sortable: false },
  { field: 'customerEcnNumber', headerName: 'Customer ECN / TCN no', minWidth: 170, sortable: false },
  { field: 'category1', headerName: 'Category 1', minWidth: 140, sortable: false, valueGetter: (_, row) => row.category1.name },
  { field: 'category2', headerName: 'Category 2', minWidth: 150, sortable: false, valueGetter: (_, row) => row.category2.name },
  { field: 'initiatedBy', headerName: 'Initiated by', minWidth: 150, sortable: false, valueGetter: (_, row) => row.initiatedBy.name },
  { field: 'status', headerName: 'Status', minWidth: 170, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'targetDate', headerName: 'Target date', minWidth: 120, valueFormatter: (value: string | null) => formatDate(value) },
  { field: 'createdAt', headerName: 'Created', minWidth: 120, valueFormatter: (value: string) => formatDate(value) },
  { field: 'releasedAt', headerName: 'Released', minWidth: 120, sortable: false, valueFormatter: (value: string | null) => formatDate(value) },
];

type TypeTab = NoteType | 'Both';

/** In progress (home page), Closed and Search: ECN and TCN tabs, search, filters, sort, and the list in Excel. */
export function NotesPage({ view }: { view: NoteView }) {
  const { can } = useAuth();
  const api = useEcnApi();
  const navigate = useNavigate();
  const list = useListState<Filters>(filterNames);
  const { filters } = list;
  const customers = useCustomerOptions();
  const categories1 = useMasterOptions('EcnCategory1');
  const categories2 = useMasterOptions('EcnCategory2');
  const type = isNoteType(filters.type) ? filters.type : undefined;
  const initiatorId = toNumber(filters.initiator);

  const query: NoteListQuery = {
    View: view,
    Type: type,
    Search: filters.search,
    CustomerId: toNumber(filters.customer),
    Status: isNoteStatus(filters.status) ? filters.status : undefined,
    EcnKind: type !== 'Tcn' && isEcnKind(filters.kind) ? filters.kind : undefined,
    Category1Id: toNumber(filters.category1),
    Category2Id: toNumber(filters.category2),
    InitiatorUserId: initiatorId,
    From: filters.from,
    To: filters.to,
    Sort: list.sort ? sortFields[list.sort.field] : undefined,
    Descending: list.sort?.descending,
    Page: list.page,
    PageSize: list.pageSize,
  };
  const notes = useNoteList(query);
  const exportList = useFileDownload(
    () => api.download('/api/v1/notes/export', { query: { ...query, Page: undefined, PageSize: undefined } }),
    `ECN ${view}.xlsx`,
  );
  const { title, subtitle, empty } = views[view];
  const searchFilters = filterNames.filter((name) => name !== 'type');
  const filtered = searchFilters.some((name) => Boolean(filters[name]));

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <>
            {can(permissions.export) && (
              <Button startIcon={<FileDownloadOutlinedIcon />} loading={exportList.isPending} onClick={() => { exportList.mutate(); }}>
                Export to Excel
              </Button>
            )}
            {can(permissions.create) && (
              <LinkButton variant="contained" startIcon={<AddIcon />} to={type ? `/notes/new?type=${type}` : '/notes/new'}>
                {type ? `New ${typeLabels[type]}` : 'New ECN or TCN'}
              </LinkButton>
            )}
          </>
        }
      />

      <Tabs
        value={type ?? 'Both'}
        onChange={(_, value: TypeTab) => {
          list.setFilters({ type: value === 'Both' ? undefined : value, kind: value === 'Tcn' ? undefined : filters.kind });
        }}
        aria-label="ECN or TCN"
        sx={{ mb: 2 }}
      >
        <Tab value="Both" label="ECNs and TCNs" />
        <Tab value="Ecn" label="ECNs" />
        <Tab value="Tcn" label="TCNs" />
      </Tabs>

      <FilterBar
        active={filtered}
        onClear={() => { list.setFilters(Object.fromEntries(searchFilters.map((name) => [name, undefined]))); }}
      >
        <SearchField
          value={filters.search ?? ''}
          onSearch={(search) => { list.setFilters({ search }); }}
          placeholder="Number, product, customer, summary…"
        />
        <Dropdown label="Customer" options={customers} value={toNumber(filters.customer) ?? null} emptyLabel="Any customer" onChange={(id) => { list.setFilters({ customer: id?.toString() }); }} />
        {view !== 'Closed' && (
          <Dropdown
            label="Status"
            options={view === 'InProgress' ? openStatusOptions : statusOptions}
            value={isNoteStatus(filters.status) ? filters.status : null}
            emptyLabel="Any status"
            onChange={(status) => { list.setFilters({ status: status ?? undefined }); }}
          />
        )}
        {type !== 'Tcn' && (
          <Dropdown label="Cyient ECN type" options={kindOptions} value={isEcnKind(filters.kind) ? filters.kind : null} emptyLabel="SAP or Non-SAP" onChange={(kind) => { list.setFilters({ kind: kind ?? undefined }); }} />
        )}
        <Dropdown label="Category 1" options={categories1} value={toNumber(filters.category1) ?? null} emptyLabel="Any" onChange={(id) => { list.setFilters({ category1: id?.toString() }); }} />
        <Dropdown label="Category 2" options={categories2} value={toNumber(filters.category2) ?? null} emptyLabel="Any" onChange={(id) => { list.setFilters({ category2: id?.toString() }); }} />
        <PeoplePicker
          label="Initiated by"
          value={initiatorId ? { id: initiatorId, name: filters.initiatorName ?? '' } : null}
          onChange={(person) => { list.setFilters({ initiator: person?.id.toString(), initiatorName: person?.name }); }}
        />
        <DateField label="Created from" value={filters.from ?? null} maxDate={filters.to} onChange={(from) => { list.setFilters({ from: from ?? undefined }); }} />
        <DateField label="Created to" value={filters.to ?? null} minDate={filters.from} onChange={(to) => { list.setFilters({ to: to ?? undefined }); }} />
      </FilterBar>

      {notes.isError ? (
        <ErrorState message={errorMessage(notes.error)} onRetry={() => void notes.refetch()} />
      ) : (
        <DataTable<NoteListItem>
          aria-label={title}
          rows={notes.data?.data ?? []}
          columns={view === 'Closed' ? columns : columns.filter((column) => column.field !== 'releasedAt')}
          getRowId={(row) => row.publicId}
          loading={notes.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={notes.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          sort={list.sort}
          onSortChange={list.setSort}
          onRowClick={(row) => void navigate(`/notes/${row.publicId}`)}
          emptyTitle={filtered ? 'No ECNs or TCNs match these filters' : empty}
          emptyMessage={can(permissions.create) && !filtered && view !== 'Closed' ? 'Raise one with New ECN or TCN.' : undefined}
        />
      )}
    </>
  );
}
