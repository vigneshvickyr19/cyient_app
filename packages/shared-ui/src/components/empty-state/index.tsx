import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** An empty sheet with a magnifier, drawn in the theme's primary colour so it follows the light and dark schemes. */
function EmptyIllustration() {
  const paper = 'var(--mui-palette-background-paper, #fff)';
  return (
    <Box component="span" aria-hidden sx={{ display: 'inline-flex', color: 'primary.main', mb: 1 }}>
      <svg width="132" height="90" viewBox="0 0 132 104" fill="none">
        <ellipse cx="62" cy="94" rx="38" ry="5" fill="currentColor" opacity="0.1" />
        <circle cx="22" cy="30" r="3" fill="currentColor" opacity="0.25" />
        <circle cx="112" cy="22" r="4" fill="currentColor" opacity="0.18" />
        <path d="M104 44v8M100 48h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <rect x="33" y="12" width="52" height="66" rx="7" transform="rotate(-8 59 45)" fill="currentColor" opacity="0.1" />
        <rect x="38" y="14" width="52" height="68" rx="7" fill={paper} stroke="currentColor" strokeWidth="2.5" />
        <rect x="47" y="27" width="26" height="5" rx="2.5" fill="currentColor" opacity="0.35" />
        <rect x="47" y="39" width="34" height="4" rx="2" fill="currentColor" opacity="0.18" />
        <rect x="47" y="49" width="30" height="4" rx="2" fill="currentColor" opacity="0.18" />
        <rect x="47" y="59" width="18" height="4" rx="2" fill="currentColor" opacity="0.18" />
        <circle cx="88" cy="66" r="15" fill={paper} stroke="currentColor" strokeWidth="3.5" />
        <circle cx="88" cy="66" r="15" fill="currentColor" opacity="0.08" />
        <path d="M82 66h12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
        <path d="M99 77l11 11" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    </Box>
  );
}

/** An empty list or section: an illustration, a message and an optional action. */
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
      {icon ?? <EmptyIllustration />}
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
