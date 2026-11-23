import { Tabs, type TabsProps } from '@mui/material';
import { sxList } from '../sxArray';

/**
 * The views of one list as joined, bordered segments with the open one filled, for example "All requests" and "My
 * requests". Used with MUI's Tab children, so it stays a tab list for keyboards and screen readers.
 */
export function SegmentedTabs({ sx, ...props }: Omit<TabsProps, 'slotProps'>) {
  return (
    <Tabs
      {...props}
      slotProps={{ indicator: { sx: { display: 'none' } } }}
      sx={[
        {
          minHeight: 0,
          width: 'fit-content',
          maxWidth: '100%',
          border: 1,
          borderColor: 'divider',
          borderRadius: '10px',
          bgcolor: 'background.paper',
          '& .MuiTab-root': {
            minHeight: 40,
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
            color: 'text.primary',
            '&:not(:last-of-type)': { borderRight: 1, borderColor: 'divider' },
            '&:hover': { bgcolor: 'action.hover' },
            '&.Mui-selected': { color: 'primary.main', bgcolor: 'rgb(var(--mui-palette-primary-mainChannel) / 0.12)' },
          },
        },
        ...sxList(sx),
      ]}
    />
  );
}
