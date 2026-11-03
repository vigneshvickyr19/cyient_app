import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  fullPage?: boolean;
}

/** Something could not be loaded or shown, with a way to try again. */
export function ErrorState({ title = 'Something went wrong', message, onRetry, action, fullPage = false }: ErrorStateProps) {
  return (
    <Stack
      role="alert"
      spacing={1.5}
      sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', p: 4, minHeight: fullPage ? '100vh' : 240 }}
    >
      <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try again
        </Button>
      )}
      {action}
    </Stack>
  );
}
