import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SearchIcon from '@mui/icons-material/Search';
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSidebar } from './sidebar';

export interface TopHeaderProps {
  appName: string;
  devUsers?: unknown;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onAppSearch?: (query: string) => void;
}

export function TopHeader({
  appName,
  notificationCount = 2,
  onNotificationClick,
  onAppSearch,
}: TopHeaderProps) {
  const theme = useTheme();
  const wide = useMediaQuery(theme.breakpoints.up('md'));
  const { setMobileOpen } = useSidebar();

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          px: { xs: 2, sm: 3 },
          gap: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {!wide && (
            <IconButton
              edge="start"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              size="medium"
              sx={{ color: 'text.secondary' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="h1"
            noWrap
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1rem', sm: '1.15rem' },
              color: 'text.primary',
              letterSpacing: '-0.2px',
            }}
          >
            {appName}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, width: { sm: 200, md: 260 } }}>
            <TextField
              size="small"
              placeholder="Search in application..."
              onChange={(e) => onAppSearch?.(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    height: 38,
                    borderRadius: '20px',
                    bgcolor: 'action.hover',
                    fontSize: '0.85rem',
                    transition: (t) =>
                      t.transitions.create(['background-color', 'box-shadow'], {
                        duration: 180,
                      }),
                    '&.Mui-focused': {
                      bgcolor: 'background.paper',
                    },
                    '& fieldset': {
                      borderColor: 'transparent',
                      transition: (t) =>
                        t.transitions.create('border-color', { duration: 180 }),
                    },
                    '&:hover fieldset': {
                      borderColor: 'divider',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            />
          </Box>

          <Tooltip title="Notifications">
            <IconButton
              size="medium"
              aria-label={`${notificationCount} new notifications`}
              onClick={onNotificationClick}
              sx={{
                color: 'text.secondary',
                bgcolor: 'action.hover',
                '&:hover': { bgcolor: 'action.selected', color: 'text.primary' },
              }}
            >
              <Badge badgeContent={notificationCount} color="error" max={99}>
                <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
