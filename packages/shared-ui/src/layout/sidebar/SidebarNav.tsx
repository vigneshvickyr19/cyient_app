import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Divider,
  IconButton,
  List,
  Tooltip,
  Typography,
} from '@mui/material';
import { useAuth } from '../../auth/AuthProvider';
import { useSidebar } from './SidebarContext';
import { SidebarNavItem } from './SidebarNavItem';
import type { NavGroup, NavItem } from './types';

export interface SidebarNavProps {
  nav: readonly NavGroup[];
  onItemClick?: () => void;
}

export function SidebarNav({ nav, onItemClick }: SidebarNavProps) {
  const { collapsed, searchQuery } = useSidebar();
  const { canAny } = useAuth();

  const permissionFilteredGroups = nav
    .map((group) => {
      const items = group.items.filter((item) => {
        if (!item.anyOf || item.anyOf.length === 0) return true;
        return canAny(...item.anyOf);
      });
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  const filteredGroups = permissionFilteredGroups
    .map((group) => {
      if (!searchQuery.trim()) return group;
      const q = searchQuery.toLowerCase().trim();

      const items: NavItem[] = [];
      for (const item of group.items) {
        const matchLabel = item.label.toLowerCase().includes(q);
        const matchedChildren = item.children?.filter((c) =>
          c.label.toLowerCase().includes(q),
        );

        if (matchLabel || (matchedChildren && matchedChildren.length > 0)) {
          items.push({
            ...item,
            children: matchedChildren ?? item.children,
          });
        }
      }

      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  return (
    <Box component="nav" aria-label="Sidebar navigation" sx={{ flex: 1, py: 1 }}>
      {filteredGroups.map((group, groupIndex) => (
        <Box key={group.title ?? groupIndex} sx={{ mb: 2 }}>
          {group.title && (
            <Box
              sx={{
                px: 2.5,
                py: collapsed ? 0 : 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: collapsed ? 0 : 1,
                maxHeight: collapsed ? 0 : 36,
                overflow: 'hidden',
                pointerEvents: collapsed ? 'none' : 'auto',
                transition: (theme) =>
                  theme.transitions.create(['opacity', 'max-height', 'padding'], {
                    duration: 180,
                    easing: theme.transitions.easing.easeInOut,
                  }),
              }}
            >
              <Typography
                variant="caption"
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: '0.6875rem',
                  letterSpacing: '0.8px',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                {group.title}
              </Typography>
              {group.action && (
                <Tooltip title={group.action.title ?? 'Add'}>
                  <IconButton
                    size="small"
                    onClick={group.action.onClick}
                    sx={{
                      p: 0.25,
                      color: '#8fa5bc',
                      '&:hover': { color: 'text.primary' },
                    }}
                  >
                    {group.action.icon ?? <AddIcon sx={{ fontSize: 16 }} />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          )}

          <List dense disablePadding sx={{ px: collapsed ? 0 : 0 }}>
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.to ?? item.label}
                item={item}
                onItemClick={onItemClick}
              />
            ))}
          </List>

          {groupIndex < filteredGroups.length - 1 && (
            <Divider
              sx={{
                my: 1.5,
                mx: collapsed ? 'auto' : 2.5,
                width: collapsed ? 36 : 'auto',
                transition: (theme) =>
                  theme.transitions.create(['margin', 'width'], {
                    duration: 180,
                  }),
              }}
            />
          )}
        </Box>
      ))}

      {filteredGroups.length === 0 && searchQuery.trim() && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No matching items
          </Typography>
        </Box>
      )}
    </Box>
  );
}
