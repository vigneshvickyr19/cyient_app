import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';
import { breakpoints, spacingUnit } from './breakpoints';
import { components } from './components';
import { darkPalette, lightPalette } from './palette';
import { typography } from './typography';

export { colors } from './colors';
export { layout } from './breakpoints';

/**
 * The theme of every app: light and dark colour schemes (following the device unless the user picks one), with
 * CSS variables so switching scheme does not re-render the page. An app can pass options to extend it.
 */
export function createAppTheme(options: ThemeOptions = {}): Theme {
  return createTheme(
    {
      cssVariables: { colorSchemeSelector: 'class' },
      colorSchemes: { light: { palette: lightPalette }, dark: { palette: darkPalette } },
      typography,
      breakpoints,
      spacing: spacingUnit,
      shape: { borderRadius: 6 },
      components,
    },
    options,
  );
}
