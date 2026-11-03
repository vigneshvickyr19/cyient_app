import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import type { ReactNode } from 'react';

type BaseTextProps = Omit<TextFieldProps, 'value' | 'onChange' | 'error' | 'select' | 'children'>;

export interface InputProps extends BaseTextProps {
  value: string;
  onChange: (value: string) => void;
  /** An error message shows the field in error. */
  error?: string;
}

/** A single-line text field. */
export function Input({ value, onChange, error, helperText, ...props }: InputProps) {
  return (
    <TextField
      {...props}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
      error={Boolean(error)}
      helperText={error ?? helperText}
    />
  );
}

/** A multi-line text field that grows with its text. */
export function TextArea({ minRows = 3, maxRows = 12, ...props }: InputProps) {
  return <Input {...props} multiline minRows={minRows} maxRows={maxRows} />;
}

export interface Option<V extends string | number = string | number> {
  value: V;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps<V extends string | number> extends Omit<BaseTextProps, 'onChange'> {
  value: V | null;
  onChange: (value: V | null) => void;
  options: readonly Option<V>[];
  error?: string;
  /** The choice for "nothing selected"; leave out to make a choice compulsory once made. */
  emptyLabel?: string;
}

/** A drop-down list. Values keep their type (number ids stay numbers). */
export function Dropdown<V extends string | number>({ value, onChange, options, error, helperText, emptyLabel, ...props }: DropdownProps<V>) {
  const key = (v: V | null) => (v === null ? '' : String(v));
  return (
    <TextField
      {...props}
      select
      value={key(value)}
      onChange={(event) => {
        const chosen = options.find((option) => String(option.value) === event.target.value);
        onChange(chosen ? chosen.value : null);
      }}
      error={Boolean(error)}
      helperText={error ?? helperText}
    >
      {emptyLabel !== undefined && (
        <MenuItem value="">
          <em>{emptyLabel}</em>
        </MenuItem>
      )}
      {options.map((option) => (
        <MenuItem key={String(option.value)} value={String(option.value)} disabled={option.disabled}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export interface CheckboxFieldProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  helperText?: ReactNode;
  name?: string;
}

/** A labelled check box. */
export function CheckboxField({ label, checked, onChange, disabled, error, helperText, name }: CheckboxFieldProps) {
  return (
    <FormControl error={Boolean(error)} disabled={disabled}>
      <FormControlLabel
        control={
          <Checkbox
            name={name}
            checked={checked}
            onChange={(event) => {
              onChange(event.target.checked);
            }}
          />
        }
        label={label}
      />
      {(error ?? helperText) && <FormHelperText>{error ?? helperText}</FormHelperText>}
    </FormControl>
  );
}

export interface RadioGroupFieldProps<V extends string> {
  label: ReactNode;
  value: V | null;
  onChange: (value: V) => void;
  options: readonly Option<V>[];
  row?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  name?: string;
}

/** A set of radio buttons for one choice. */
export function RadioGroupField<V extends string>({ label, value, onChange, options, row = true, disabled, required, error, helperText, name }: RadioGroupFieldProps<V>) {
  return (
    <FormControl error={Boolean(error)} disabled={disabled} required={required} component="fieldset">
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        row={row}
        name={name}
        value={value ?? ''}
        onChange={(event) => {
          const chosen = options.find((option) => option.value === event.target.value);
          if (chosen) onChange(chosen.value);
        }}
      >
        {options.map((option) => (
          <FormControlLabel key={option.value} value={option.value} control={<Radio />} label={option.label} disabled={option.disabled} />
        ))}
      </RadioGroup>
      {(error ?? helperText) && <FormHelperText>{error ?? helperText}</FormHelperText>}
    </FormControl>
  );
}
