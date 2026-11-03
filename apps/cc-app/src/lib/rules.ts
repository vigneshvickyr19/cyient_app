import { businessToday, type Validator } from '@cyient/shared-utils';

/*
 * Date rules worded as the Customer Complaint API words them ("can't be in the future"), so a message reads the same
 * whether the form or the API catches it. Empty values pass; a field is required only with the `required` rule too.
 */

/** A yyyy-MM-dd date on or before today (India time). */
export const notAfterToday =
  (message: string): Validator =>
  (value) =>
    value === null || value === undefined || value === '' || (typeof value === 'string' && value <= businessToday()) || message;

/** A yyyy-MM-dd date of today or later (India time). */
export const notBeforeToday =
  (message: string): Validator =>
  (value) =>
    value === null || value === undefined || value === '' || (typeof value === 'string' && value >= businessToday()) || message;

/** A whole number of zero or more, as the API's quantity fields take. */
export const zeroOrMore =
  (label: string): Validator =>
  (value) =>
    value === null || value === undefined || value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0) || `${label} must be a whole number of zero or more.`;
