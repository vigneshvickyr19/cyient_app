import type { BreakpointsOptions } from '@mui/material/styles';

/** Phone, tablet, laptop, desktop and wide screens. */
export const breakpoints: BreakpointsOptions = {
  values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
};

/** Layout sizes used by the app shell. */
export const layout = {
  navWidth: 248,
  navCollapsedWidth: 64,
  contentMaxWidth: 1440,
  appBarHeight: 56,
} as const;

/** The spacing unit in pixels: theme.spacing(1). */
export const spacingUnit = 8;
