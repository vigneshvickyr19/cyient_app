import type { TypographyVariantsOptions } from '@mui/material/styles';

const fontFamily = ['"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(',');

export const typography: TypographyVariantsOptions = {
  fontFamily,
  fontSize: 14,
  h1: { fontSize: '2rem', fontWeight: 600, lineHeight: 1.25 },
  h2: { fontSize: '1.625rem', fontWeight: 600, lineHeight: 1.3 },
  h3: { fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.35 },
  h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
  h5: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
  h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
  subtitle1: { fontSize: '0.9375rem', fontWeight: 600 },
  subtitle2: { fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.02em' },
  body1: { fontSize: '0.9375rem', lineHeight: 1.55 },
  body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
  caption: { fontSize: '0.75rem', lineHeight: 1.45 },
  overline: { fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em' },
  button: { fontWeight: 600, textTransform: 'none' },
};
