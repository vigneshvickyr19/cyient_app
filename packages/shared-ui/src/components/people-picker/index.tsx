import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Autocomplete,
  Box,
  FormControl,
  TextField,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import { useId, useState, type ReactNode } from 'react';
import { usePeopleSearch } from '../../api/platformQueries';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { FieldLabel } from '../field-label';
import { sxList } from '../sxArray';

/** A person as forms hold them: the id the API wants and the name to show. */
export interface PersonOption {
  id: number;
  name: string;
  detail?: string | null;
}

/** A chosen person as a list filter holds them in the address (their id and their name); null when none is chosen. */
export function personOf(id: string | undefined, name: string | undefined): PersonOption | null {
  return id ? { id: Number(id), name: name ?? '' } : null;
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
  placeholder?: string;
  /** Debounce delay in milliseconds for people search query. Defaults to 300ms. */
  debounceMs?: number;
  sx?: SxProps<Theme>;
}

/**
 * Reusable hook for debounced people search.
 * Manages search input state, debounces search term, and queries the directory.
 */
export function usePeoplePickerSearch(initialSearch = '', delayMs = 300) {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(search, delayMs);
  const query = usePeopleSearch(debouncedSearch);

  const isDebouncing = search.trim().length >= 2 && search !== debouncedSearch;
  const isLoading = query.isFetching || isDebouncing;

  return {
    search,
    setSearch,
    debouncedSearch,
    query,
    isLoading,
    isDebouncing,
  };
}

/** Finds active people by name, login or email (from 2 characters), with debounced search query. */
export function PeoplePicker({
  label,
  value,
  onChange,
  excludeIds = [],
  disabled,
  required,
  error,
  helperText,
  name,
  placeholder,
  debounceMs = 300,
  sx,
}: PeoplePickerProps) {
  const id = useId();
  const { search, setSearch, query: people, isLoading } = usePeoplePickerSearch('', debounceMs);

  const options: PersonOption[] = (people.data ?? [])
    .filter((p) => !excludeIds.includes(p.id))
    .map((p) => ({
      id: p.id,
      name: p.displayName,
      detail: [p.designation, p.department].filter(Boolean).join(' · ') || p.email,
    }));

  return (
    <FormControl fullWidth error={Boolean(error)} disabled={disabled} sx={{ mb: 1 }}>
      <FieldLabel htmlFor={id} error={Boolean(error)} required={required}>
        {label}
      </FieldLabel>
      <Autocomplete<PersonOption>
        id={id}
        value={value}
        onChange={(_, person) => {
          onChange(person);
        }}
        onInputChange={(_, text, reason) => {
          if (reason === 'input') setSearch(text);
          else if (reason === 'clear') setSearch('');
        }}
        options={value && !options.some((o) => o.id === value.id) ? [value, ...options] : options}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, current) => option.id === current.id}
        filterOptions={(list) => list}
        loading={isLoading}
        disabled={disabled}
        noOptionsText={
          search.trim().length < 2
            ? 'Type at least 2 characters'
            : isLoading
              ? 'Searching...'
              : 'No one found'
        }
        popupIcon={
          <KeyboardArrowDownIcon
            sx={{
              fontSize: 20,
              color: 'text.secondary',
            }}
          />
        }
        clearIcon={
          <CloseRoundedIcon
            sx={{
              fontSize: 18,
              color: 'text.secondary',
            }}
          />
        }
        sx={[
          {
            '& .MuiAutocomplete-popupIndicator': {
              color: 'text.secondary',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            },
            '& .MuiAutocomplete-clearIndicator': {
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
            },
          },
          ...sxList(sx),
        ]}
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
          <TextField
            {...params}
            name={name}
            placeholder={placeholder ?? 'Search for a person'}
            required={required}
            error={Boolean(error)}
            helperText={error ?? helperText}
            size="small"
          />
        )}
      />
    </FormControl>
  );
}
