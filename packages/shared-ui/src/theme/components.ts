import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import type { Components, CssVarsTheme, Theme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';
import type {} from '@mui/x-date-pickers/themeAugmentation';

/** Component defaults and overrides, so pages need no styling of their own. */
export const components: Components<Omit<Theme, 'components' | 'palette'> & CssVarsTheme> = {
  MuiCssBaseline: {
    styleOverrides: `
      body {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
    `,
  },
  MuiButton: {
    defaultProps: { disableElevation: true },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        fontWeight: 600,
        textTransform: 'none',
        paddingInline: theme.spacing(2),
      }),
      containedPrimary: {
        boxShadow: '0 2px 6px rgba(0, 163, 173, 0.25)',
      },
    },
  },
  MuiIconButton: {
    defaultProps: { size: 'small' },
  },
  MuiRadio: {
    defaultProps: {
      color: 'primary',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
        '&.Mui-checked': {
          color: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 163, 173, 0.08)',
        },
      }),
    },
  },
  MuiCheckbox: {
    defaultProps: {
      color: 'primary',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        color: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
        '&.Mui-checked': {
          color: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 163, 173, 0.08)',
        },
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 10,
        // Text inputs, drop-downs and date fields stand at one height in a row of filters
        '&:not(.MuiInputBase-multiline)': { minHeight: 41 },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.vars ? theme.vars.palette.text.secondary : theme.palette.text.secondary,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
          borderWidth: 1.5,
        },
      }),
    },
  },
  MuiTextField: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiFormControl: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiSelect: {
    defaultProps: {
      size: 'small',
      IconComponent: KeyboardArrowDownIcon,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
          borderWidth: 1.5,
        },
      }),
      icon: ({ theme }) => ({
        color: theme.vars ? theme.vars.palette.text.secondary : theme.palette.text.secondary,
        transition: theme.transitions.create(['transform', 'color'], { duration: 200 }),
      }),
    },
  },
  MuiSwitch: {
    styleOverrides: {
      switchBase: ({ theme }) => ({
        '&.Mui-checked': {
          color: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
          '& + .MuiSwitch-track': {
            backgroundColor: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
          },
        },
      }),
    },
  },
  MuiAutocomplete: {
    defaultProps: { size: 'small', fullWidth: true },
  },
  MuiCard: {
    defaultProps: { variant: 'outlined' },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 16,
        backgroundColor: theme.vars.palette.background.paper,
        borderColor: theme.vars.palette.divider,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
      outlined: ({ theme }) => ({
        borderColor: theme.vars.palette.divider,
        borderRadius: 16,
      }),
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
    styleOverrides: {
      root: { fontWeight: 600, borderRadius: 20 },
      colorSuccess: {
        backgroundColor: '#eaf3ea',
        color: '#2e6930',
        border: '1px solid #cce5cc',
      },
      colorWarning: {
        backgroundColor: '#fdf0ec',
        color: '#b55335',
        border: '1px solid #f2cfc5',
      },
      colorError: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
      colorInfo: {
        backgroundColor: '#e6f7f8',
        color: '#007a82',
        border: '1px solid #b2ebef',
      },
      colorPrimary: {
        backgroundColor: '#e6f7f8',
        color: '#007a82',
        border: '1px solid #b2ebef',
      },
    },
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
    defaultProps: { disableRowSelectionOnClick: true },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.vars.palette.background.paper,
        border: `1px solid ${theme.vars.palette.divider}`,
        borderRadius: 10,
      }),
      columnHeaderTitle: { fontWeight: 600 },
    },
  },
  MuiDatePicker: {
    defaultProps: {
      format: 'DD MMM YYYY',
      slots: {
        openPickerIcon: CalendarTodayOutlinedIcon,
      },
      slotProps: {
        openPickerButton: {
          size: 'small',
        },
        openPickerIcon: {
          sx: { fontSize: 20 },
        },
      },
    },
  },
};
