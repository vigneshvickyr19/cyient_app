import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import { usePeopleSearch } from '../api/platformQueries';

/** A person as forms hold them: the id the API wants and the name to show. */
export interface PersonOption {
  id: number;
  name: string;
  detail?: string | null;
}

export interface PeoplePickerProps {
  label: ReactNode;
  value: PersonOption | null;
  onChange: (person: PersonOption | null) => void;
  /** People who may not be chosen, for example the requester themself. */
  excludeIds?: readonly number[];
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: ReactNode;
  name?: string;
}

/** Finds active people by name, login or email (from 2 characters), from the API's people list. */
export function PeoplePicker({ label, value, onChange, excludeIds = [], disabled, required, error, helperText, name }: PeoplePickerProps) {
  const [search, setSearch] = useState('');
  const people = usePeopleSearch(search);

  const options: PersonOption[] = (people.data ?? [])
    .filter((p) => !excludeIds.includes(p.id))
    .map((p) => ({ id: p.id, name: p.displayName, detail: [p.designation, p.department].filter(Boolean).join(' · ') || p.email }));

  return (
    <Autocomplete<PersonOption>
      value={value}
      onChange={(_, person) => {
        onChange(person);
      }}
      onInputChange={(_, text, reason) => {
        if (reason === 'input') setSearch(text);
      }}
      options={value && !options.some((o) => o.id === value.id) ? [value, ...options] : options}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      filterOptions={(list) => list}
      loading={people.isFetching}
      disabled={disabled}
      noOptionsText={search.trim().length < 2 ? 'Type at least 2 characters' : 'No one found'}
      renderOption={({ key, ...props }, option) => (
        <Box component="li" key={key} {...props}>
          <Box>
            <Typography variant="body2">{option.name}</Typography>
            {option.detail && (
              <Typography variant="caption" color="text.secondary">
                {option.detail}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} name={name} label={label} required={required} error={Boolean(error)} helperText={error ?? helperText} />
      )}
    />
  );
}
