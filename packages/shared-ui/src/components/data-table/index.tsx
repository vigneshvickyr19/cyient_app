import * as React from 'react';
import type { PageMeta } from '@cyient/api-client';
import {
  DEFAULT_PAGE_SIZE_OPTIONS,
  EMPTY_CELL_FALLBACK,
  isCellEmpty,
  PAGINATION_DEFAULTS,
} from '@cyient/shared-utils';
import {
  Box,
  Skeleton,
  type SxProps,
  type Theme,
  Tooltip,
} from '@mui/material';
import {
  DataGrid,
  type GridCallbackDetails,
  type GridColDef,
  type GridRowClassNameParams,
  type GridRowParams,
  type GridRowSelectionModel,
  type GridSortModel,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import { CustomPagination } from '../pagination/CustomPagination';
import { EmptyState } from '../empty-state';
import { sxList } from '../sxArray';
import { CustomDrawer, type CustomDrawerProps } from '../custom-drawer';
import {
  DataTableHeader,
  type ActionButton,
  type DataTableHeaderProps,
} from './table-header';
import {
  buildDataGridStickyColumnsGridSx,
  type DataGridStickyColumnConfig,
} from './stickyColumns';

/** A string with something in it, or undefined (so an empty description falls through to the next choice). */
const nonEmpty = (value: unknown): string | undefined => (typeof value === 'string' && value !== '' ? value : undefined);

const SKELETON_WIDTH_PRESETS = ['65%', '85%', '50%', '75%', '40%', '90%', '60%'] as const;

export type { DataGridStickyColumnConfig, DataGridStickyColumnSide } from './stickyColumns';
export { buildDataGridStickyColumnsGridSx } from './stickyColumns';
export { CustomPagination, type CustomPaginationProps } from '../pagination/CustomPagination';
export { DataTableHeader, type ActionButton, type DataTableHeaderProps } from './table-header';
export { CustomDrawer, CustomDrawer as DataTableFilterDrawer, type CustomDrawerProps } from '../custom-drawer';
export { EMPTY_CELL_FALLBACK, formatCellValue, isCellEmpty } from '@cyient/shared-utils';

export interface DataTableSort {
  field: string;
  descending: boolean;
}

export interface DataTableProps<Row extends GridValidRowModel> {
  rows: readonly Row[];
  columns: readonly GridColDef<Row>[];
  getRowId: (row: Row) => string | number;
  loading?: boolean;
  skeletonRows?: number;

  /** Paging from the API's meta; the grid pages on the server. Pages are 1-based, as in the API. */
  page?: number;
  pageSize?: number;
  meta?: PageMeta | null | undefined;
  totalCount?: number;
  defaultPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;

  /** Sorting on the server; leave out for columns that are not sortable by the API. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort | null) => void;
  onSortModelChange?: (model: GridSortModel, details: GridCallbackDetails) => void;

  onRowClick?: (row: Row) => void;
  getRowClassName?: (params: GridRowClassNameParams<Row>) => string;
  isRowSelectable?: (params: GridRowParams<Row>) => boolean;
  rowHeight?: number;

  checkboxSelection?: boolean;
  rowSelectionModel?: GridRowSelectionModel;
  onRowSelectionChange?: (newSelection: GridRowSelectionModel, details: GridCallbackDetails) => void;
  onRowSelectionModelChange?: (newSelection: GridRowSelectionModel, details: GridCallbackDetails) => void;
  keepNonExistentRowsSelected?: boolean;

  freezeLeftColumnsCount?: number;
  freezeRightColumnsCount?: number;
  stickyColumns?: readonly DataGridStickyColumnConfig[];

  enableCellTooltips?: boolean;
  enableHeaderTooltips?: boolean;
  tooltipMaxWidth?: number;
  cellEllipsis?: boolean;

  emptyTitle?: string;
  emptyMessage?: string;
  paginationShow?: boolean;
  showPaginationOnEmpty?: boolean;
  pageSizeOptions?: readonly number[];
  autoHeight?: boolean;
  disableVirtualization?: boolean;
  gridSx?: SxProps<Theme>;
  sx?: SxProps<Theme>;
  'aria-label'?: string;

  showHeader?: boolean;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  showActions?: boolean;
  actions?: ActionButton[];
  showFilterButton?: boolean;
  onFilterClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  filterButtonLabel?: string;
  filterActiveCount?: number;
  showExportButton?: boolean;
  onExportClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  exportButtonLabel?: string;
  exportLoading?: boolean;
  tableTitle?: React.ReactNode;
  tableSubtitle?: React.ReactNode;
  headerProps?: Partial<DataTableHeaderProps>;

  filterDrawerOpen?: boolean;
  onFilterDrawerClose?: () => void;
  filterDrawerTitle?: React.ReactNode;
  filterDrawerSubtitle?: React.ReactNode;
  filterDrawerContent?: React.ReactNode;
  onFilterApply?: () => void;
  onFilterReset?: () => void;
  filterDrawerProps?: Partial<CustomDrawerProps>;
}

/** The data grid of every list: paged on the server, with sticky columns, tooltips, a toolbar with search, filters and export, and an empty state. */
export function DataTable<Row extends GridValidRowModel>({
  rows,
  columns,
  getRowId,
  loading = false,
  skeletonRows = 5,
  page,
  pageSize,
  meta,
  totalCount: explicitTotalCount,
  defaultPageSize = PAGINATION_DEFAULTS.DEFAULT_PER_PAGE,
  onPageChange,
  sort,
  onSortChange,
  onSortModelChange,
  onRowClick,
  getRowClassName,
  isRowSelectable,
  rowHeight,
  checkboxSelection = false,
  rowSelectionModel,
  onRowSelectionChange,
  onRowSelectionModelChange,
  keepNonExistentRowsSelected = false,
  freezeLeftColumnsCount = 0,
  freezeRightColumnsCount = 0,
  stickyColumns,
  enableCellTooltips = true,
  enableHeaderTooltips = true,
  tooltipMaxWidth = 300,
  cellEllipsis = true,
  emptyTitle = 'No Data Found',
  emptyMessage = 'There are currently no records to display.',
  paginationShow = true,
  showPaginationOnEmpty = false,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  autoHeight = true,
  disableVirtualization = false,
  gridSx,
  sx,
  'aria-label': ariaLabel,
  showHeader,
  showSearch,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchDebounceMs,
  showActions = true,
  actions,
  showFilterButton,
  onFilterClick,
  filterButtonLabel,
  filterActiveCount,
  showExportButton,
  onExportClick,
  exportButtonLabel,
  exportLoading,
  tableTitle,
  tableSubtitle,
  headerProps,
  filterDrawerOpen,
  onFilterDrawerClose,
  filterDrawerTitle,
  filterDrawerSubtitle,
  filterDrawerContent,
  onFilterApply,
  onFilterReset,
  filterDrawerProps,
}: DataTableProps<Row>) {
  const [internalDrawerOpen, setInternalDrawerOpen] = React.useState(false);
  const isDrawerOpenControlled = filterDrawerOpen !== undefined;
  const isDrawerOpen = isDrawerOpenControlled ? filterDrawerOpen : internalDrawerOpen;

  const handleFilterClick = React.useCallback(
    (e?: React.MouseEvent<HTMLElement>) => {
      onFilterClick?.(e);
      if (!isDrawerOpenControlled && filterDrawerContent) {
        setInternalDrawerOpen(true);
      }
    },
    [onFilterClick, isDrawerOpenControlled, filterDrawerContent],
  );

  const handleDrawerClose = React.useCallback(() => {
    if (!isDrawerOpenControlled) {
      setInternalDrawerOpen(false);
    }
    onFilterDrawerClose?.();
  }, [isDrawerOpenControlled, onFilterDrawerClose]);

  const handleFilterApply = React.useCallback(() => {
    onFilterApply?.();
    if (!isDrawerOpenControlled) {
      setInternalDrawerOpen(false);
    }
  }, [onFilterApply, isDrawerOpenControlled]);

  const isPageControlled = page !== undefined;
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalPageSize, setInternalPageSize] = React.useState(defaultPageSize);

  const currentPage = isPageControlled ? page : internalPage;
  const currentPageSize = pageSize ?? internalPageSize;
  const totalRows = meta?.totalCount ?? explicitTotalCount ?? rows.length;

  const handlePageChange = React.useCallback(
    (newPage: number) => {
      if (!isPageControlled) {
        setInternalPage(newPage);
      }
      onPageChange?.(newPage, currentPageSize);
    },
    [isPageControlled, onPageChange, currentPageSize],
  );

  const handlePageSizeChange = React.useCallback(
    (newPageSize: number) => {
      if (!isPageControlled) {
        setInternalPage(1);
        setInternalPageSize(newPageSize);
      }
      onPageChange?.(1, newPageSize);
    },
    [isPageControlled, onPageChange],
  );

  const sortModel: GridSortModel = sort
    ? [{ field: sort.field, sort: sort.descending ? 'desc' : 'asc' }]
    : [];

  const stickyConfigs = React.useMemo(() => {
    const configs: DataGridStickyColumnConfig[] = [];
    let currentLeft = 0;

    if (checkboxSelection) {
      configs.push({
        field: '__check__',
        side: 'left',
        left: 0,
        headerZIndex: 4,
        cellZIndex: 3,
      });
      currentLeft = 50;
    }

    if (freezeLeftColumnsCount > 0) {
      const leftCols = columns.slice(0, freezeLeftColumnsCount);
      for (const col of leftCols) {
        const colWidth = col.width ?? col.minWidth ?? 120;
        configs.push({
          field: col.field,
          side: 'left',
          left: currentLeft,
          headerZIndex: 3,
          cellZIndex: 2,
        });
        currentLeft += colWidth;
      }
    }

    if (freezeRightColumnsCount > 0) {
      let currentRight = 0;
      const rightCols = [...columns.slice(Math.max(0, columns.length - freezeRightColumnsCount))].reverse();
      for (const col of rightCols) {
        const colWidth = col.width ?? col.minWidth ?? 100;
        configs.push({
          field: col.field,
          side: 'right',
          right: currentRight,
          headerZIndex: 3,
          cellZIndex: 2,
        });
        currentRight += colWidth;
      }
    }

    if (stickyColumns && stickyColumns.length > 0) {
      configs.push(...stickyColumns);
    }

    return configs;
  }, [checkboxSelection, freezeLeftColumnsCount, freezeRightColumnsCount, columns, stickyColumns]);

  const stickyGridSx = React.useMemo(() => {
    return buildDataGridStickyColumnsGridSx(stickyConfigs);
  }, [stickyConfigs]);

  const processedColumns = React.useMemo(() => {
    return columns.map((col) => {
      const updatedCol: GridColDef<Row> = { ...col };

      if (enableHeaderTooltips) {
        const headerTitle = nonEmpty(updatedCol.description) ?? nonEmpty(updatedCol.headerName) ?? updatedCol.field;

        const originalRenderHeader = updatedCol.renderHeader;
        updatedCol.renderHeader = (headerParams) => {
          const headerContent = originalRenderHeader
            ? originalRenderHeader(headerParams)
            : (headerParams.colDef.headerName ?? headerParams.field);

          return (
            <Tooltip title={headerTitle} arrow enterDelay={400} disableInteractive>
              <Box
                component="span"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                  display: 'inline-block',
                  maxWidth: '100%',
                }}
              >
                {headerContent}
              </Box>
            </Tooltip>
          );
        };
      }

      const originalRenderCell = updatedCol.renderCell;
      updatedCol.renderCell = (params) => {
        const rendered: unknown = originalRenderCell
          ? originalRenderCell(params)
          : params.formattedValue !== undefined
            ? params.formattedValue
            : params.value;

        let displayContent: React.ReactNode;
        const isContentEmpty = !React.isValidElement(rendered) && isCellEmpty(rendered);

        if (React.isValidElement(rendered)) {
          displayContent = rendered;
        } else if (isContentEmpty) {
          displayContent = EMPTY_CELL_FALLBACK;
        } else {
          displayContent = rendered as React.ReactNode;
        }

        const tooltipText =
          !isContentEmpty && (typeof rendered === 'string' || typeof rendered === 'number')
            ? String(rendered)
            : !isContentEmpty && (typeof params.value === 'string' || typeof params.value === 'number')
              ? String(params.value)
              : '';

        const contentBox = (
          <Box
            component="span"
            sx={
              cellEllipsis
                ? {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    maxWidth: '100%',
                    color: isContentEmpty ? 'text.secondary' : undefined,
                  }
                : {
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    display: 'inline-block',
                    maxWidth: '100%',
                    color: isContentEmpty ? 'text.secondary' : undefined,
                  }
            }
          >
            {displayContent}
          </Box>
        );

        if (enableCellTooltips && tooltipText.trim().length > 0) {
          return (
            <Tooltip
              title={tooltipText}
              arrow
              enterDelay={500}
              disableInteractive
              slotProps={{
                popper: {
                  sx: {
                    maxWidth: tooltipMaxWidth,
                    '& .MuiTooltip-tooltip': {
                      maxWidth: tooltipMaxWidth,
                    },
                  },
                },
              }}
            >
              {contentBox}
            </Tooltip>
          );
        }

        return contentBox;
      };

      return updatedCol;
    });
  }, [columns, enableHeaderTooltips, enableCellTooltips, cellEllipsis, tooltipMaxWidth]);

  const handleSelectionModelChange = React.useCallback(
    (newModel: GridRowSelectionModel, details: GridCallbackDetails) => {
      onRowSelectionChange?.(newModel, details);
      onRowSelectionModelChange?.(newModel, details);
    },
    [onRowSelectionChange, onRowSelectionModelChange],
  );

  const CustomFooter = React.useCallback(() => {
    if (!paginationShow || (totalRows === 0 && !showPaginationOnEmpty)) return null;
    return (
      <CustomPagination
        page={currentPage}
        pageSize={currentPageSize}
        totalCount={totalRows}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={pageSizeOptions}
        disabled={loading}
      />
    );
  }, [
    paginationShow,
    showPaginationOnEmpty,
    currentPage,
    currentPageSize,
    totalRows,
    handlePageChange,
    handlePageSizeChange,
    pageSizeOptions,
    loading,
  ]);

  const NoRowsOverlay = React.useCallback(
    () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          minHeight: 240,
          py: 4,
          px: 2,
        }}
      >
        <EmptyState title={emptyTitle} message={emptyMessage} />
      </Box>
    ),
    [emptyTitle, emptyMessage],
  );

  // Fallback-safe getRowId to handle heterogeneous models (id, userId, publicId, etc.)
  const safeGetRowId = React.useCallback(
    (row: Row): string | number => {
      try {
        const id = getRowId(row);
        if (id !== undefined && id !== null) return id;
      } catch {
        // ignore
      }
      const r = row as Record<string, unknown>;
      return (
        (r.id as string | number) ??
        (r.userId as string | number) ??
        (r.publicId as string | number) ??
        (r.key as string | number) ??
        Math.random()
      );
    },
    [getRowId],
  );

  const DataGridSkeletonOverlay = React.useCallback(
    () => (
      <Box
        data-testid="datagrid-skeleton-overlay"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(1px)',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          p: 1.5,
          gap: 1.25,
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton
            key={`overlay-skeleton-${i}`}
            variant="rounded"
            height={rowHeight ? rowHeight - 12 : 36}
            animation="wave"
            sx={{ width: '100%', borderRadius: 1 }}
          />
        ))}
      </Box>
    ),
    [skeletonRows, rowHeight],
  );

  let contentElement: React.ReactElement;

  if (rows.length === 0) {
    contentElement = (
      <Box
        aria-label={ariaLabel}
        data-testid={loading ? 'data-table-skeleton' : undefined}
        sx={[
          {
            borderRadius: 2,
            border: '1px solid #d4e7f2',
            overflow: 'hidden',
            backgroundColor: 'background.paper',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            '[data-mui-color-scheme="dark"] &': {
              borderColor: '#1e3a5f',
            },
          },
          ...sxList(gridSx),
          ...sxList(sx),
        ]}
      >
        {/* One scroll area for the header and the message / skeleton, so the scrollbar sits at the table's bottom edge */}
        <Box sx={{ overflowX: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--mui-palette-header-bg, #ebf5fa)',
              borderBottom: '1px solid #d4e7f2',
              minHeight: 48,
              width: '100%',
              minWidth: 'max-content',
              '[data-mui-color-scheme="dark"] &': {
                backgroundColor: '#111e2e',
                borderColor: '#1e3a5f',
              },
            }}
          >
            {checkboxSelection && (
              <Box
                sx={{
                  width: 50,
                  minWidth: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight: '1px solid #d4e7f2',
                  py: 1.5,
                  '[data-mui-color-scheme="dark"] &': {
                    borderColor: '#1e3a5f',
                  },
                }}
              />
            )}
            {columns.map((col, idx) => (
              <Box
                key={col.field}
                sx={{
                  flex: col.flex ?? (col.width ? undefined : 1),
                  width: col.width,
                  minWidth: col.minWidth ?? (col.width ? undefined : 100),
                  px: 2,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--mui-palette-text-primary, #334155)',
                  borderRight: idx < columns.length - 1 ? '1px solid #d4e7f2' : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '[data-mui-color-scheme="dark"] &': {
                    color: '#cbd5e1',
                    borderColor: '#1e3a5f',
                  },
                }}
              >
                {col.headerName ?? col.field}
              </Box>
            ))}
          </Box>

          {loading ? (
            <Box data-testid="skeleton-rows" sx={{ width: '100%', minWidth: 'max-content' }}>
              {Array.from({ length: skeletonRows }).map((_, rowIdx) => (
                <Box
                  key={`skeleton-row-${rowIdx}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: rowHeight ?? 48,
                    height: rowHeight ?? 48,
                    width: '100%',
                    minWidth: 'max-content',
                    borderBottom: rowIdx < skeletonRows - 1 ? '1px solid #edf2f7' : 'none',
                    backgroundColor: 'background.paper',
                    '[data-mui-color-scheme="dark"] &': {
                      borderColor: '#1e3a5f',
                    },
                  }}
                >
                  {checkboxSelection && (
                    <Box
                      sx={{
                        width: 50,
                        minWidth: 50,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRight: '1px solid #d4e7f2',
                        px: 1.5,
                        '[data-mui-color-scheme="dark"] &': {
                          borderColor: '#1e3a5f',
                        },
                      }}
                    >
                      <Skeleton
                        variant="rounded"
                        width={18}
                        height={18}
                        animation="wave"
                        sx={{ borderRadius: 0.5 }}
                      />
                    </Box>
                  )}
                  {columns.map((col, colIdx) => (
                    <Box
                      key={`skeleton-cell-${rowIdx}-${col.field}`}
                      sx={{
                        flex: col.flex ?? (col.width ? undefined : 1),
                        width: col.width,
                        minWidth: col.minWidth ?? (col.width ? undefined : 100),
                        px: 2,
                        py: 1,
                        display: 'flex',
                        alignItems: 'center',
                        borderRight: colIdx < columns.length - 1 ? '1px solid #d4e7f2' : 'none',
                        '[data-mui-color-scheme="dark"] &': {
                          borderColor: '#1e3a5f',
                        },
                      }}
                    >
                      <Skeleton
                        variant="rounded"
                        height={16}
                        width={SKELETON_WIDTH_PRESETS[(rowIdx * 3 + colIdx) % SKELETON_WIDTH_PRESETS.length]}
                        animation="wave"
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 240,
                py: 6,
                px: 2,
                backgroundColor: 'background.paper',
                position: 'sticky',
                left: 0,
              }}
            >
              <EmptyState title={emptyTitle} message={emptyMessage} />
            </Box>
          )}
        </Box>

        {showPaginationOnEmpty && (
          <CustomPagination
            page={currentPage}
            pageSize={currentPageSize}
            totalCount={totalRows}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={pageSizeOptions}
            disabled
          />
        )}
      </Box>
    );
  } else {
    contentElement = (
      <DataGrid<Row>
        aria-label={ariaLabel}
        rows={rows}
        columns={processedColumns}
        getRowId={safeGetRowId}
        loading={loading}
        autoHeight={autoHeight}
        paginationMode="server"
        sortingMode="server"
        rowCount={totalRows}
        paginationModel={{ page: Math.max(0, currentPage - 1), pageSize: currentPageSize }}
        sortModel={sortModel}
        onSortModelChange={(model, details) => {
          onSortModelChange?.(model, details);
          const first = model[0];
          onSortChange?.(first?.sort ? { field: first.field, descending: first.sort === 'desc' } : null);
        }}
        disableColumnFilter
        disableColumnMenu
        disableVirtualization={disableVirtualization || freezeLeftColumnsCount > 0 || freezeRightColumnsCount > 0}
        rowHeight={rowHeight ?? 48}
        columnHeaderHeight={48}
        checkboxSelection={checkboxSelection}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={handleSelectionModelChange}
        keepNonExistentRowsSelected={keepNonExistentRowsSelected}
        getRowClassName={getRowClassName}
        isRowSelectable={isRowSelectable}
        onRowClick={onRowClick ? (params: GridRowParams<Row>) => { onRowClick(params.row); } : undefined}
        slots={{
          noRowsOverlay: NoRowsOverlay,
          loadingOverlay: DataGridSkeletonOverlay,
          footer: CustomFooter,
        }}
      sx={[
        {
          borderRadius: 2,
          border: '1px solid #d4e7f2',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          // MUI makes the grid fill whatever height its parent has; a table that sizes to its rows must not stretch
          ...(autoHeight ? { flex: '0 0 auto' } : {}),
          '& .MuiDataGrid-main': {
            minHeight: rows.length === 0 ? 240 : undefined,
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'var(--mui-palette-header-bg, #ebf5fa)',
            borderBottom: '1px solid #d4e7f2',
            minHeight: '48px !important',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: 'var(--mui-palette-header-bg, #ebf5fa)',
            borderRight: '1px solid #d4e7f2',
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-columnHeader:last-child': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            color: 'var(--mui-palette-text-primary, #334155)',
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-row': {
            borderBottom: '1px solid #f1f5f9',
            '&:hover': {
              backgroundColor: 'rgba(235, 245, 250, 0.45)',
            },
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f1f5f9',
            fontSize: '0.875rem',
            color: 'var(--mui-palette-text-primary, #334155)',
            '&:focus, &:focus-within': {
              outline: 'none',
            },
          },
          ...(rows.length === 0
            ? {
                '& .MuiDataGrid-virtualScroller': {
                  minHeight: '240px !important',
                  overflow: 'hidden !important',
                  overflowX: 'hidden !important',
                  overflowY: 'hidden !important',
                },
                '& .MuiDataGrid-virtualScrollerContent': {
                  minHeight: '240px !important',
                },
                '& .MuiDataGrid-overlayWrapper': {
                  minHeight: '240px !important',
                  height: '240px !important',
                },
                '& .MuiDataGrid-overlayWrapperInner': {
                  minHeight: '240px !important',
                  height: '240px !important',
                },
                '& .MuiDataGrid-scrollbar, & .MuiDataGrid-scrollbar--horizontal': {
                  display: 'none !important',
                },
              }
            : {}),
          '[data-mui-color-scheme="dark"] &': {
            borderColor: '#1e3a5f',
            '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeader': {
              backgroundColor: '#111e2e',
              borderColor: '#1e3a5f',
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#cbd5e1',
            },
            '& .MuiDataGrid-row': {
              borderColor: '#1e293b',
              '&:hover': {
                backgroundColor: 'rgba(30, 58, 95, 0.3)',
              },
            },
            '& .MuiDataGrid-cell': {
              borderColor: '#1e293b',
              color: '#e2e8f0',
            },
          },
        },
        onRowClick ? { '& .MuiDataGrid-row': { cursor: 'pointer' } } : {},
        stickyGridSx,
        ...sxList(gridSx),
        ...sxList(sx),
      ] as SxProps<Theme>}
    />
    );
  }

  const hasHeaderContent =
    showHeader ??
    [
      tableTitle,
      tableSubtitle,
      actions?.length,
      onSearchChange,
      searchValue !== undefined,
      showFilterButton,
      onFilterClick,
      filterDrawerContent,
      showExportButton,
      onExportClick,
      headerProps,
    ].some(Boolean);

  const renderedHeader = hasHeaderContent ? (
    <DataTableHeader
      title={tableTitle}
      subtitle={tableSubtitle}
      showSearch={showSearch ?? (Boolean(onSearchChange) || searchValue !== undefined)}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder={searchPlaceholder}
      searchDebounceMs={searchDebounceMs}
      showActions={showActions}
      actions={actions}
      showFilterButton={showFilterButton ?? (Boolean(onFilterClick) || Boolean(filterDrawerContent))}
      onFilterClick={handleFilterClick}
      filterButtonLabel={filterButtonLabel}
      filterActiveCount={filterActiveCount}
      showExportButton={showExportButton ?? Boolean(onExportClick)}
      onExportClick={onExportClick}
      exportButtonLabel={exportButtonLabel}
      exportLoading={exportLoading}
      {...headerProps}
    />
  ) : null;

  const renderedFilterDrawer = filterDrawerContent ? (
    <CustomDrawer
      open={isDrawerOpen}
      onClose={handleDrawerClose}
      title={filterDrawerTitle ?? 'Filters'}
      subtitle={filterDrawerSubtitle}
      onApply={handleFilterApply}
      onReset={onFilterReset}
      {...filterDrawerProps}
    >
      {filterDrawerContent}
    </CustomDrawer>
  ) : null;

  if (!hasHeaderContent && !renderedFilterDrawer) {
    return contentElement;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {renderedHeader}
      {contentElement}
      {renderedFilterDrawer}
    </Box>
  );
}
