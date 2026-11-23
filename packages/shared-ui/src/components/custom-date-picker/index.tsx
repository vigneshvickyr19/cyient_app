import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import {
  FormControl,
  FormHelperText,
} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { type Dayjs } from 'dayjs';
import { useId, type ReactNode } from 'react';
import { FieldLabel } from '../field-label';

const API_FORMAT = 'YYYY-MM-DD';

export interface CustomDatePickerProps {
  label?: ReactNode;
  /** yyyy-MM-dd date string, as standard APIs and state expect. */
  value: string | null;
  onChange: (value: string | null) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  topLabel?: boolean;
  name?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  openPickerIcon?: React.ElementType;
}

const toDayjs = (value: string | null | undefined): Dayjs | null =>
  value ? dayjs(value, API_FORMAT) : null;

/** A date field that takes and gives yyyy-MM-dd strings, with its label above the input. */
export function CustomDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error,
  helperText,
  topLabel = true,
  name,
  fullWidth = true,
  size = 'small',
  openPickerIcon: OpenPickerIconProp = CalendarTodayOutlinedIcon,
}: CustomDatePickerProps) {
  const id = useId();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <FormControl fullWidth={fullWidth} error={Boolean(error)} disabled={disabled} sx={{ mb: 1 }}>
        {topLabel && label && (
          <FieldLabel htmlFor={id} error={Boolean(error)} required={required}>
{label}
</FieldLabel>
        )}
        <DatePicker
          value={toDayjs(value)}
          onChange={(date) => {
            onChange(date?.isValid() ? date.format(API_FORMAT) : null);
          }}
          minDate={toDayjs(minDate) ?? undefined}
          maxDate={toDayjs(maxDate) ?? undefined}
          disabled={disabled}
          label={!topLabel ? label : undefined}
          slots={{
            openPickerIcon: OpenPickerIconProp,
          }}
          slotProps={{
            openPickerButton: {
              size: 'small',
              sx: {
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              },
            },
            openPickerIcon: {
              sx: {
                fontSize: 20,
              },
            },
            textField: {
              id,
              name,
              required,
              error: Boolean(error),
              fullWidth,
              size,
              sx: {
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              },
            },
            field: {
              clearable: !required,
            },
          }}
        />
        {(error ?? helperText) && (
          <FormHelperText sx={{ mx: 0.5 }}>{error ?? helperText}</FormHelperText>
        )}
      </FormControl>
    </LocalizationProvider>
  );
}
