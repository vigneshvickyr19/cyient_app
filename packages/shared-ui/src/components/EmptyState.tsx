import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** Nothing to show yet, and what to do about it. */
export function EmptyState({ title, message, icon, action }: EmptyStateProps) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center', py: 6, px: 2, color: 'text.secondary' }}>
      {icon ?? <InboxOutlinedIcon sx={{ fontSize: 40 }} />}
      <Typography variant="subtitle1" color="text.primary">
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" sx={{ maxWidth: 480 }}>
          {message}
        </Typography>
      )}
      {action}
    </Stack>
  );
}
