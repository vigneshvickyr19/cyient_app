import type { SxProps, Theme } from '@mui/material';

export type DataGridStickyColumnSide = 'left' | 'right';

export interface DataGridStickyColumnConfig {
  field: string;
  side?: DataGridStickyColumnSide;
  left?: number;
  right?: number;
  headerZIndex?: number;
  cellZIndex?: number;
}

const stickyColumnHeaderSelector = (field: string) =>
  `& .MuiDataGrid-columnHeader[data-field="${field}"], & .MuiDataGrid-columnHeader[data-field="${field}"]:hover, & .MuiDataGrid-columnHeader[data-field="${field}"]:focus, & .MuiDataGrid-columnHeader[data-field="${field}"]:focus-within`;

const stickyColumnCellSelector = (field: string) =>
  `& .MuiDataGrid-cell[data-field="${field}"]`;

const resolveStickySide = (
  side: DataGridStickyColumnSide | undefined,
  _left: number | undefined,
  right: number | undefined,
): DataGridStickyColumnSide => {
  if (side) return side;
  if (right !== undefined) return 'right';
  return 'left';
};

const buildStickyPositionSx = (
  stickySide: DataGridStickyColumnSide,
  left: number | undefined,
  right: number | undefined,
  zIndex: number,
) =>
  stickySide === 'right'
    ? {
        position: 'sticky' as const,
        right: right ?? 0,
        zIndex,
      }
    : {
        position: 'sticky' as const,
        left: left ?? 0,
        zIndex,
      };

export const buildDataGridStickyColumnHeaderSx = (
  field: string,
  {
    side,
    left,
    right,
    zIndex,
  }: {
    side?: DataGridStickyColumnSide;
    left?: number;
    right?: number;
    zIndex: number;
  },
): Record<string, unknown> => {
  const stickySide = resolveStickySide(side, left, right);

  return {
    [stickyColumnHeaderSelector(field)]: {
      ...buildStickyPositionSx(stickySide, left, right, zIndex),
      backgroundColor: 'var(--mui-palette-header-bg, #ebf5fa) !important',
      borderBottom: '1px solid #d4e7f2 !important',
      ...(stickySide === 'right'
        ? {
            borderLeft: '1px solid #d4e7f2 !important',
            boxShadow: '-2px 0 4px -2px rgba(0, 0, 0, 0.08)',
          }
        : {
            borderRight: '1px solid #d4e7f2 !important',
            boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.08)',
          }),
      backgroundImage: 'none',
    },
  };
};

export const buildDataGridStickyColumnCellSx = (
  field: string,
  {
    side,
    left,
    right,
    zIndex,
  }: {
    side?: DataGridStickyColumnSide;
    left?: number;
    right?: number;
    zIndex: number;
  },
): Record<string, unknown> => {
  const stickySide = resolveStickySide(side, left, right);

  return {
    [stickyColumnCellSelector(field)]: {
      ...buildStickyPositionSx(stickySide, left, right, zIndex),
      backgroundColor: 'var(--mui-palette-background-paper, #ffffff) !important',
      ...(stickySide === 'right'
        ? {
            borderLeft: '1px solid var(--mui-palette-divider, #e2e8f0) !important',
            boxShadow: '-2px 0 4px -2px rgba(0, 0, 0, 0.06)',
          }
        : {
            borderRight: '1px solid var(--mui-palette-divider, #e2e8f0) !important',
            boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.06)',
          }),
    },
    [`& .MuiDataGrid-row:hover .MuiDataGrid-cell[data-field="${field}"]`]: {
      backgroundColor: 'var(--mui-palette-action-hover, rgba(0, 98, 255, 0.04)) !important',
    },
    [`& .MuiDataGrid-row.Mui-selected .MuiDataGrid-cell[data-field="${field}"]`]: {
      backgroundColor: 'var(--mui-palette-action-selected, rgba(0, 98, 255, 0.09)) !important',
    },
  };
};

export const buildDataGridStickyColumnsGridSx = (
  columns: DataGridStickyColumnConfig[],
): SxProps<Theme> =>
  columns.reduce<Record<string, unknown>>(
    (gridSx, column) => ({
      ...gridSx,
      ...buildDataGridStickyColumnHeaderSx(column.field, {
        side: column.side,
        left: column.left,
        right: column.right,
        zIndex: column.headerZIndex ?? 3,
      }),
      ...buildDataGridStickyColumnCellSx(column.field, {
        side: column.side,
        left: column.left,
        right: column.right,
        zIndex: column.cellZIndex ?? 2,
      }),
    }),
    {},
  );
