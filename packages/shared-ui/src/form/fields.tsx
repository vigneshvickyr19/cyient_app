import type { ReactNode } from 'react';
import { Controller, useFormContext, type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form';
import { DateField } from '../components/DateField';
import { FileUpload } from '../components/FileUpload';
import { CheckboxField, Dropdown, Input, RadioGroupField, TextArea, type Option } from '../components/inputs';
import { PeopleListPicker } from '../components/PeopleListPicker';
import { PeoplePicker, type PersonOption } from '../components/PeoplePicker';

/** Validation rules for a field: required, maxLength, validate... (never Zod). */
export type FieldRules<T extends FieldValues, N extends FieldPath<T>> = Omit<
  RegisterOptions<T, N>,
  'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled' | 'value' | 'onChange' | 'onBlur'
>;

interface FieldProps<T extends FieldValues, N extends FieldPath<T>> {
  name: N;
  label: ReactNode;
  rules?: FieldRules<T, N>;
  disabled?: boolean;
  helperText?: ReactNode;
  /** An error from outside the form's rules (for example a failed lookup), shown while the field has none of its own. */
  error?: string;
}

const isRequired = (rules: { required?: unknown } | undefined) => Boolean(rules?.required);

/*
 * Each field reads the form from FormProvider (useFormContext) and is controlled through Controller, so it shows the
 * field's error, marks required fields and follows the form's disabled state. Give the form's values type for a
 * checked field name: <FormInput<DraftForm> name="documentReference" ... />.
 */

export function FormInput<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  type,
  placeholder,
  autoFocus,
  min,
  step,
}: FieldProps<T, N> & {
  type?: 'text' | 'email' | 'number' | 'tel';
  placeholder?: string;
  autoFocus?: boolean;
  /** The lowest number the browser's spinner offers, for type="number". */
  min?: number;
  /** The spinner's step, for type="number". */
  step?: number;
}) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Input
          name={field.name}
          label={label}
          type={type}
          placeholder={placeholder}
          autoFocus={autoFocus}
          value={field.value === null || field.value === undefined ? '' : String(field.value)}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
          slotProps={min === undefined && step === undefined ? undefined : { htmlInput: { min, step } }}
        />
      )}
    />
  );
}

export function FormTextArea<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  minRows,
}: FieldProps<T, N> & { minRows?: number }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <TextArea
          name={field.name}
          label={label}
          minRows={minRows}
          value={typeof field.value === 'string' ? field.value : ''}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

export function FormDropdown<T extends FieldValues, V extends string | number, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  options,
  emptyLabel,
}: FieldProps<T, N> & { options: readonly Option<V>[]; emptyLabel?: string }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Dropdown<V>
          name={field.name}
          label={label}
          options={options}
          emptyLabel={emptyLabel}
          value={field.value ?? null}
          onChange={field.onChange}
          onBlur={field.onBlur}
          inputRef={field.ref}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

export function FormCheckbox<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({ name, label, rules, disabled, helperText, error }: FieldProps<T, N>) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <CheckboxField
          name={field.name}
          label={label}
          checked={field.value === true}
          onChange={field.onChange}
          disabled={field.disabled}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

export function FormRadioGroup<T extends FieldValues, V extends string, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  options,
  row,
}: FieldProps<T, N> & { options: readonly Option<V>[]; row?: boolean }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <RadioGroupField<V>
          name={field.name}
          label={label}
          options={options}
          row={row}
          value={field.value ?? null}
          onChange={field.onChange}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

export function FormDatePicker<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  minDate,
  maxDate,
}: FieldProps<T, N> & { minDate?: string; maxDate?: string }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <DateField
          name={field.name}
          label={label}
          value={typeof field.value === 'string' ? field.value : null}
          onChange={field.onChange}
          minDate={minDate}
          maxDate={maxDate}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

export function FormFileUpload<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  multiple,
  extensions,
  maxSizeMb,
}: FieldProps<T, N> & { multiple?: boolean; extensions?: readonly string[]; maxSizeMb?: number }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <FileUpload
          label={label}
          value={Array.isArray(field.value) ? (field.value as File[]) : []}
          onChange={field.onChange}
          multiple={multiple}
          extensions={extensions}
          maxSizeMb={maxSizeMb}
          disabled={field.disabled}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

export function FormPeoplePicker<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  excludeIds,
}: FieldProps<T, N> & { excludeIds?: readonly number[] }) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <PeoplePicker
          name={field.name}
          label={label}
          value={field.value ?? null}
          onChange={field.onChange}
          excludeIds={excludeIds}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}

/**
 * Several people (a PersonOption[] field), added with the people picker and removed with their chips. With `max`, no
 * more can be added once the list is full, and a longer list (one saved before, say) fails validation with `maxMessage`.
 */
export function FormPeopleList<T extends FieldValues, N extends FieldPath<T> = FieldPath<T>>({
  name,
  label,
  rules,
  disabled,
  helperText,
  error,
  listLabel,
  excludeIds,
  max,
  maxMessage,
  emptyText,
}: FieldProps<T, N> & { listLabel: string; excludeIds?: readonly number[]; max?: number; maxMessage?: string; emptyText?: ReactNode }) {
  const { control } = useFormContext<T>();
  const validate = rules?.validate;
  const withMax: FieldRules<T, N> | undefined =
    max === undefined
      ? rules
      : {
          ...rules,
          validate: {
            ...(typeof validate === 'function' ? { rule: validate } : validate),
            max: (people: unknown) => !Array.isArray(people) || people.length <= max || (maxMessage ?? `At most ${String(max)} people can be chosen.`),
          },
        };
  return (
    <Controller
      control={control}
      name={name}
      rules={withMax}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <PeopleListPicker
          name={field.name}
          label={label}
          listLabel={listLabel}
          value={Array.isArray(field.value) ? (field.value as PersonOption[]) : []}
          onChange={field.onChange}
          excludeIds={excludeIds}
          max={max}
          emptyText={emptyText}
          disabled={field.disabled}
          required={isRequired(rules)}
          error={fieldState.error?.message ?? error}
          helperText={helperText}
        />
      )}
    />
  );
}
