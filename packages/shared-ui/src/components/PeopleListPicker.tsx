import CancelIcon from '@mui/icons-material/Cancel';
import { Box, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { PeoplePicker, type PersonOption } from './PeoplePicker';

export interface PeopleListPickerProps {
  /** The label of the picker that adds a person, for example "Add a team member". */
  label: ReactNode;
  /** The accessible name of the list of chosen people, for example "Team members". */
  listLabel: string;
  value: readonly PersonOption[];
  onChange: (people: PersonOption[]) => void;
  /** People who may not be added, for example the initiator. */
  excludeIds?: readonly number[];
  /** The most people the list may hold; once reached, nobody more can be added. */
  max?: number;
  /** Shown instead of the list while nobody is chosen. */
  emptyText?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  name?: string;
}

/** Several people: each is found with the people picker and added, and shown as a chip that removes them. */
export function PeopleListPicker({
  label,
  listLabel,
  value,
  onChange,
  excludeIds = [],
  max,
  emptyText,
  disabled,
  required,
  error,
  helperText,
  name,
}: PeopleListPickerProps) {
  const full = max !== undefined && value.length >= max;

  return (
    <Stack spacing={1.5}>
      <PeoplePicker
        // A new picker after each person is added, so it is empty for the next one
        key={value.length}
        name={name}
        label={label}
        value={null}
        onChange={(person) => {
          if (person && !full) onChange([...value, person]);
        }}
        excludeIds={[...excludeIds, ...value.map((person) => person.id)]}
        disabled={disabled === true || full}
        required={required}
        error={error}
        helperText={full ? `The list is full: at most ${String(max)} people.` : helperText}
      />
      {value.length === 0 ? (
        emptyText && (
          <Typography variant="body2" color="text.secondary">
            {emptyText}
          </Typography>
        )
      ) : (
        <Box component="ul" aria-label={listLabel} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, m: 0, p: 0, listStyle: 'none' }}>
          {value.map((person) => (
            <li key={person.id}>
              <Chip
                label={person.name}
                disabled={disabled}
                onDelete={() => {
                  onChange(value.filter((other) => other.id !== person.id));
                }}
                deleteIcon={<CancelIcon titleAccess={`Remove ${person.name}`} />}
              />
            </li>
          ))}
        </Box>
      )}
    </Stack>
  );
}
