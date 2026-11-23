import { Box, Link, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { layout } from '../theme/breakpoints';
import { Sidebar, SidebarProvider, type NavGroup, type SidebarUserInfo } from './sidebar';
import { TopHeader } from './TopHeader';
import type { DevUser } from './UserMenu';

export type { NavGroup, NavItem } from './sidebar';

export interface AppShellProps {
  /** The application's name in the top bar, for example "Document Change Request". */
  appName: string;
  nav: readonly NavGroup[];
  /** Development sign-in only: sample people to switch to. */
  devUsers?: readonly DevUser[];
  user?: SidebarUserInfo;
  notificationCount?: number;
  version?: string;
  children: ReactNode;
}

const MAIN_ID = 'main-content';

function AppShellContent({
  appName,
  nav,
  devUsers,
  user,
  notificationCount,
  version,
  children,
}: AppShellProps) {
  const theme = useTheme();
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <Link
        href={`#${MAIN_ID}`}
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': {
            left: 8,
            top: 8,
            zIndex: theme.zIndex.tooltip,
            bgcolor: 'background.paper',
            p: 1,
            borderRadius: 1,
          },
        }}
      >
        Skip to main content
      </Link>

      <Sidebar
        appName={appName}
        nav={nav}
        user={user}
        devUsers={devUsers}
        version={version}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TopHeader
          appName={appName}
          notificationCount={notificationCount}
        />

        <Box
          component="main"
          id={MAIN_ID}
          tabIndex={-1}
          sx={{
            flex: 1,
            minWidth: 0,
            outline: 'none',
            p: { xs: 2, sm: 3, md: 3.5 },
            bgcolor: 'background.default',
            color: 'text.primary',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              maxWidth: layout.contentMaxWidth,
              mx: 'auto',
              width: '100%',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <ErrorBoundary resetKeys={[location.pathname]}>
              {children}
            </ErrorBoundary>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/** The frame of every Cyient DLM app: collapsible sidebar, top bar and the page content. */
export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent {...props} />
    </SidebarProvider>
  );
}
