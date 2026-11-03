import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { ErrorBoundary } from '../errors/ErrorBoundary';
import { layout } from '../theme/breakpoints';
import { UserMenu, type DevUser } from './UserMenu';

export interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
  /** Shown only to users holding one of these permission codes. */
  anyOf?: readonly string[];
  /** A count on the item, for example pending actions. */
  badge?: number | null;
  /** Matches only this exact address (not its children). */
  end?: boolean;
}

export interface NavGroup {
  title?: string;
  items: readonly NavItem[];
}

interface AppShellProps {
  /** The application's name in the top bar, for example "Document Change Request". */
  appName: string;
  nav: readonly NavGroup[];
  /** Development sign-in only: sample people to switch to. */
  devUsers?: readonly DevUser[];
  children: ReactNode;
}

const MAIN_ID = 'main-content';

/** The frame of every app: top bar with the user menu, navigation (a drawer on small screens) and the page. */
export function AppShell({ appName, nav, devUsers, children }: AppShellProps) {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const { canAny } = useAuth();
  const location = useLocation();

  const groups = nav
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.anyOf || canAny(...item.anyOf)) }))
    .filter((group) => group.items.length > 0);

  const navigation = (
    <Box component="nav" aria-label="Main" sx={{ overflowY: 'auto', py: 1 }}>
      {groups.map((group, index) => (
        <List
          key={group.title ?? index}
          dense
          subheader={group.title ? <ListSubheader sx={{ bgcolor: 'transparent', lineHeight: '32px' }}>{group.title}</ListSubheader> : undefined}
        >
          {group.items.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={() => {
                setOpen(false);
              }}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.active': { bgcolor: 'action.selected', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Badge badgeContent={item.badge ?? 0} color="secondary" max={99}>
                  {item.icon}
                </Badge>
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
          {index < groups.length - 1 && <Divider sx={{ mt: 1 }} />}
        </List>
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Link
        href={`#${MAIN_ID}`}
        sx={{ position: 'absolute', left: -9999, '&:focus': { left: 8, top: 8, zIndex: theme.zIndex.tooltip, bgcolor: 'background.paper', p: 1 } }}
      >
        Skip to main content
      </Link>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: layout.appBarHeight, gap: 1 }}>
          {!wide && (
            <IconButton
              edge="start"
              aria-label="Open navigation"
              onClick={() => {
                setOpen(true);
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="overline" color="primary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Cyient DLM
          </Typography>
          <Typography variant="h6" component="span" noWrap sx={{ flex: 1 }}>
            {appName}
          </Typography>
          <UserMenu devUsers={devUsers} />
        </Toolbar>
      </AppBar>
      <Drawer
        variant={wide ? 'permanent' : 'temporary'}
        open={wide || open}
        onClose={() => {
          setOpen(false);
        }}
        sx={{ width: layout.navWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: layout.navWidth, boxSizing: 'border-box' } }}
      >
        <Toolbar sx={{ minHeight: layout.appBarHeight }} />
        {navigation}
      </Drawer>
      <Box component="main" id={MAIN_ID} tabIndex={-1} sx={{ flex: 1, minWidth: 0, outline: 'none' }}>
        <Toolbar sx={{ minHeight: layout.appBarHeight }} />
        <Box sx={{ maxWidth: layout.contentMaxWidth, mx: 'auto', p: { xs: 2, md: 3 } }}>
          <ErrorBoundary resetKeys={[location.pathname]}>{children}</ErrorBoundary>
        </Box>
      </Box>
    </Box>
  );
}
