import type { Components, CssVarsTheme, Theme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';

/** Component defaults and overrides, so pages need no styling of their own. */
export const components: Components<Omit<Theme, 'components' | 'palette'> & CssVarsTheme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: { WebkitFontSmoothing: 'antialiased' },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: ({ theme }) => ({ borderRadius: theme.shape.borderRadius, paddingInline: theme.spacing(2) }),
    },
  },
  MuiIconButton: {
    defaultProps: { size: 'small' },
  },
  MuiTextField: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiFormControl: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiAutocomplete: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiCard: {
    defaultProps: { variant: 'outlined' },
  },
  MuiPaper: {
    styleOverrides: {
      outlined: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
    },
  },
  MuiAppBar: {
    defaultProps: { elevation: 0, color: 'inherit' },
    styleOverrides: {
      root: ({ theme }) => ({ borderBottom: `1px solid ${theme.vars.palette.divider}` }),
    },
  },
  MuiChip: {
    defaultProps: { size: 'small' },
    styleOverrides: { root: { fontWeight: 600 } },
  },
  MuiTooltip: {
    defaultProps: { arrow: true },
  },
  MuiTableCell: {
    styleOverrides: {
      head: ({ theme }) => ({ fontWeight: 600, color: theme.vars.palette.text.secondary, whiteSpace: 'nowrap' }),
    },
  },
  MuiDialog: {
    defaultProps: { fullWidth: true, maxWidth: 'sm' },
  },
  MuiAlert: {
    defaultProps: { variant: 'outlined' },
  },
  MuiDataGrid: {
    defaultProps: { density: 'compact', disableRowSelectionOnClick: true },
    styleOverrides: {
      root: ({ theme }) => ({ backgroundColor: theme.vars.palette.background.paper, border: `1px solid ${theme.vars.palette.divider}` }),
      columnHeaderTitle: { fontWeight: 600 },
    },
  },
  MuiDatePicker: {
    defaultProps: { format: 'DD MMM YYYY' },
  },
};
