import * as React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  type SxProps,
  type Theme,
  Typography,
} from '@mui/material';

export interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  width?: number | string | { xs?: number | string; sm?: number | string };
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  children: React.ReactNode;

  onApply?: () => void;
  onReset?: () => void;
  applyLabel?: string;
  resetLabel?: string;
  applyDisabled?: boolean;
  resetDisabled?: boolean;
  loading?: boolean;
  hideFooter?: boolean;
  footer?: React.ReactNode;

  headerSx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  footerSx?: SxProps<Theme>;
  paperSx?: SxProps<Theme>;
  /** Optional test identifier. */
  'data-testid'?: string;
}

/** A slide-out panel with a title, a scrollable body and a Reset / Apply footer, for example for filters. */
export function CustomDrawer({
  open,
  onClose,
  title = 'Filters',
  subtitle,
  width = 400,
  anchor = 'right',
  children,
  onApply,
  onReset,
  applyLabel = 'Apply',
  resetLabel = 'Reset',
  applyDisabled = false,
  resetDisabled = false,
  loading = false,
  hideFooter = false,
  footer,
  headerSx,
  contentSx,
  footerSx,
  paperSx,
  'data-testid': testId = 'custom-drawer',
}: CustomDrawerProps) {
  const resolvedWidth =
    typeof width === 'object'
      ? { xs: width.xs ?? '100vw', sm: width.sm ?? 400 }
      : { xs: '100vw', sm: width };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      data-testid={testId}
      slotProps={{
        paper: {
          sx: {
            width: resolvedWidth,
            maxWidth: '100vw',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.12)',
            zIndex: (theme) => theme.zIndex.drawer + 2,
            ...paperSx,
          },
        },
      }}
    >
      <Box
        sx={{
          px: { xs: 2.5, sm: 3 },
          py: 2.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          ...headerSx,
        }}
      >
        <Box sx={{ minWidth: 0, pr: 1 }}>
          <Typography
            variant="h6"
            component="h2"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.05rem', sm: '1.15rem' },
              color: 'text.primary',
              letterSpacing: '-0.2px',
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                mt: 0.25,
                fontSize: '0.8rem',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close drawer"
          size="small"
          sx={{
            color: 'text.secondary',
            p: 0.75,
            borderRadius: '8px',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: { xs: 2.5, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          scrollbarWidth: 'thin',
          scrollbarColor: (t) => `${t.palette.divider} transparent`,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (t) => t.palette.divider,
            borderRadius: 3,
          },
          ...contentSx,
        }}
      >
        {children}
      </Box>

      {!hideFooter && (
        <>
          <Divider />
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              px: { xs: 2.5, sm: 3 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: 'background.paper',
              borderTop: '1px solid',
              borderColor: 'divider',
              ...footerSx,
            }}
          >
            {footer ?? (
              <>
                {onReset && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={onReset}
                    disabled={loading || resetDisabled}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 2.5,
                      py: 1,
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'text.secondary',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {resetLabel}
                  </Button>
                )}
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onApply ?? onClose}
                    disabled={loading || applyDisabled}
                    startIcon={
                      loading ? <CircularProgress size={16} color="inherit" /> : undefined
                    }
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: '8px',
                      px: 3,
                      py: 1,
                      bgcolor: '#00a3ad',
                      boxShadow: '0 2px 6px rgba(0, 163, 173, 0.25)',
                      '&:hover': {
                        bgcolor: '#008e97',
                      },
                    }}
                  >
                    {applyLabel}
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </>
      )}
    </Drawer>
  );
}

export default CustomDrawer;
