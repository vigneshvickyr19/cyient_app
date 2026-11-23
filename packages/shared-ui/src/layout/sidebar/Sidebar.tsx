import { Box, Drawer, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SidebarCollapseButton } from './SidebarCollapseButton';
import { useSidebar } from './SidebarContext';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import type { DevUser } from '../UserMenu';
import type { NavGroup, SidebarUserInfo } from './types';

export const SIDEBAR_EXPANDED_WIDTH = 260;
export const SIDEBAR_COLLAPSED_WIDTH = 76;
export const SIDEBAR_BG = '#ffffff';
export const SIDEBAR_BORDER = '#e2e8f0';

export interface SidebarProps {
  appName?: string;
  brandName?: string;
  nav: readonly NavGroup[];
  user?: SidebarUserInfo;
  devUsers?: readonly DevUser[];
  version?: string;
  copyright?: string;
  /** Explicitly control desktop permanent mode (defaults to md breakpoint). */
  isDesktop?: boolean;
}

export function Sidebar({
  appName,
  brandName,
  nav,
  user,
  devUsers,
  version,
  copyright,
  isDesktop: explicitDesktop,
}: SidebarProps) {
  const theme = useTheme();
  const wideBreakpoint = useMediaQuery(theme.breakpoints.up('md'));
  const wide = explicitDesktop ?? wideBreakpoint;
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  const currentWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  const sidebarContent = (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: SIDEBAR_BG,
        color: 'text.primary',
        overflowX: 'visible',
      }}
    >
      {wide && <SidebarCollapseButton />}

      <SidebarHeader appName={appName} brandName={brandName} />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: collapsed ? 'none' : 'thin',
          scrollbarColor: (t) => `${t.palette.divider} transparent`,
          '&::-webkit-scrollbar': {
            width: collapsed ? 0 : 4,
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: (t) => t.palette.divider,
            borderRadius: 4,
          },
        }}
      >
        <SidebarNav nav={nav} onItemClick={() => setMobileOpen(false)} />
      </Box>

      <SidebarFooter user={user} devUsers={devUsers} version={version} copyright={copyright} />
    </Box>
  );

  if (wide) {
    return (
      <Box
        component="aside"
        aria-label="Sidebar"
        sx={{
          position: 'sticky',
          top: 0,
          left: 0,
          height: '100vh',
          width: currentWidth,
          flexShrink: 0,
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
          bgcolor: SIDEBAR_BG,
          transition: (t) =>
            t.transitions.create('width', {
              easing: t.transitions.easing.sharp,
              duration: 220,
            }),
          zIndex: theme.zIndex.drawer,
          boxShadow: '1px 0 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        {sidebarContent}
      </Box>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={() => setMobileOpen(false)}
      ModalProps={{ keepMounted: true }}
      sx={{
        zIndex: theme.zIndex.drawer + 2,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_EXPANDED_WIDTH,
          boxSizing: 'border-box',
          bgcolor: SIDEBAR_BG,
          color: 'text.primary',
          borderRight: `1px solid ${SIDEBAR_BORDER}`,
        },
      }}
    >
      {sidebarContent}
    </Drawer>
  );
}
