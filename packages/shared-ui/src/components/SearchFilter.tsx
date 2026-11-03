import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Button, InputAdornment, Paper, Stack, TextField } from '@mui/material';
import { useRef, useState, type ReactNode } from 'react';

interface SearchFieldProps {
  value: string;
  /** Called after typing pauses (debounced), and at once on Enter. */
  onSearch: (value: string) => void;
  label?: string;
  placeholder?: string;
  delayMs?: number;
}

/** A search box that waits for the user to stop typing before searching. */
export function SearchField({ value, onSearch, label = 'Search', placeholder, delayMs = 400 }: SearchFieldProps) {
  const [text, setText] = useState(value);
  const [synced, setSynced] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // The search was changed elsewhere (for example "Clear filters")
  if (value !== synced) {
    setSynced(value);
    setText(value);
  }

  const run = (next: string) => {
    clearTimeout(timer.current);
    if (next.trim() !== value) onSearch(next.trim());
  };

  return (
    <TextField
      type="search"
      label={label}
      placeholder={placeholder}
      value={text}
      onChange={(event) => {
        const next = event.target.value;
        setText(next);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          run(next);
        }, delayMs);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          run(text);
        }
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

interface FilterBarProps {
  children: ReactNode;
  /** Shows "Clear filters" when any filter is set. */
  onClear?: () => void;
  active?: boolean;
  /** Buttons on the right, for example Export. */
  actions?: ReactNode;
}

/** The row of filters above a list; wraps onto several lines on small screens. */
export function FilterBar({ children, onClear, active = false, actions }: FilterBarProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ alignItems: { lg: 'center' } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          useFlexGap
          sx={{ flex: 1, flexWrap: 'wrap', '& > *': { minWidth: { sm: 180 }, flex: { sm: '1 1 180px' } } }}
        >
          {children}
        </Stack>
        {(onClear ?? actions) && (
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            {onClear && active && (
              <Button onClick={onClear} startIcon={<FilterAltOffOutlinedIcon />}>
                Clear filters
              </Button>
            )}
            {actions}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
