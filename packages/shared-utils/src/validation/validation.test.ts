import { describe, expect, it } from 'vitest';
import { combine, fileProblem, maxLength, notBlank, notInPast, required, wholeNumber, type Validator } from './validation';

describe('validators', () => {
  it('builds the rules React Hook Form expects', () => {
    expect(required('Location')).toEqual({ required: 'Location is required.' });
    expect(maxLength(10, 'Clause')).toEqual({ maxLength: { value: 10, message: 'Clause can be at most 10 characters.' } });
  });

  it('leaves empty values to the required rule', () => {
    for (const validate of [notBlank('Name'), notInPast('Need-by date'), wholeNumber('Line')]) {
      expect(validate('')).toBe(true);
      expect(validate(null)).toBe(true);
    }
  });

  it('checks blank text and numbers', () => {
    expect(notBlank('Comment')('   ')).toBe(true);
    expect(wholeNumber('Line')('10.5')).toBe('Line must be a whole number.');
  });

  it('compares dates with the business today', () => {
    const today = () => '2026-11-03';
    expect(notInPast('Need-by date', today)('2026-11-03')).toBe(true);
    expect(notInPast('Need-by date', today)('2026-11-02')).toBe('Need-by date cannot be in the past.');
  });

  it('returns the first failing message', () => {
    const first: Validator = () => 'first';
    const second: Validator = () => 'second';
    expect(combine(first, second)('x')).toBe('first');
    expect(combine(() => true, second)('x')).toBe('second');
  });

  it('checks uploads against extensions and size', () => {
    const pdf = new File(['x'], 'Procedure.PDF');
    expect(fileProblem(pdf, { extensions: ['.pdf'], maxSizeMb: 1 })).toBeNull();
    expect(fileProblem(new File(['x'], 'macro.xlsm'), { extensions: ['.pdf', '.xlsx'] })).toBe('macro.xlsm: only .pdf, .xlsx files are accepted.');
    expect(fileProblem(new File([], 'empty.pdf'), {})).toBe('empty.pdf is empty.');
  });
});
