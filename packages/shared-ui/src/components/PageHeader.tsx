import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Breadcrumbs, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: readonly Crumb[];
  /** A back button to this address. */
  backTo?: string;
  /** Next to the title, for example the status chip. */
  status?: ReactNode;
  /** Buttons on the right. */
  actions?: ReactNode;
}

/** The title row of every page, with breadcrumbs, status and the page's main actions. */
export function PageHeader({ title, subtitle, breadcrumbs, backTo, status, actions }: PageHeaderProps) {
  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="Breadcrumb">
          {breadcrumbs.map((crumb) =>
            crumb.to ? (
              <Link key={crumb.label} component={RouterLink} to={crumb.to} underline="hover" color="inherit" variant="body2">
                {crumb.label}
              </Link>
            ) : (
              <Typography key={crumb.label} variant="body2" color="text.primary">
                {crumb.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          {backTo && (
            <Tooltip title="Back">
              <IconButton component={RouterLink} to={backTo} aria-label="Back" edge="start">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          <Stack sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h3" component="h1" sx={{ overflowWrap: 'anywhere' }}>
                {title}
              </Typography>
              {status}
            </Stack>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
        {actions && (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, '& > *': { m: '0 !important' } }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}
