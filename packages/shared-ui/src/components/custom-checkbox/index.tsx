import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Typography,
  type CheckboxProps,
} from '@mui/material';
import { useId, type ReactNode } from 'react';

export interface CustomCheckboxProps extends Omit<CheckboxProps, 'onChange'> {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  helperText?: ReactNode;
  name?: string;
}

/** A checkbox with its label, helper text and error message. */
export function CustomCheckbox({
  id: explicitId,
  label,
  checked,
  onChange,
  disabled = false,
  error,
  helperText,
  name,
  ...props
}: CustomCheckboxProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;

  return (
    <FormControl error={Boolean(error)} disabled={disabled} sx={{ mb: 0.5, display: 'block' }}>
      <FormControlLabel
        id={id}
        control={
          <Checkbox
            {...props}
            name={name}
            checked={checked}
            onChange={(event) => onChange(event.target.checked)}
            size="small"
          />
        }
        label={
          typeof label === 'string' ? (
            <Typography variant="body2" sx={{ color: error ? 'error.main' : 'text.primary' }}>
              {label}
            </Typography>
          ) : (
            label
          )
        }
      />
      {(error ?? helperText) && (
        <FormHelperText sx={{ mx: 0.5 }}>{error ?? helperText}</FormHelperText>
      )}
    </FormControl>
  );
}
