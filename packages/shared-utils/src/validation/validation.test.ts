import { describe, expect, it } from 'vitest';
import { combine, fileProblem, isEmail, maxLength, notBefore, notBlank, notInPast, positiveNumber, required, wholeNumber } from './validation';

describe('validators', () => {
  it('builds the rules React Hook Form expects', () => {
    expect(required('Location')).toEqual({ required: 'Location is required.' });
    expect(maxLength(10, 'Clause')).toEqual({ maxLength: { value: 10, message: 'Clause can be at most 10 characters.' } });
  });

  it('leaves empty values to the required rule', () => {
    for (const validate of [isEmail, notBlank('Name'), notInPast('Need-by date'), positiveNumber('Price'), wholeNumber('Line')]) {
      expect(validate('')).toBe(true);
      expect(validate(null)).toBe(true);
    }
  });

  it('checks e-mail addresses, blank text and numbers', () => {
    expect(isEmail('kavitha@cyientdlm.com')).toBe(true);
    expect(isEmail('kavitha@')).toBe('Enter a valid email address.');
    expect(notBlank('Comment')('   ')).toBe(true);
    expect(positiveNumber('Price')('0')).toBe('Price must be more than zero.');
    expect(wholeNumber('Line')('10.5')).toBe('Line must be a whole number.');
  });

  it('compares dates with the business today and with another field', () => {
    const today = () => '2026-11-03';
    expect(notInPast('Need-by date', today)('2026-11-03')).toBe(true);
    expect(notInPast('Need-by date', today)('2026-11-02')).toBe('Need-by date cannot be in the past.');
    expect(notBefore(() => '2026-11-10', 'To must be after From.')('2026-11-09')).toBe('To must be after From.');
  });

  it('returns the first failing message', () => {
    const validate = combine<unknown>(positiveNumber('Quantity'), wholeNumber('Quantity'));
    expect(validate('2.5')).toBe('Quantity must be a whole number.');
    expect(validate('-1')).toBe('Quantity must be more than zero.');
  });

  it('checks uploads against extensions and size', () => {
    const pdf = new File(['x'], 'Procedure.PDF');
    expect(fileProblem(pdf, { extensions: ['.pdf'], maxSizeMb: 1 })).toBeNull();
    expect(fileProblem(new File(['x'], 'macro.xlsm'), { extensions: ['.pdf', '.xlsx'] })).toBe('macro.xlsm: only .pdf, .xlsx files are accepted.');
    expect(fileProblem(new File([], 'empty.pdf'), {})).toBe('empty.pdf is empty.');
  });
});
