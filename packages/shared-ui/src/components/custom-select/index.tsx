import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  FormControl,
  FormHelperText,
  InputAdornment,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
  type SelectProps,
} from '@mui/material';
import { useId, type ReactNode } from 'react';
import { sxList } from '../sxArray';
import { FieldLabel } from '../field-label';

export interface Option<V extends string | number = string | number> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps<V extends string | number>
  extends Omit<SelectProps, 'value' | 'onChange' | 'error'> {
  value: V | null;
  onChange: (value: V | null) => void;
  options: readonly Option<V>[];
  label?: ReactNode;
  topLabel?: boolean;
  error?: string;
  helperText?: ReactNode;
  placeholder?: string;
  emptyLabel?: string;
  startAdornment?: ReactNode;
  IconComponent?: React.ElementType;
}

/** A drop-down that keeps the types of its option values (numeric ids stay numbers), with a label, placeholder and error message. */
export function CustomSelect<V extends string | number>({
  id: explicitId,
  value,
  onChange,
  options,
  label,
  topLabel = true,
  error,
  helperText,
  placeholder,
  emptyLabel,
  startAdornment,
  IconComponent = KeyboardArrowDownIcon,
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'small',
  sx,
  ...props
}: CustomSelectProps<V>) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const labelId = `${id}-label`;

  const placeholderText =
    placeholder ??
    emptyLabel ??
    (typeof label === 'string'
      ? `Select ${label.replace(/\*$/, '').trim()}`
      : 'Select an option');

  const stringifiedValue = value === null ? '' : String(value);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const rawValue = event.target.value as string;
    if (rawValue === '') {
      onChange(null);
      return;
    }
    const chosen = options.find((opt) => String(opt.value) === rawValue);
    onChange(chosen ? chosen.value : null);
  };

  return (
    <FormControl fullWidth={fullWidth} error={Boolean(error)} disabled={disabled} sx={{ mb: 1 }}>
      {topLabel && label && (
        <FieldLabel id={labelId} htmlFor={id} error={Boolean(error)} required={required}>
{label}
</FieldLabel>
      )}
      <Select
        id={id}
        labelId={label ? labelId : undefined}
        IconComponent={IconComponent}
        {...props}
        value={stringifiedValue}
        onChange={handleChange}
        displayEmpty
        error={Boolean(error)}
        disabled={disabled}
        required={required}
        size={size}
        sx={[
          {
            borderRadius: 1,
            '& .MuiSelect-icon': {
              color: 'text.secondary',
              fontSize: 22,
              right: 10,
              transition: 'transform 0.2s ease-in-out',
            },
          },
          ...sxList(sx),
        ]}
        renderValue={(selected) => {
          if (!selected || selected === '') {
            return (
              <Typography
                component="span"
                sx={{
                  color: 'text.secondary',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  opacity: 0.75,
                }}
              >
                {placeholderText}
              </Typography>
            );
          }
          const selectedKey = typeof selected === 'string' || typeof selected === 'number' ? String(selected) : '';
          const chosen = options.find((opt) => String(opt.value) === selectedKey);
          return chosen ? chosen.label : selectedKey;
        }}
        startAdornment={
          startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : undefined
        }
      >
        {emptyLabel !== undefined && (
          <MenuItem value="">
            <em>{emptyLabel}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={String(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error ?? helperText) && (
        <FormHelperText
          error={Boolean(error)}
          sx={{
            mx: 0.5,
            mt: 0.5,
            fontSize: '0.75rem',
            fontWeight: error ? 500 : 400,
          }}
        >
          {error ?? helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}
