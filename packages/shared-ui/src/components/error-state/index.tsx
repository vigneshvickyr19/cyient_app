import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Box, Button, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { sxList } from '../sxArray';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  fullPage?: boolean;
  sx?: SxProps<Theme>;
}

/** Something could not be loaded or shown, centered cleanly with a way to try again. */
export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
  fullPage = false,
  sx,
}: ErrorStateProps) {
  return (
    <Stack
      role="alert"
      spacing={2}
      sx={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 4,
          flex: 1,
          width: '100%',
          minHeight: fullPage ? '100vh' : 'calc(100vh - 200px)',
          m: 'auto',
        },
        ...sxList(sx),
      ]}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 0.5,
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 32 }} />
      </Box>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, lineHeight: 1.6 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button
          variant="outlined"
          onClick={onRetry}
          sx={{
            mt: 1,
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderColor: '#00a3ad',
            color: '#00a3ad',
            '&:hover': {
              borderColor: '#00838b',
              bgcolor: 'rgba(0, 163, 173, 0.04)',
            },
          }}
        >
          Try again
        </Button>
      )}
      {action}
    </Stack>
  );
}
