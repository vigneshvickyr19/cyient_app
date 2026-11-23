import { Tab, Tabs, type TabProps, type TabsProps } from '@mui/material';
import { sxList } from '../sxArray';

export type SegmentedTabsProps = Omit<TabsProps, 'slotProps'>;
export type { TabProps };
export { Tab, Tab as CustomTab };

/**
 * The views of one list or record as joined, bordered segments with the open one filled, for example "All requests" and "My
 * requests", or record detail sections. Used with Tab children, so it stays a tab list for keyboards and screen readers.
 */
export function SegmentedTabs({ sx, ...props }: SegmentedTabsProps) {
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
            '&.Mui-disabled': { opacity: 0.45 },
          },
        },
        ...sxList(sx),
      ]}
    />
  );
}

export { SegmentedTabs as Tabs, SegmentedTabs as CustomTabs };

