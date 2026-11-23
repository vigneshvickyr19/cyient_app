/**
 * The colour tokens of the Cyient DLM apps. Components never use these directly: they use the theme palette
 * (palette.ts), which maps these tokens to roles for the light and dark schemes.
 */
export const colors = {
  brand: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#00a3ad',
    600: '#008e97',
    700: '#007a82',
    800: '#006272',
    900: '#004f55',
  },
  teal: {
    100: '#b2ebef',
    300: '#4dd0db',
    500: '#00a3ad',
    700: '#00808a',
    900: '#004f55',
  },
  grey: {
    0: '#ffffff',
    50: '#f4f7fb',
    100: '#eef2f7',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#090d16',
  },
  green: { 100: '#e8f7ee', 300: '#86efac', 500: '#22c55e', 700: '#16a34a' },
  amber: { 100: '#fef3eb', 300: '#fcd34d', 500: '#f59e0b', 700: '#d97706' },
  red: { 100: '#fde8e8', 300: '#fca5a5', 500: '#ef4444', 700: '#dc2626' },
  blue: { 100: '#edf5ff', 300: '#93c5fd', 500: '#3b82f6', 700: '#0062ff' },
} as const;
