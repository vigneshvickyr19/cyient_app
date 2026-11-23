import { businessToday } from '../dates';

/**
 * Validators for React Hook Form's `validate` option (or anything else): each returns true when the value is
 * acceptable, otherwise the message to show. They accept empty values, so a field is required only when it also has
 * the `required` rule.
 */
export type Validator<T = unknown> = (value: T) => true | string;

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0);

/** The message React Hook Form shows for `required`: "Location is required." */
export function requiredMessage(label: string): string {
  return `${label} is required.`;
}

/** Rules object for a required field, ready to pass to a form component. */
export function required(label: string): { required: string } {
  return { required: requiredMessage(label) };
}

export function maxLength(max: number, label: string): { maxLength: { value: number; message: string } } {
  return { maxLength: { value: max, message: `${label} can be at most ${max} characters.` } };
}

/** Text with something other than spaces in it. */
export const notBlank =
  (label: string): Validator =>
  (value) =>
    isEmpty(value) || (typeof value === 'string' && value.trim().length > 0) || requiredMessage(label);

/** A yyyy-MM-dd date that is today or later, in the business time zone. */
export const notInPast =
  (label: string, today: () => string = businessToday): Validator =>
  (value) =>
    isEmpty(value) || (typeof value === 'string' && value >= today()) || `${label} cannot be in the past.`;

/** A yyyy-MM-dd date on or before today, in the business time zone. */
export const notInFuture =
  (label: string, today: () => string = businessToday): Validator =>
  (value) =>
    isEmpty(value) || (typeof value === 'string' && value <= today()) || `${label} cannot be in the future.`;

export const wholeNumber =
  (label: string): Validator =>
  (value) =>
    isEmpty(value) || (Number.isInteger(Number(value)) && Number(value) >= 0) || `${label} must be a whole number.`;

/** Runs validators in turn and returns the first message. */
export function combine<T>(...validators: Validator<T>[]): Validator<T> {
  return (value) => {
    for (const validate of validators) {
      const result = validate(value);
      if (result !== true) return result;
    }
    return true;
  };
}

/** Accepted upload checks: allowed extensions (lower case, with the dot) and the size limit in MB. */
export function fileProblem(file: File, options: { extensions?: readonly string[]; maxSizeMb?: number }): string | null {
  const extension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
  if (options.extensions?.length && !options.extensions.includes(extension)) {
    return `${file.name}: only ${options.extensions.join(', ')} files are accepted.`;
  }
  if (options.maxSizeMb && file.size > options.maxSizeMb * 1024 * 1024) {
    return `${file.name} is larger than ${options.maxSizeMb} MB.`;
  }
  if (file.size === 0) {
    return `${file.name} is empty.`;
  }
  return null;
}
