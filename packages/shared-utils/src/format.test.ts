import { describe, expect, it } from 'vitest';
import { formatCurrency, formatFileSize, formatNumber, humanize, initials, numberOrNull, textOrNull } from './format';

describe('formatting', () => {
  it('turns API enum values into words', () => {
    expect(humanize('DeptManagerReview')).toBe('Dept Manager Review');
    expect(humanize('MPPL_CLOSED')).toBe('Mppl Closed');
    expect(humanize('NotYetReleased')).toBe('Not Yet Released');
    expect(humanize(null)).toBe('');
  });

  it('formats sizes, numbers and money', () => {
    expect(formatFileSize(512)).toBe('512 bytes');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(25 * 1024 * 1024)).toBe('25 MB');
    expect(formatNumber(1234567.456)).toBe('12,34,567.46');
    expect(formatCurrency(1500, 'INR')).toBe('₹1,500.00');
    expect(formatCurrency(0.45, 'INR')).toBe('₹0.45');
    expect(formatCurrency(10, 'XXX1')).toBe('10 XXX1');
  });

  it('makes initials', () => {
    expect(initials('Riya Requester')).toBe('RR');
    expect(initials('Kavitha S Shivananjaiah')).toBe('KS');
    expect(initials('admin')).toBe('AD');
    expect(initials('')).toBe('?');
  });
});

describe('form values', () => {
  it('sends blank text as null and trims the rest', () => {
    expect(textOrNull('  Supplier email  ')).toBe('Supplier email');
    expect(textOrNull('   ')).toBeNull();
  });

  it('reads a typed number, and an empty field as null', () => {
    expect(numberOrNull(' 12.5 ')).toBe(12.5);
    expect(numberOrNull('')).toBeNull();
    expect(numberOrNull('  ')).toBeNull();
  });
});
