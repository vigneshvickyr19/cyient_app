import { Box, CircularProgress, Skeleton, Stack, Typography } from '@mui/material';

/** A page (or the whole screen) that is loading. */
export function PageLoader({ label = 'Loading…', fullPage = false }: { label?: string; fullPage?: boolean }) {
  return (
    <Stack
      role="status"
      aria-live="polite"
      spacing={2}
      sx={{ alignItems: 'center', justifyContent: 'center', minHeight: fullPage ? '100vh' : 240, color: 'text.secondary' }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2">{label}</Typography>
    </Stack>
  );
}

/** Placeholder lines while a section loads, keeping the layout steady. */
export function SectionSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <Box role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} variant="text" height={28} width={i === rows - 1 ? '60%' : '100%'} />
      ))}
    </Box>
  );
}
