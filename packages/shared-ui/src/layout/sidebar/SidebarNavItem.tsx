import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Badge,
  Box,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { NavLink } from 'react-router';
import { useSidebar } from './SidebarContext';
import { SidebarSubmenu } from './SidebarSubmenu';
import type { NavItem } from './types';

export interface SidebarNavItemProps {
  item: NavItem;
  onItemClick?: () => void;
}

export function SidebarNavItem({ item, onItemClick }: SidebarNavItemProps) {
  const { collapsed, isSubmenuOpen, toggleSubmenu } = useSidebar();
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const open = isSubmenuOpen(item.label);

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  const handleParentClick = (e: MouseEvent<HTMLElement>) => {
    if (collapsed) {
      setPopoverAnchor(e.currentTarget);
    } else {
      toggleSubmenu(item.label);
    }
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
  };

  const isActionButton =
    item.variant === 'button' ||
    item.label.toLowerCase().includes('new') ||
    item.label.toLowerCase().includes('create');

  return (
    <Box sx={{ mb: 0.5, display: 'flex', flexDirection: 'column', alignItems: collapsed ? 'center' : 'stretch' }}>
      <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
        <ListItemButton
          component={item.to && !hasChildren ? NavLink : 'div'}
          to={hasChildren ? undefined : item.to}
          end={item.end}
          onClick={hasChildren ? handleParentClick : onItemClick}
          aria-label={item.label}
          sx={{
            mx: collapsed ? 0 : 1.5,
            my: isActionButton ? 0.75 : 0.25,
            py: isActionButton ? 1.1 : 0.9,
            px: collapsed ? 0 : 1.5,
            width: collapsed ? 44 : 'auto',
            minWidth: collapsed ? 44 : 'auto',
            height: 44,
            borderRadius: '10px',
            color: isActionButton ? '#ffffff' : 'text.primary',
            bgcolor: isActionButton ? '#00a3ad' : 'transparent',
            boxShadow: isActionButton ? '0 2px 6px rgba(0, 163, 173, 0.25)' : 'none',
            justifyContent: collapsed ? 'center' : 'flex-start',
            transition: (theme) =>
              theme.transitions.create(['background-color', 'width', 'padding', 'margin'], {
                duration: 200,
                easing: theme.transitions.easing.easeInOut,
              }),
            '&:hover': {
              bgcolor: isActionButton ? '#008e97' : '#f1f5f9',
              color: isActionButton ? '#ffffff' : '#0f172a',
              '& .MuiListItemIcon-root': { color: isActionButton ? '#ffffff' : '#00a3ad' },
            },
            '&.active': {
              position: 'relative',
              bgcolor: isActionButton ? '#008e97' : 'rgba(0, 163, 173, 0.12)',
              color: isActionButton ? '#ffffff' : '#007a82',
              fontWeight: 600,
              '& .MuiListItemIcon-root': { color: isActionButton ? '#ffffff' : '#00a3ad' },
              ...(!isActionButton && !collapsed
                ? {
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 3.5,
                      borderRadius: '0 4px 4px 0',
                      bgcolor: '#00a3ad',
                    },
                  }
                : {}),
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 'auto' : 34,
              color: isActionButton ? '#ffffff' : '#64748b',
              justifyContent: 'center',
              display: 'flex',
            }}
          >
            <Badge badgeContent={item.badge ?? 0} color="secondary" max={99}>
              {item.icon}
            </Badge>
          </ListItemIcon>

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
              sx={{
                fontSize: '0.875rem',
                fontWeight: isActionButton ? 600 : 500,
                color: 'inherit',
              }}
            >
              {item.label}
            </Typography>
          </Box>

          {hasChildren && !collapsed && (
            open ? (
              <KeyboardArrowUpIcon sx={{ fontSize: 18, color: 'text.secondary', ml: 'auto' }} />
            ) : (
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: 'text.secondary', ml: 'auto' }} />
            )
          )}
        </ListItemButton>
      </Tooltip>

      {hasChildren && (
        <SidebarSubmenu
          items={item.children ?? []}
          parentKey={item.label}
          popoverAnchor={popoverAnchor}
          onClosePopover={handleClosePopover}
          onItemClick={onItemClick}
        />
      )}
    </Box>
  );
}
