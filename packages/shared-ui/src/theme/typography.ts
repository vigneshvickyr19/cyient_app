import type { TypographyVariantsOptions } from '@mui/material/styles';

export const serifFontFamily = [
  '"Newsreader"',
  '"Playfair Display"',
  '"Lora"',
  '"Merriweather"',
  'Georgia',
  'Cambria',
  '"Times New Roman"',
  'serif',
].join(',');

export const sansFontFamily = [
  '"Plus Jakarta Sans"',
  '"Inter"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',');

export const typography: TypographyVariantsOptions = {
  fontFamily: sansFontFamily,
  fontSize: 14,
  h1: {
    fontFamily: serifFontFamily,
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
  },
  h2: {
    fontFamily: serifFontFamily,
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: serifFontFamily,
    fontSize: '1.625rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.015em',
  },
  h4: {
    fontFamily: serifFontFamily,
    fontSize: '1.35rem',
    fontWeight: 600,
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.45,
  },
  subtitle1: { fontSize: '0.9375rem', fontWeight: 500, lineHeight: 1.5 },
  subtitle2: { fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.02em' },
  body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
  body2: { fontSize: '0.8125rem', lineHeight: 1.55 },
  caption: { fontSize: '0.75rem', lineHeight: 1.45 },
  overline: { fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' },
  button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
};
