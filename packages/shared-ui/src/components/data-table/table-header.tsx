import * as React from 'react';
import ClearIcon from '@mui/icons-material/Clear';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SearchIcon from '@mui/icons-material/Search';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import {
  Badge,
  Box,
  Button,
  ButtonBase,
  type ButtonProps,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  type SxProps,
  TextField,
  type Theme,
  Typography,
} from '@mui/material';

export interface ActionButton {
  label?: string;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  sx?: ButtonProps['sx'];
  disabled?: boolean;
  id?: string;
  render?: () => React.ReactNode;
};

export interface HeaderTabItem {
  id: string;
  label: string;
  count?: number;
}

export interface SortOptionItem {
  value: string;
  label: string;
}

export interface DataTableHeaderProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;

  tabs?: readonly HeaderTabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

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

  resultCount?: React.ReactNode;
  sortOptions?: readonly SortOptionItem[];
  currentSort?: string;
  onSortChange?: (sortValue: string) => void;

  children?: React.ReactNode;
  sx?: SxProps<Theme>;
}

/** The toolbar above a data table: title, tabs, debounced search, filter and export buttons, a result count and sorting. */
export function DataTableHeader({
  title,
  subtitle,
  tabs,
  activeTab,
  onTabChange,
  showSearch = true,
  searchValue: controlledSearchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchDebounceMs = 500,
  showActions = true,
  actions = [],
  showFilterButton,
  onFilterClick,
  filterButtonLabel = 'Filter',
  filterActiveCount = 0,
  showExportButton,
  onExportClick,
  exportButtonLabel = 'Export',
  exportLoading = false,
  resultCount,
  sortOptions,
  currentSort,
  onSortChange,
  children,
  sx,
}: DataTableHeaderProps) {
  const isSearchControlled = controlledSearchValue !== undefined;
  const [internalSearch, setInternalSearch] = React.useState(controlledSearchValue ?? '');
  const searchInput = isSearchControlled ? controlledSearchValue : internalSearch;

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync internal search when controlled value changes
  React.useEffect(() => {
    if (isSearchControlled) setInternalSearch(controlledSearchValue);
  }, [isSearchControlled, controlledSearchValue]);

  const triggerSearch = React.useCallback(
    (next: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      onSearchChange?.(next);
    },
    [onSearchChange],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    if (!isSearchControlled) {
      setInternalSearch(nextVal);
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      triggerSearch(nextVal);
    }, searchDebounceMs);
  };

  const handleClearSearch = () => {
    if (!isSearchControlled) {
      setInternalSearch('');
    }
    triggerSearch('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch(searchInput);
    }
  };

  const shouldShowFilter = showFilterButton ?? Boolean(onFilterClick);
  const shouldShowExport = showExportButton ?? Boolean(onExportClick);
  const hasSubRow = Boolean(resultCount) || Boolean(sortOptions?.length);

  return (
    <Box sx={{ width: '100%', mb: 2.5, ...sx }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          gap: { xs: 1.5, md: 2 },
          width: '100%',
        }}
      >
        {tabs && tabs.length > 0 ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              p: '3px',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
              gap: 0.5,
              overflowX: 'auto',
              maxWidth: '100%',
            }}
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <ButtonBase
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 600 : 500,
                    bgcolor: isActive ? 'rgba(0, 163, 173, 0.12)' : 'transparent',
                    color: isActive ? '#007a82' : 'text.secondary',
                    border: isActive
                      ? '1px solid rgba(0, 163, 173, 0.25)'
                      : '1px solid transparent',
                    transition: 'all 0.15s ease-in-out',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: isActive ? 'rgba(0, 163, 173, 0.16)' : 'action.hover',
                      color: isActive ? '#007a82' : 'text.primary',
                    },
                  }}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1,
                        px: 0.9,
                        py: 0.15,
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: isActive ? '#00a3ad' : 'action.selected',
                        color: isActive ? '#ffffff' : 'text.secondary',
                      }}
                    >
                      {tab.count}
                    </Box>
                  )}
                </ButtonBase>
              );
            })}
          </Box>
        ) : (title || subtitle || children) ? (
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography
                variant="h6"
                component="h2"
                sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.25 }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: 'text.secondary', mt: 0.25, fontSize: '0.85rem' }}
              >
                {subtitle}
              </Typography>
            )}
            {children}
          </Box>
        ) : null}

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 1.25,
            ml: { xs: 0, md: 'auto' },
          }}
        >
          {showSearch && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        aria-label="Clear search"
                        edge="end"
                        sx={{ p: 0.5, color: 'text.secondary' }}
                      >
                        <ClearIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                width: { xs: '100%', sm: 260, md: 280 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: 'background.paper',
                  fontSize: '0.875rem',
                  '& fieldset': {
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'text.secondary',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          )}

          {showActions && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 1.25,
                alignItems: 'center',
              }}
            >
              {shouldShowFilter && (
                <Badge
                  badgeContent={filterActiveCount}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: '#00a3ad',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      height: 18,
                      minWidth: 18,
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onFilterClick}
                    startIcon={<TuneOutlinedIcon sx={{ fontSize: 18, color: '#00a3ad' }} />}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      px: 2,
                      py: 0.85,
                      '&:hover': {
                        borderColor: '#00a3ad',
                        bgcolor: 'rgba(0, 163, 173, 0.05)',
                      },
                    }}
                  >
                    {filterButtonLabel}
                  </Button>
                </Badge>
              )}

              {shouldShowExport && (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={onExportClick}
                  disabled={exportLoading}
                  startIcon={
                    exportLoading ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <FileDownloadOutlinedIcon sx={{ fontSize: 18, color: '#00a3ad' }} />
                    )
                  }
                  sx={{
                    textTransform: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    px: 2,
                    py: 0.85,
                    '&:hover': {
                      borderColor: '#00a3ad',
                      bgcolor: 'rgba(0, 163, 173, 0.05)',
                    },
                  }}
                >
                  {exportButtonLabel}
                </Button>
              )}

              {actions.map((action, i) =>
                action.render ? (
                  <Box key={action.id ?? i} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {action.render()}
                  </Box>
                ) : (
                  <Button
                    key={action.id ?? i}
                    id={action.id}
                    variant={action.variant ?? 'contained'}
                    color={action.color ?? 'primary'}
                    onClick={action.onClick}
                    startIcon={action.startIcon}
                    endIcon={action.endIcon}
                    disabled={action.disabled}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '10px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      width: { xs: '100%', sm: 'auto' },
                      px: 2,
                      py: 0.85,
                      ...action.sx,
                    }}
                  >
                    {action.label ?? 'Action'}
                  </Button>
                ),
              )}
            </Box>
          )}
        </Box>
      </Box>

      {hasSubRow && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1.5,
            pt: 0.5,
            width: '100%',
          }}
        >
          {resultCount ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {resultCount}
            </Typography>
          ) : (
            <Box />
          )}

          {sortOptions && sortOptions.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Select
                size="small"
                value={currentSort ?? sortOptions[0]?.value}
                onChange={(e) => onSortChange?.(String(e.target.value))}
                variant="standard"
                disableUnderline
                IconComponent={KeyboardArrowDownIcon}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '& .MuiSelect-select': {
                    py: 0.5,
                    pr: '24px !important',
                  },
                  '& .MuiSelect-icon': {
                    fontSize: 18,
                    color: 'text.secondary',
                    right: 0,
                  },
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {sortOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.875rem' }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default DataTableHeader;
