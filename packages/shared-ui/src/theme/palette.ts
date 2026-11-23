import type { PaletteOptions } from '@mui/material/styles';
import { colors } from './colors';

/** Colour roles of the light scheme. */
export const lightPalette: PaletteOptions = {
  primary: {
    main: colors.brand[500],
    light: colors.brand[100],
    dark: colors.brand[700],
    contrastText: colors.grey[0],
  },
  secondary: {
    main: '#0284c7',
    light: '#e0f2fe',
    dark: '#0369a1',
    contrastText: colors.grey[0],
  },
  success: {
    main: colors.green[700],
    light: colors.green[100],
    dark: '#15803d',
    contrastText: colors.grey[0],
  },
  warning: {
    main: colors.amber[700],
    light: colors.amber[100],
    dark: '#b45309',
    contrastText: colors.grey[0],
  },
  error: {
    main: colors.red[700],
    light: colors.red[100],
    dark: '#b91c1c',
    contrastText: colors.grey[0],
  },
  info: {
    main: '#0284c7',
    light: '#f0f9ff',
    dark: '#0369a1',
    contrastText: colors.grey[0],
  },
  grey: colors.grey,
  text: {
    primary: colors.grey[900],
    secondary: colors.grey[500],
    disabled: colors.grey[400],
  },
  background: {
    default: '#faf9f6',
    paper: colors.grey[0],
  },
  divider: colors.grey[200],
  action: {
    active: colors.grey[500],
    hover: 'rgba(0, 163, 173, 0.05)',
    selected: 'rgba(0, 163, 173, 0.1)',
    disabled: 'rgba(15, 23, 42, 0.26)',
    disabledBackground: 'rgba(15, 23, 42, 0.12)',
  },
};

/** Colour roles in the dark scheme. */
export const darkPalette: PaletteOptions = {
  primary: {
    main: colors.brand[500],
    light: colors.brand[300],
    dark: colors.brand[700],
    contrastText: '#ffffff',
  },
  secondary: {
    main: colors.teal[300],
    light: colors.teal[100],
    dark: colors.teal[500],
    contrastText: colors.grey[950],
  },
  success: {
    main: '#4ade80',
    light: '#14532d',
    dark: '#16a34a',
    contrastText: '#0f172a',
  },
  warning: {
    main: '#fbbf24',
    light: '#78350f',
    dark: '#d97706',
    contrastText: '#0f172a',
  },
  error: {
    main: '#f87171',
    light: '#7f1d1d',
    dark: '#dc2626',
    contrastText: '#ffffff',
  },
  info: {
    main: '#38bdf8',
    light: '#0c4a6e',
    dark: '#0284c7',
    contrastText: '#ffffff',
  },
  grey: colors.grey,
  text: {
    primary: '#f8fafc',
    secondary: '#94a3b8',
    disabled: '#64748b',
  },
  background: {
    default: colors.grey[950],
    paper: colors.grey[900],
  },
  divider: colors.grey[800],
  action: {
    active: '#94a3b8',
    hover: 'rgba(0, 163, 173, 0.1)',
    selected: 'rgba(0, 163, 173, 0.18)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
  },
};
