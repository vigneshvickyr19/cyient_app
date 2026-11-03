import { humanize, initials } from '@cyient/shared-utils';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import SwitchAccountOutlinedIcon from '@mui/icons-material/SwitchAccountOutlined';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Input } from '../components/inputs';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

/** A sample person to act as with development sign-in (the API's Docker sample data). */
export interface DevUser {
  login: string;
  name: string;
  /** What they are for, for example "IMS Review". */
  role?: string;
}

/** The signed-in person: roles, light or dark mode, switching person (development) and signing out. */
export function UserMenu({ devUsers = [] }: { devUsers?: readonly DevUser[] }) {
  const { user, mode, signOut, development } = useAuth();
  const { mode: colorMode, systemMode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [switching, setSwitching] = useState(false);
  const dark = (colorMode === 'system' ? systemMode : colorMode) === 'dark';

  const close = () => {
    setAnchor(null);
  };

  return (
    <>
      <Tooltip title={user.displayName ?? 'Account'}>
        <IconButton
          aria-label="Account"
          aria-haspopup="menu"
          onClick={(event) => {
            setAnchor(event.currentTarget);
          }}
        >
          <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'primary.main' }}>{initials(user.displayName)}</Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={close} slotProps={{ paper: { sx: { width: 300 } } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1">{user.displayName}</Typography>
          {development && (
            <Typography variant="caption" color="text.secondary">
              Development sign-in: {development.login ?? 'the API’s default user'}
            </Typography>
          )}
          <Stack direction="row" useFlexGap spacing={0.5} sx={{ flexWrap: 'wrap', mt: 1 }}>
            {user.roles.map((role) => (
              <Chip key={role} label={role} variant="outlined" />
            ))}
          </Stack>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setMode(dark ? 'light' : 'dark');
          }}
        >
          <ListItemIcon>{dark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}</ListItemIcon>
          {dark ? 'Light mode' : 'Dark mode'}
        </MenuItem>
        {development && (
          <MenuItem
            onClick={() => {
              close();
              setSwitching(true);
            }}
          >
            <ListItemIcon>
              <SwitchAccountOutlinedIcon fontSize="small" />
            </ListItemIcon>
            Act as someone else
          </MenuItem>
        )}
        {mode === 'entra' && (
          <MenuItem onClick={signOut}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Sign out
          </MenuItem>
        )}
      </Menu>
      {development && (
        <SwitchUserDialog
          open={switching}
          current={development.login}
          devUsers={devUsers}
          onClose={() => {
            setSwitching(false);
          }}
          onSwitch={(login) => {
            setSwitching(false);
            development.switchUser(login);
          }}
        />
      )}
    </>
  );
}

function SwitchUserDialog({
  open,
  current,
  devUsers,
  onClose,
  onSwitch,
}: {
  open: boolean;
  current: string | null;
  devUsers: readonly DevUser[];
  onClose: () => void;
  onSwitch: (login: string | null) => void;
}) {
  const [login, setLogin] = useState('');
  return (
    <Modal
      open={open}
      title="Act as someone else"
      onClose={onClose}
      onSubmit={(event) => {
        event.preventDefault();
        onSwitch(login.trim() || null);
      }}
      actions={
        <>
          <Button onClick={() => { onSwitch(null); }}>Default user</Button>
          <Button type="submit" variant="contained" disabled={!login.trim()}>
            Switch
          </Button>
        </>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Development sign-in sends this login in the X-Dev-User header. Pick a sample person or type a login.
      </Typography>
      {devUsers.length > 0 && (
        <List dense sx={{ mb: 2, maxHeight: 320, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
          {devUsers.map((person) => (
            <ListItemButton
              key={person.login}
              selected={person.login === current}
              onClick={() => {
                onSwitch(person.login);
              }}
            >
              <ListItemText primary={person.name} secondary={`${person.login}${person.role ? ` · ${humanize(person.role)}` : ''}`} />
            </ListItemButton>
          ))}
        </List>
      )}
      <Input label="Login (X-Dev-User)" placeholder="CYIENTDLM\requester" value={login} onChange={setLogin} />
    </Modal>
  );
}
