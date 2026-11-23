import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { IconButton, Tooltip } from '@mui/material';
import { useSidebar } from './SidebarContext';

export function SidebarCollapseButton() {
  const { collapsed, toggleCollapse } = useSidebar();
  const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <Tooltip title={label} placement="right">
      <IconButton
        onClick={toggleCollapse}
        aria-label={label}
        size="small"
        sx={{
          position: 'absolute',
          top: 24,
          right: -13,
          zIndex: 1200,
          width: 24,
          height: 24,
          bgcolor: '#ffffff',
          color: 'text.secondary',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: '#f8fafc',
            color: '#00a3ad',
            borderColor: '#00a3ad',
          },
        }}
      >
        {collapsed ? (
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        ) : (
          <ChevronLeftIcon sx={{ fontSize: 16 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
