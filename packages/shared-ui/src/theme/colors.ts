/**
 * The colour tokens of the Cyient DLM apps. Components never use these directly: they use the theme palette
 * (palette.ts), which maps these tokens to roles for the light and dark schemes.
 */
export const colors = {
  brand: {
    50: '#e6f0f8',
    100: '#c0d8ee',
    200: '#94bde2',
    300: '#64a1d5',
    400: '#3f8bcc',
    500: '#1a76c2',
    600: '#156bb5',
    700: '#0e5ca3',
    800: '#084e92',
    900: '#003472',
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
    50: '#f7f9fb',
    100: '#eef2f6',
    200: '#e3e8ef',
    300: '#cdd5df',
    400: '#9aa4b2',
    500: '#697586',
    600: '#4b5565',
    700: '#364152',
    800: '#202939',
    900: '#121926',
    950: '#0b111b',
  },
  green: { 100: '#d3f3df', 500: '#2e9e5b', 700: '#1f7a43', 300: '#6fcf97' },
  amber: { 100: '#fdeccc', 500: '#d98a00', 700: '#a86700', 300: '#f5b94a' },
  red: { 100: '#fbd9d7', 500: '#d1352b', 700: '#a5231b', 300: '#ef7a72' },
  blue: { 100: '#d6e8fb', 500: '#2f80d6', 700: '#1d62ad', 300: '#7ab3ec' },
} as const;
