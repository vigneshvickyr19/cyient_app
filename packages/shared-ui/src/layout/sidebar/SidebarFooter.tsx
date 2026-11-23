import { initials } from '@cyient/shared-utils';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Avatar, Badge, Box, ButtonBase, Tooltip, Typography } from '@mui/material';
import { useAuth } from '../../auth/AuthProvider';
import { UserMenu, type DevUser } from '../UserMenu';
import { useSidebar } from './SidebarContext';
import type { SidebarUserInfo } from './types';

export interface SidebarFooterProps {
  user?: SidebarUserInfo;
  devUsers?: readonly DevUser[];
  version?: string;
  copyright?: string;
}

export function SidebarFooter({
  user: explicitUser,
  devUsers,
}: SidebarFooterProps) {
  const { collapsed } = useSidebar();
  const auth = useAuth();
  const authUser = auth.user;

  const displayName = explicitUser?.name ?? authUser?.displayName ?? 'User';
  const roleName = explicitUser?.role ?? authUser?.roles?.[0] ?? '';

  return (
    <Box
      sx={{
        p: collapsed ? 1 : 1.25,
        mt: 'auto',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: (theme) => theme.transitions.create('padding', { duration: 200 }),
      }}
    >
      <UserMenu
        devUsers={devUsers}
        anchorOrigin={{
          vertical: 'top',
          horizontal: collapsed ? 'right' : 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: collapsed ? 'left' : 'left',
        }}
      >
        {({ onClick, open }) => (
          <Tooltip title={collapsed ? displayName : ''} placement="right" arrow>
            <ButtonBase
              onClick={onClick}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label="User account menu"
              sx={{
                width: collapsed ? 44 : '100%',
                minWidth: collapsed ? 44 : 'auto',
                height: 44,
                p: collapsed ? 0 : 1,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: 1.25,
                textAlign: 'left',
                bgcolor: open ? '#f1f5f9' : 'transparent',
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'width', 'padding'], {
                    duration: 200,
                    easing: theme.transitions.easing.easeInOut,
                  }),
                '&:hover': {
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  flexShrink: 0,
                  '& .MuiBadge-badge': {
                    bgcolor: '#10b981', // Emerald online dot
                    boxShadow: '0 0 0 2px #ffffff',
                  },
                }}
              >
                <Avatar
                  src={explicitUser?.avatarUrl}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: '#00a3ad',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  {initials(displayName)}
                </Avatar>
              </Badge>

              <Box
                sx={{
                  minWidth: 0,
                  flex: 1,
                  overflow: 'hidden',
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? 0 : 160,
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
                  variant="body2"
                  noWrap
                  sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}
                >
                  {displayName}
                </Typography>
                {roleName && (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{
                      color: 'text.secondary',
                      display: 'block',
                      fontSize: '0.75rem',
                      mt: 0.25,
                    }}
                  >
                    {roleName}
                  </Typography>
                )}
              </Box>

              {!collapsed && (
                <UnfoldMoreIcon sx={{ fontSize: 18, color: 'text.secondary', ml: 'auto', flexShrink: 0 }} />
              )}
            </ButtonBase>
          </Tooltip>
        )}
      </UserMenu>

      {!collapsed && (
        <Box sx={{ pt: 1.5, pb: 0.5, textAlign: 'center', width: '100%' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              letterSpacing: '0.15em',
              fontSize: '0.6875rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              opacity: 0.65,
            }}
          >
            Cyient DLM
          </Typography>
        </Box>
      )}
    </Box>
  );
}
