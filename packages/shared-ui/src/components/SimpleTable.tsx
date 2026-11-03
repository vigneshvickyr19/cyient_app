import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, type TableCellProps } from '@mui/material';
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export interface SimpleColumn<Row> {
  key: string;
  header: ReactNode;
  render: (row: Row) => ReactNode;
  align?: TableCellProps['align'];
  width?: number | string;
}

export interface SimpleTableProps<Row> {
  rows: readonly Row[];
  columns: readonly SimpleColumn<Row>[];
  getRowKey: (row: Row) => string | number;
  onRowClick?: (row: Row) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  /** Pagination or a footer under the table. */
  footer?: ReactNode;
  'aria-label'?: string;
}

/** A plain table for short lists (clause lines, actions, history) and pages laid out in rows. */
export function SimpleTable<Row>({ rows, columns, getRowKey, onRowClick, emptyTitle = 'Nothing here yet', emptyMessage, footer, 'aria-label': ariaLabel }: SimpleTableProps<Row>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }
  return (
    <>
      <TableContainer>
        <Table size="small" aria-label={ariaLabel}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align} sx={{ width: column.width }}>
                  {column.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover={Boolean(onRowClick)}
                onClick={onRowClick ? () => { onRowClick(row); } : undefined}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align} sx={{ verticalAlign: 'top' }}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {footer}
    </>
  );
}
