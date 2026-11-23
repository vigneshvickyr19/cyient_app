import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';
import { CustomBreadcrumbs, type BreadcrumbItem, type Crumb } from '../custom-breadcrumbs';

export type { BreadcrumbItem, Crumb };

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbs?: readonly Crumb[];
  /** Whether to show a Home icon at the start of the breadcrumbs (defaults to true). */
  showHomeBreadcrumb?: boolean;
  /** A back button to this address. */
  backTo?: string;
  /** Next to the title, for example the status chip. */
  status?: ReactNode;
  /** Buttons on the right. */
  actions?: ReactNode;
}

/** The title row of every page, with breadcrumbs, status and the page's main actions. */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  showHomeBreadcrumb = true,
  backTo,
  status,
  actions,
}: PageHeaderProps) {
  return (
    <Stack spacing={1.5} sx={{ mb: 3 }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <CustomBreadcrumbs
          items={breadcrumbs}
          showHome={showHomeBreadcrumb}
          sx={{ mb: 0.5 }}
        />
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
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  overflowWrap: 'anywhere',
                  fontSize: { xs: '1.65rem', sm: '2.1rem' },
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>
              {status}
            </Stack>
            {subtitle && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  mt: 0.5,
                  lineHeight: 1.5,
                }}
              >
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
