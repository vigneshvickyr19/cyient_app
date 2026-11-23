import { Box, Stack, Typography } from '@mui/material';
import { useSidebar } from './SidebarContext';

export interface SidebarHeaderProps {
  appName?: string;
  brandName?: string;
}

function BrandEmblem() {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        minWidth: 36,
        borderRadius: '10px',
        bgcolor: '#00a3ad',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 163, 173, 0.35)',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    </Box>
  );
}

export function SidebarHeader({ appName, brandName = 'Cyient DLM' }: SidebarHeaderProps) {
  const { collapsed } = useSidebar();

  return (
    <Box
      sx={{
        px: collapsed ? 1.5 : 2.5,
        py: 2.5,
        transition: (theme) => theme.transitions.create('padding', { duration: 200 }),
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <BrandEmblem />
        <Box
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            opacity: collapsed ? 0 : 1,
            maxWidth: collapsed ? 0 : 180,
            transform: collapsed ? 'translateX(-8px)' : 'translateX(0)',
            transition: (theme) =>
              theme.transitions.create(['opacity', 'max-width', 'transform'], {
                duration: 200,
                easing: theme.transitions.easing.easeInOut,
              }),
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {brandName}
          </Typography>
          {appName && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                color: 'text.secondary',
                display: 'block',
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              {appName}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
