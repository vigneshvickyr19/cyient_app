import type { NoteListItem } from '@cyient/api-client/ecn';
import { DataTable, Dropdown, ErrorState, errorMessage, FilterBar, PageHeader, SearchField, StatusChip, useListState } from '@cyient/shared-ui';
import { formatDate } from '@cyient/shared-utils';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router';
import { useNoteList } from '../notes/queries';
import { isNoteStatus, isNoteType, statusInfo, statusOptions, typeLabels, typeOptions } from '../notes/status';

interface Filters {
  search?: string;
  status?: string;
  type?: string;
}

const columns: GridColDef<NoteListItem>[] = [
  { field: 'noteNo', headerName: 'Number', minWidth: 140, sortable: false },
  { field: 'noteType', headerName: 'Type', minWidth: 80, sortable: false, valueGetter: (_, row) => typeLabels[row.noteType] },
  { field: 'customer', headerName: 'Customer', minWidth: 160, flex: 1, sortable: false, valueGetter: (_, row) => row.customer.name },
  { field: 'productNumber', headerName: 'Product number', minWidth: 150, sortable: false },
  { field: 'initiatedBy', headerName: 'Initiated by', minWidth: 150, sortable: false, valueGetter: (_, row) => row.initiatedBy.name },
  { field: 'status', headerName: 'Status', minWidth: 170, sortable: false, renderCell: ({ row }) => <StatusChip {...statusInfo[row.status]} /> },
  { field: 'createdAt', headerName: 'Created', minWidth: 120, sortable: false, valueFormatter: (value: string) => formatDate(value) },
];

/** Every ECN and TCN, drafts and cancelled ones included, for administrators: open one to cancel it or see its record. */
export function ManageNotesPage() {
  const navigate = useNavigate();
  const list = useListState<Filters>(['search', 'status', 'type']);
  const notes = useNoteList({
    View: 'All',
    Search: list.filters.search,
    Status: isNoteStatus(list.filters.status) ? list.filters.status : undefined,
    Type: isNoteType(list.filters.type) ? list.filters.type : undefined,
    Page: list.page,
    PageSize: list.pageSize,
  });

  return (
    <>
      <PageHeader title="All notes (administration)" subtitle="Cancel a note, and see its history, emails and audit trail" />
      <FilterBar active={list.filtered} onClear={list.clearFilters}>
        <SearchField value={list.filters.search ?? ''} onSearch={(search) => { list.setFilters({ search }); }} placeholder="Number, product, customer…" />
        <Dropdown label="ECN or TCN" options={typeOptions} value={isNoteType(list.filters.type) ? list.filters.type : null} emptyLabel="Both" onChange={(type) => { list.setFilters({ type: type ?? undefined }); }} />
        <Dropdown label="Status" options={statusOptions} value={isNoteStatus(list.filters.status) ? list.filters.status : null} emptyLabel="Any status" onChange={(status) => { list.setFilters({ status: status ?? undefined }); }} />
      </FilterBar>
      {notes.isError ? (
        <ErrorState message={errorMessage(notes.error)} onRetry={() => void notes.refetch()} />
      ) : (
        <DataTable<NoteListItem>
          aria-label="All notes"
          rows={notes.data?.data ?? []}
          columns={columns}
          getRowId={(row) => row.publicId}
          loading={notes.isFetching}
          page={list.page}
          pageSize={list.pageSize}
          meta={notes.data?.meta}
          onPageChange={(page, pageSize) => { list.setPage(page, pageSize); }}
          onRowClick={(row) => void navigate(`/manage/notes/${row.publicId}`)}
          emptyTitle={list.filtered ? 'No notes match these filters' : 'No notes yet'}
        />
      )}
    </>
  );
}
