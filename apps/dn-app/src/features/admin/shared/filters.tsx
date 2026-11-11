import { DateField } from '@cyient/shared-ui';
import { PeoplePicker } from '@cyient/shared-ui';

/** A whole number from a filter in the address, or nothing when it is empty or not a number. */
export function toInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
}

/** Leaves out empty filter values so the address and the query stay short. */
export function orUndefined(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined;
}

interface DateRangeFilterProps {
  from: string | undefined;
  to: string | undefined;
  onChange: (changes: { from?: string; to?: string }) => void;
}

/** From and to dates of a list filter; the "to" date can't be before the "from" date. */
export function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
  return (
    <>
      <DateField
        label="From"
        name="from"
        value={from ?? null}
        maxDate={to}
        onChange={(value) => {
          onChange({ from: value ?? undefined });
        }}
      />
      <DateField
        label="To"
        name="to"
        value={to ?? null}
        minDate={from}
        onChange={(value) => {
          onChange({ to: value ?? undefined });
        }}
      />
    </>
  );
}

interface UserFilterProps {
  userId: string | undefined;
  userName: string | undefined;
  onChange: (changes: { userId?: string; userName?: string }) => void;
}

/** Filters a list by the person who acted; their name is kept in the address next to the id so it shows on reload. */
export function UserFilter({ userId, userName, onChange }: UserFilterProps) {
  const id = toInt(userId);
  return (
    <PeoplePicker
      label="User"
      name="user"
      value={id === undefined ? null : { id, name: userName ?? `User ${id}` }}
      onChange={(person) => {
        onChange(person ? { userId: String(person.id), userName: person.name } : { userId: undefined, userName: undefined });
      }}
    />
  );
}
