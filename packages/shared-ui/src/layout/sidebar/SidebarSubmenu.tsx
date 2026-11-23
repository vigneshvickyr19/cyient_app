import {
  Badge,
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
  Popover,
} from '@mui/material';
import { NavLink } from 'react-router';
import { useSidebar } from './SidebarContext';
import type { NavItem } from './types';

export interface SidebarSubmenuProps {
  items: readonly NavItem[];
  parentKey: string;
  popoverAnchor?: HTMLElement | null;
  onClosePopover?: () => void;
  onItemClick?: () => void;
}

export function SidebarSubmenu({
  items,
  parentKey,
  popoverAnchor,
  onClosePopover,
  onItemClick,
}: SidebarSubmenuProps) {
  const { collapsed, isSubmenuOpen } = useSidebar();
  const open = isSubmenuOpen(parentKey);

  if (collapsed) {
    const isPopoverOpen = Boolean(popoverAnchor);

    return (
      <Popover
        open={isPopoverOpen}
        anchorEl={popoverAnchor}
        onClose={onClosePopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              ml: 1.5,
              minWidth: 170,
              borderRadius: '14px',
              p: 1,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              bgcolor: 'background.paper',
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        <List dense disablePadding>
          {items.map((subItem) => (
            <ListItemButton
              key={subItem.to ?? subItem.label}
              component={subItem.to ? NavLink : 'div'}
              to={subItem.to}
              end={subItem.end}
              onClick={() => {
                onClosePopover?.();
                onItemClick?.();
              }}
              sx={{
                borderRadius: '8px',
                py: 0.8,
                px: 1.5,
                my: 0.25,
                color: 'text.secondary',
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  bgcolor: '#f1f5f9',
                  color: 'text.primary',
                },
                '&.active': {
                  bgcolor: 'rgba(0, 163, 173, 0.12)',
                  color: '#007a82',
                  fontWeight: 600,
                },
              }}
            >
              <ListItemText
                primary={subItem.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 'inherit',
                }}
              />
              {Boolean(subItem.badge) && (
                <Badge badgeContent={subItem.badge} color="primary" sx={{ ml: 1 }} />
              )}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    );
  }

  return (
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Box
        sx={{
          position: 'relative',
          pl: 3.5, // Indents the tree
          my: 0.5,
        }}
      >
        <List dense disablePadding>
          {items.map((subItem, index) => {
            const isLast = index === items.length - 1;

            return (
              <Box
                key={subItem.to ?? subItem.label}
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: 9,
                    top: 0,
                    bottom: isLast ? '50%' : 0,
                    width: 1.5,
                    bgcolor: '#cbd5e1',
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    left: 9,
                    top: '50%',
                    width: 14,
                    height: 14,
                    transform: 'translateY(-100%)',
                    borderLeft: '1.5px solid #cbd5e1',
                    borderBottom: '1.5px solid #cbd5e1',
                    borderBottomLeftRadius: '8px',
                  }}
                />

                <ListItemButton
                  component={subItem.to ? NavLink : 'div'}
                  to={subItem.to}
                  end={subItem.end}
                  onClick={onItemClick}
                  sx={{
                    ml: 3,
                    mr: 1,
                    my: 0.25,
                    py: 0.6,
                    px: 1.5,
                    borderRadius: '8px',
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: '#f1f5f9',
                      color: 'text.primary',
                    },
                    '&.active': {
                      bgcolor: 'rgba(0, 163, 173, 0.12)',
                      color: '#007a82',
                      fontWeight: 600,
                    },
                  }}
                >
                  <ListItemText
                    primary={subItem.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: 'inherit',
                    }}
                  />
                  {Boolean(subItem.badge) && (
                    <Badge badgeContent={subItem.badge} color="primary" sx={{ ml: 1 }} />
                  )}
                </ListItemButton>
              </Box>
            );
          })}
        </List>
      </Box>
    </Collapse>
  );
}
