import type { PaletteOptions } from '@mui/material/styles';
import { colors } from './colors';

/** Colour roles in the light scheme. */
export const lightPalette: PaletteOptions = {
  primary: { main: colors.brand[700], light: colors.brand[400], dark: colors.brand[900], contrastText: colors.grey[0] },
  secondary: { main: colors.teal[700], light: colors.teal[300], dark: colors.teal[900], contrastText: colors.grey[0] },
  success: { main: colors.green[700], light: colors.green[100], contrastText: colors.grey[0] },
  warning: { main: colors.amber[700], light: colors.amber[100], contrastText: colors.grey[0] },
  error: { main: colors.red[700], light: colors.red[100], contrastText: colors.grey[0] },
  info: { main: colors.blue[700], light: colors.blue[100], contrastText: colors.grey[0] },
  grey: colors.grey,
  text: { primary: colors.grey[900], secondary: colors.grey[600], disabled: colors.grey[400] },
  background: { default: colors.grey[50], paper: colors.grey[0] },
  divider: colors.grey[200],
};

/** Colour roles in the dark scheme. */
export const darkPalette: PaletteOptions = {
  primary: { main: colors.brand[300], light: colors.brand[200], dark: colors.brand[500], contrastText: colors.grey[950] },
  secondary: { main: colors.teal[300], light: colors.teal[100], dark: colors.teal[500], contrastText: colors.grey[950] },
  success: { main: colors.green[300], light: colors.green[700], contrastText: colors.grey[950] },
  warning: { main: colors.amber[300], light: colors.amber[700], contrastText: colors.grey[950] },
  error: { main: colors.red[300], light: colors.red[700], contrastText: colors.grey[950] },
  info: { main: colors.blue[300], light: colors.blue[700], contrastText: colors.grey[950] },
  grey: colors.grey,
  text: { primary: colors.grey[50], secondary: colors.grey[400], disabled: colors.grey[600] },
  background: { default: colors.grey[950], paper: colors.grey[900] },
  divider: colors.grey[800],
};
