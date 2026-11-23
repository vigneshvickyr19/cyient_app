import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  FormControl,
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import { useId, useState, type ReactNode } from 'react';
import { FieldLabel } from '../field-label';

export interface CustomInputProps extends Omit<TextFieldProps, 'value' | 'onChange' | 'error'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: ReactNode;
  topLabel?: boolean;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  clearable?: boolean;
}

/** A text field with its label above it, adornments, a password toggle and an error message. */
export function CustomInput({
  id: explicitId,
  value,
  onChange,
  error,
  helperText,
  label,
  topLabel = true,
  startAdornment,
  endAdornment,
  clearable = false,
  type = 'text',
  disabled = false,
  required = false,
  fullWidth = true,
  size = 'small',
  slotProps,
  placeholder,
  ...props
}: CustomInputProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const [showPassword, setShowPassword] = useState(false);

  const effectivePlaceholder =
    placeholder ??
    (typeof label === 'string'
      ? `Enter ${label.replace(/\*$/, '').trim().toLowerCase()}`
      : undefined);

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  const hasStartAdornment = Boolean(startAdornment);
  const showClearButton = clearable && Boolean(value) && !disabled;
  const showPasswordToggle = isPassword && !disabled;

  const computedEndAdornment = (
    <>
      {showClearButton && (
        <InputAdornment position="end">
          <IconButton
            size="small"
            aria-label="clear input"
            onClick={() => onChange('')}
            edge="end"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </InputAdornment>
      )}
      {showPasswordToggle && (
        <InputAdornment position="end">
          <IconButton
            size="small"
            aria-label={showPassword ? 'hide password' : 'show password'}
            onClick={() => setShowPassword((prev) => !prev)}
            edge="end"
          >
            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </InputAdornment>
      )}
      {endAdornment ? <InputAdornment position="end">{endAdornment}</InputAdornment> : null}
    </>
  );

  const rawInputSlotProps = (typeof slotProps?.input === 'object' && slotProps.input !== null ? slotProps.input : {}) as Record<string, unknown>;

  return (
    <FormControl fullWidth={fullWidth} error={Boolean(error)} disabled={disabled} sx={{ mb: 1 }}>
      {topLabel && label && (
        <FieldLabel htmlFor={id} error={Boolean(error)} required={required}>
{label}
</FieldLabel>
      )}
      <TextField
        id={id}
        {...props}
        placeholder={effectivePlaceholder}
        type={effectiveType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        error={Boolean(error)}
        helperText={error ?? helperText}
        disabled={disabled}
        required={required}
        fullWidth={fullWidth}
        size={size}
        label={!topLabel ? label : undefined}
        slotProps={{
          ...slotProps,
          input: {
            ...rawInputSlotProps,
            startAdornment: hasStartAdornment ? (
              <InputAdornment position="start">{startAdornment}</InputAdornment>
            ) : (
              (rawInputSlotProps.startAdornment as ReactNode)
            ),
            endAdornment: (showClearButton || showPasswordToggle || endAdornment)
              ? computedEndAdornment
              : (rawInputSlotProps.endAdornment as ReactNode),
          },
        }}
      />
    </FormControl>
  );
}

export interface CustomTextAreaProps extends Omit<CustomInputProps, 'multiline'> {
  minRows?: number;
  maxRows?: number;
}

/**
 * A multi-line custom text area that automatically expands with content.
 */
export function CustomTextArea({ minRows = 3, maxRows = 12, ...props }: CustomTextAreaProps) {
  return <CustomInput {...props} multiline minRows={minRows} maxRows={maxRows} />;
}
