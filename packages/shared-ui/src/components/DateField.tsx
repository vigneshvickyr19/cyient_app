import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

const API_FORMAT = 'YYYY-MM-DD';

export interface DateFieldProps {
  label: ReactNode;
  /** yyyy-MM-dd, as the API sends and expects dates. */
  value: string | null;
  onChange: (value: string | null) => void;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  name?: string;
}

const toDayjs = (value: string | null | undefined): Dayjs | null => (value ? dayjs(value, API_FORMAT) : null);

/** A date picker that reads and writes yyyy-MM-dd strings, shown as 03 Nov 2026. */
export function DateField({ label, value, onChange, minDate, maxDate, disabled, required, error, helperText, name }: DateFieldProps) {
  return (
    <DatePicker
      label={label}
      value={toDayjs(value)}
      onChange={(date) => {
        onChange(date?.isValid() ? date.format(API_FORMAT) : null);
      }}
      minDate={toDayjs(minDate) ?? undefined}
      maxDate={toDayjs(maxDate) ?? undefined}
      disabled={disabled}
      slotProps={{
        textField: { name, required, error: Boolean(error), helperText: error ?? helperText, fullWidth: true, size: 'small' },
        field: { clearable: !required },
      }}
    />
  );
}
