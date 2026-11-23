import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
  type RadioGroupProps,
  type RadioProps,
} from '@mui/material';
import { useId, type ReactNode } from 'react';
import type { Option } from '../custom-select';

export interface CustomRadioProps extends RadioProps {
  label?: ReactNode;
}

/**
 * A standalone custom radio element with integrated label styling.
 */
export function CustomRadio({ label, ...props }: CustomRadioProps) {
  if (!label) return <Radio {...props} />;
  return <FormControlLabel control={<Radio {...props} />} label={label} />;
}

export interface CustomRadioGroupProps<V extends string>
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'defaultValue'> {
  label?: ReactNode;
  value: V | null;
  onChange: (value: V) => void;
  options: readonly Option<V>[];
  row?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  topLabel?: boolean;
}

/** A group of radio buttons with a label, a horizontal or vertical layout and an error message. */
export function CustomRadioGroup<V extends string>({
  id: explicitId,
  label,
  value,
  onChange,
  options,
  row = true,
  disabled = false,
  required = false,
  error,
  helperText,
  topLabel = true,
  name,
  ...props
}: CustomRadioGroupProps<V>) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;

  return (
    <FormControl
      error={Boolean(error)}
      disabled={disabled}
      required={required}
      component="fieldset"
      sx={{ mb: 1, display: 'block' }}
    >
      {topLabel && label && (
        <Box sx={{ mb: 0.5 }}>
          <Typography
            component="legend"
            id={`${id}-label`}
            variant="body2"
            sx={{ fontWeight: 600, color: error ? 'error.main' : 'text.primary' }}
          >
            {label}
            {required && (
              <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
                *
              </Box>
            )}
          </Typography>
        </Box>
      )}
      <RadioGroup
        id={id}
        aria-labelledby={label ? `${id}-label` : undefined}
        row={row}
        name={name}
        value={value ?? ''}
        onChange={(event) => {
          const chosen = options.find((opt) => opt.value === event.target.value);
          if (chosen) onChange(chosen.value);
        }}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio size="small" />}
            label={option.label}
            disabled={option.disabled ?? disabled}
          />
        ))}
      </RadioGroup>
      {(error ?? helperText) && (
        <FormHelperText sx={{ mx: 0.5 }}>{error ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
