import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** An empty list or section: an icon, a message and an optional action. */
export function EmptyState({
  title = 'No Data Found',
  message = 'There are currently no records to display.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <Stack
      spacing={1}
      sx={{
        alignItems: 'center',
        textAlign: 'center',
        py: 4,
        px: 2,
        color: 'text.secondary',
      }}
    >
      {icon ?? (
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
            '[data-mui-color-scheme="dark"] &': {
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              color: '#38bdf8',
            },
          }}
        >
          <InboxOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
      )}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          fontSize: '1rem',
          color: 'text.primary',
        }}
      >
        {title}
      </Typography>
      {message && (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 480,
            fontSize: '0.875rem',
            color: 'text.secondary',
          }}
        >
          {message}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
