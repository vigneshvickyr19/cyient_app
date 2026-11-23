import { DEFAULT_PAGE_SIZE_OPTIONS } from '@cyient/shared-utils';
import * as React from 'react';
import {
  Box,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material';

export interface CustomPaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: readonly number[];
  disabled?: boolean;
  showRecordsCount?: boolean;
  showPageSizeSelect?: boolean;
  activeColor?: string;
  sx?: SxProps<Theme>;
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  disabled = false,
  showRecordsCount = true,
  showPageSizeSelect = true,
  activeColor = '#ea580c',
  sx,
}) => {
  const safePageSize = Math.max(1, pageSize);
  const totalPages = Math.max(1, Math.ceil(totalCount / safePageSize));
  const validPage = Math.min(Math.max(1, page), totalPages);

  const options = React.useMemo(() => {
    if (pageSizeOptions.includes(safePageSize)) {
      return [...pageSizeOptions];
    }
    return [...pageSizeOptions, safePageSize].sort((a, b) => a - b);
  }, [pageSizeOptions, safePageSize]);

  const startRecord = totalCount === 0 ? 0 : (validPage - 1) * safePageSize + 1;
  const endRecord = Math.min(validPage * safePageSize, totalCount);

  const handlePageSelectChange = (event: SelectChangeEvent<number>) => {
    const nextSize = Number(event.target.value);
    onPageSizeChange?.(nextSize);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 1.5,
        px: 2.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
        borderBottomLeftRadius: 'inherit',
        borderBottomRightRadius: 'inherit',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: { xs: 'auto', sm: 220 } }}>
        {showRecordsCount && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            {totalCount > 0
              ? `Results ${startRecord}–${endRecord} of ${totalCount} ( Page ${validPage} of ${totalPages} )`
              : `Results 0 of 0 ( Page 1 of 1 )`}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          shape="rounded"
          size="small"
          count={totalPages}
          page={validPage}
          onChange={(_, newPage) => onPageChange(newPage)}
          disabled={disabled || totalPages <= 1}
          aria-label="Table pagination"
          renderItem={(item) => (
            <PaginationItem
              {...item}
              sx={{
                borderRadius: '6px',
                minWidth: 32,
                height: 32,
                fontSize: '0.875rem',
                fontWeight: item.selected ? 600 : 400,
                border: item.type === 'page' && !item.selected ? 'none' : '1px solid',
                borderColor: 'divider',
                color: item.selected ? '#ffffff' : 'text.primary',
                '&.Mui-selected': {
                  backgroundColor: `${activeColor} !important`,
                  color: '#ffffff !important',
                  borderColor: `${activeColor} !important`,
                  '&:hover': {
                    filter: 'brightness(0.92)',
                  },
                },
              }}
            />
          )}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1.25,
          minWidth: { xs: 'auto', sm: 220 },
        }}
      >
        {showPageSizeSelect && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}
            >
              Rows per page:
            </Typography>
            <Select
              size="small"
              value={safePageSize}
              onChange={handlePageSelectChange}
              disabled={disabled}
              aria-label="Rows per page"
              sx={{
                height: 32,
                fontSize: '0.875rem',
                borderRadius: 1.5,
                backgroundColor: 'background.paper',
                '& .MuiSelect-select': {
                  py: '4px',
                  px: '10px',
                },
              }}
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: '0.875rem' }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
      </Box>
    </Box>
  );
};
