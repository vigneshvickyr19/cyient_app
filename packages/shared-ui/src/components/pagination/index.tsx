import type { PageMeta } from '@cyient/api-client';
import { CustomPagination } from './CustomPagination';

export { CustomPagination, type CustomPaginationProps } from './CustomPagination';

export interface PaginationProps {
  /** 1-based, as in the API. */
  page: number;
  pageSize: number;
  meta: PageMeta | null | undefined;
  onChange: (page: number, pageSize: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
}

/** Paging for a list, driven by the API's meta. */
export function Pagination({
  page,
  pageSize,
  meta,
  onChange,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
}: PaginationProps) {
  return (
    <CustomPagination
      page={page}
      pageSize={pageSize}
      totalCount={meta?.totalCount ?? 0}
      onPageChange={(newPage) => onChange(newPage, pageSize)}
      onPageSizeChange={(newPageSize) => onChange(1, newPageSize)}
      pageSizeOptions={pageSizeOptions}
      disabled={disabled}
    />
  );
}
