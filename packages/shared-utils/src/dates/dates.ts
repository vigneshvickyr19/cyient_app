/**
 * Business dates are kept in India Standard Time, as the APIs keep them: the request date, "not in the past" checks
 * and the year in request numbers. The APIs send dates as yyyy-MM-dd and timestamps in UTC (ending in Z).
 */
export const BUSINESS_TIME_ZONE = 'Asia/Kolkata';

const LOCALE = 'en-IN';

const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Today's date in the business time zone, as yyyy-MM-dd. */
export function businessToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
}

/** Whether the value is a real yyyy-MM-dd date (not 2026-02-30). */
export function isIsoDate(value: string): boolean {
  const match = isoDate.exec(value);
  if (!match) return false;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/** A yyyy-MM-dd business date for people: 03 Nov 2026. Empty for no date. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const day = value.slice(0, 10);
  if (!isIsoDate(day)) return value;
  return new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${day}T00:00:00Z`),
  );
}

/** A UTC timestamp shown in the business time zone: 03 Nov 2026, 2:05 pm. Empty for none. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: BUSINESS_TIME_ZONE,
  }).format(date);
}

/** The calendar days from `earlier` to `later` (positive when `later` is after `earlier`). */
export function daysBetween(earlier: string, later: string): number {
  const msPerDay = 86_400_000;
  const [ey, em, ed] = earlier.split('-').map(Number);
  const [ly, lm, ld] = later.split('-').map(Number);
  if (!ey || !em || !ed || !ly || !lm || !ld) return 0;
  return Math.round((Date.UTC(ly, lm - 1, ld) - Date.UTC(ey, em - 1, ed)) / msPerDay);
}

/** Calendar days waiting since a UTC timestamp, in the business time zone. */
export function daysSince(timestamp: string, now: Date = new Date()): number {
  return daysBetween(timestamp.slice(0, 10), businessToday(now));
}
