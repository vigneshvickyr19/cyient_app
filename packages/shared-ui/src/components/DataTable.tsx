import type { PageMeta } from '@cyient/api-client';
import { DataGrid, type GridColDef, type GridRowParams, type GridSortModel, type GridValidRowModel } from '@mui/x-data-grid';
import { EmptyState } from './EmptyState';

export interface DataTableSort {
  field: string;
  descending: boolean;
}

export interface DataTableProps<Row extends GridValidRowModel> {
  rows: readonly Row[];
  columns: readonly GridColDef<Row>[];
  getRowId: (row: Row) => string | number;
  loading?: boolean;
  /** Paging from the API's meta; the grid pages on the server. Pages are 1-based, as in the API. */
  page: number;
  pageSize: number;
  meta: PageMeta | null | undefined;
  onPageChange: (page: number, pageSize: number) => void;
  /** Sorting on the server; leave out for columns that are not sortable by the API. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  onRowClick?: (row: Row) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  pageSizeOptions?: readonly number[];
  'aria-label'?: string;
}

/** A server-paged, server-sorted grid for the API's list endpoints. */
export function DataTable<Row extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  loading = false,
  page,
  pageSize,
  meta,
  onPageChange,
  sort,
  onSortChange,
  onRowClick,
  emptyTitle = 'Nothing to show',
  emptyMessage,
  pageSizeOptions = [10, 20, 50, 100],
  'aria-label': ariaLabel,
}: DataTableProps<Row>) {
  const sortModel: GridSortModel = sort ? [{ field: sort.field, sort: sort.descending ? 'desc' : 'asc' }] : [];

  return (
    <DataGrid<Row>
      aria-label={ariaLabel}
      rows={rows}
      columns={columns as GridColDef<Row>[]}
      getRowId={getRowId}
      loading={loading}
      autoHeight
      paginationMode="server"
      sortingMode="server"
      rowCount={meta?.totalCount ?? rows.length}
      paginationModel={{ page: Math.max(0, page - 1), pageSize }}
      onPaginationModelChange={(model) => {
        onPageChange(model.page + 1, model.pageSize);
      }}
      pageSizeOptions={[...pageSizeOptions]}
      sortModel={sortModel}
      onSortModelChange={(model) => {
        const first = model[0];
        onSortChange?.(first?.sort ? { field: first.field, descending: first.sort === 'desc' } : null);
      }}
      disableColumnFilter
      disableColumnMenu
      onRowClick={onRowClick ? (params: GridRowParams<Row>) => { onRowClick(params.row); } : undefined}
      sx={onRowClick ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : undefined}
      slots={{ noRowsOverlay: () => <EmptyState title={emptyTitle} message={emptyMessage} /> }}
    />
  );
}
