import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import { Badge, Button } from '@mui/material';

export interface FilterButtonProps {
  onClick: () => void;
  label?: string;
  /** How many filters are applied; the badge is left out at zero. */
  count?: number;
}

/** The button that opens a list's filters, with the number of filters in use on a badge. */
export function FilterButton({ onClick, label = 'Filters', count = 0 }: FilterButtonProps) {
  return (
    <Badge badgeContent={count} color="primary" sx={{ '& .MuiBadge-badge': { fontWeight: 700, fontSize: '0.7rem', height: 18, minWidth: 18 } }}>
      <Button
        variant="outlined"
        color="inherit"
        onClick={onClick}
        startIcon={<TuneOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />}
        sx={{
          textTransform: 'none',
          borderRadius: '10px',
          fontWeight: 600,
          fontSize: '0.875rem',
          // The border, height and hover of the inputs it stands beside, so a row of them looks like one set
          borderColor: 'rgba(var(--mui-palette-common-onBackgroundChannel) / 0.23)',
          minHeight: 41,
          bgcolor: 'background.paper',
          color: 'text.primary',
          px: 2,
          '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' },
        }}
      >
        {label}
      </Button>
    </Badge>
  );
}
