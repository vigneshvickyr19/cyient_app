import { isApiError } from '@cyient/api-client';
import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { FormProvider, type FieldPath, type FieldValues, type SubmitHandler, type UseFormReturn } from 'react-hook-form';

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
  /** Lets a button outside the form submit it (form="..."). */
  id?: string;
  sx?: SxProps<Theme>;
}

/** A form whose fields (FormInput, FormDropdown...) find it through FormProvider. */
export function Form<T extends FieldValues>({ form, onSubmit, children, id, sx }: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <Box component="form" id={id} noValidate onSubmit={form.handleSubmit(onSubmit)} sx={sx}>
        {children}
      </Box>
    </FormProvider>
  );
}

/**
 * Shows the API's field errors on the form's fields. API field names (documentReference, DeptManagerUserId...) are
 * matched to form fields ignoring case; `names` maps those that differ (deptManagerUserId → deptManager). Returns
 * whether any error was placed on a field, so the caller can show the rest as a notification.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  form: Pick<UseFormReturn<T>, 'setError' | 'getValues'>,
  names: Partial<Record<string, FieldPath<T>>> = {},
): boolean {
  if (!isApiError(error)) return false;
  const fields = Object.keys(form.getValues());
  let placed = false;
  for (const [apiField, message] of Object.entries(error.fieldErrors())) {
    const mapped = Object.entries(names).find(([key]) => key.toLowerCase() === apiField.toLowerCase())?.[1];
    const match = mapped ?? (fields.find((field) => field.toLowerCase() === apiField.toLowerCase()) as FieldPath<T> | undefined);
    if (match) {
      form.setError(match, { type: 'server', message }, { shouldFocus: !placed });
      placed = true;
    }
  }
  return placed;
}
