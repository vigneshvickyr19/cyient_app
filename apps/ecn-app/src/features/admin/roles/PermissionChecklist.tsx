import type { PermissionItem } from '@cyient/api-client/platform';
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import { useAuth } from '@cyient/shared-ui';

interface PermissionChecklistProps {
  catalogue: readonly PermissionItem[];
  /** The codes chosen now. */
  value: readonly string[];
  /** The codes the role had when it was loaded: these may be kept even by someone who can't give them. */
  saved: readonly string[];
  onChange: (codes: string[]) => void;
  disabled?: boolean;
}

interface Area {
  key: string;
  title: string;
  items: PermissionItem[];
}

const PLATFORM = 'platform';

/** Permissions grouped by area, the first part of the code: platform.* is administration, dcr.* the DCR and so on. */
function groupByArea(catalogue: readonly PermissionItem[], value: readonly string[]): Area[] {
  const areas = new Map<string, Area>();
  const known = new Set(catalogue.map((item) => item.code));
  const unknown = value.filter((code) => !known.has(code)).map((code) => ({ code, description: code }));
  for (const item of [...catalogue, ...unknown]) {
    const key = known.has(item.code) ? (item.code.split('.')[0] ?? item.code) : '';
    const title = key === PLATFORM ? 'Administration' : key === '' ? 'No longer in the catalogue' : key.toUpperCase();
    const area = areas.get(key) ?? { key, title, items: [] };
    area.items.push(item);
    areas.set(key, area);
  }
  return [...areas.values()];
}

/**
 * Check boxes for a role's permissions. Administration permissions (platform.*) can only be given by someone who holds
 * them, as the API requires, so the others are shown but can't be ticked.
 */
export function PermissionChecklist({ catalogue, value, saved, onChange, disabled = false }: PermissionChecklistProps) {
  const { can } = useAuth();
  const chosen = new Set(value);

  const toggle = (code: string, checked: boolean) => {
    onChange(checked ? [...value, code] : value.filter((current) => current !== code));
  };

  return (
    <Stack spacing={3}>
      {groupByArea(catalogue, value).map((area) => (
        <Box component="fieldset" key={area.key} sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
          <Typography component="legend" variant="subtitle2" sx={{ mb: 1 }}>
            {area.title} ({area.items.filter((item) => chosen.has(item.code)).length} of {area.items.length})
          </Typography>
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } }}>
            {area.items.map((item) => {
              const locked = item.code.startsWith(`${PLATFORM}.`) && !can(item.code) && !saved.includes(item.code);
              return (
                <FormControlLabel
                  key={item.code}
                  disabled={disabled || locked}
                  sx={{ alignItems: 'flex-start', m: 0 }}
                  control={
                    <Checkbox
                      checked={chosen.has(item.code)}
                      onChange={(event) => {
                        toggle(item.code, event.target.checked);
                      }}
                      sx={{ mt: -1 }}
                    />
                  }
                  label={
                    <Stack>
                      <Typography variant="body2">{item.description}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                        {item.code}
                        {locked && ' · Only someone who holds this permission can give it.'}
                      </Typography>
                    </Stack>
                  }
                />
              );
            })}
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
