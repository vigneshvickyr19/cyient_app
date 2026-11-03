import type { PageMeta } from '@cyient/api-client';
import { TablePagination } from '@mui/material';

interface PaginationProps {
  /** 1-based, as in the API. */
  page: number;
  pageSize: number;
  meta: PageMeta | null | undefined;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}

/** Paging for a list, driven by the API's meta. */
export function Pagination({ page, pageSize, meta, onChange, pageSizeOptions = [10, 20, 50, 100] }: PaginationProps) {
  return (
    <TablePagination
      component="div"
      count={meta?.totalCount ?? 0}
      page={Math.max(0, page - 1)}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[...pageSizeOptions]}
      onPageChange={(_, next) => {
        onChange(next + 1, pageSize);
      }}
      onRowsPerPageChange={(event) => {
        onChange(1, Number(event.target.value));
      }}
    />
  );
}
