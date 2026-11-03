import { Alert, AlertTitle, Box, Card, CardContent, CardHeader, Chip, Divider, Stack, Typography, type AlertColor } from '@mui/material';
import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'error' | 'primary';

/** A status or label chip; each app maps its statuses to tones in one place. */
export function StatusChip({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  return <Chip label={label} color={tone === 'neutral' ? 'default' : tone} variant={tone === 'neutral' ? 'outlined' : 'filled'} />;
}

export interface DetailItem {
  label: string;
  value: ReactNode;
  /** Takes the whole row (long text). */
  wide?: boolean;
}

/** Read-only fields in a responsive grid of label and value. */
export function DetailList({ items, columns = 3 }: { items: readonly DetailItem[]; columns?: 2 | 3 | 4 }) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: `repeat(${columns}, minmax(0, 1fr))` },
      }}
    >
      {items.map((item) => (
        <Box key={item.label} sx={{ gridColumn: item.wide ? '1 / -1' : undefined, minWidth: 0 }}>
          <Typography component="dt" variant="caption" color="text.secondary">
            {item.label}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {item.value === null || item.value === undefined || item.value === '' ? '—' : item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

interface SectionCardProps {
  title: ReactNode;
  subheader?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** No padding inside, for tables that reach the edges. */
  flush?: boolean;
}

/** A titled section of a page. */
export function SectionCard({ title, subheader, actions, children, flush = false }: SectionCardProps) {
  return (
    <Card>
      <CardHeader
        title={title}
        subheader={subheader}
        action={actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
        slotProps={{ title: { variant: 'h6', component: 'h2' }, subheader: { variant: 'body2' } }}
        sx={{ '& .MuiCardHeader-action': { alignSelf: 'center', m: 0 } }}
      />
      <Divider />
      {flush ? children : <CardContent>{children}</CardContent>}
    </Card>
  );
}

/** A message on the page (not a pop-up): what happens next, a warning, a refusal. */
export function InlineAlert({ severity = 'info', title, children, action }: { severity?: AlertColor; title?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <Alert severity={severity} action={action}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </Alert>
  );
}
