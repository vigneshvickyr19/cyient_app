import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import {
  Box,
  Breadcrumbs,
  Link,
  Tooltip,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router';

export interface BreadcrumbItem {
  label: string;
  to?: string;
  icon?: ReactNode;
}

export type Crumb = BreadcrumbItem;

export interface CustomBreadcrumbsProps {
  items?: readonly BreadcrumbItem[];
  showHome?: boolean;
  homeHref?: string;
  separator?: ReactNode;
  maxItems?: number;
  sx?: SxProps<Theme>;
}

export function CustomBreadcrumbs({
  items = [],
  showHome = true,
  homeHref = '/',
  separator = (
    <Typography
      component="span"
      sx={{
        color: 'text.disabled',
        fontSize: '0.8125rem',
        userSelect: 'none',
        mx: 0.25,
      }}
    >
      /
    </Typography>
  ),
  maxItems = 8,
  sx,
}: CustomBreadcrumbsProps) {
  if (!items.length && !showHome) {
    return null;
  }

  return (
    <Breadcrumbs
      aria-label="Breadcrumb"
      separator={separator}
      maxItems={maxItems}
      sx={{
        '& .MuiBreadcrumbs-ol': {
          alignItems: 'center',
          flexWrap: 'wrap',
        },
        '& .MuiBreadcrumbs-li': {
          display: 'inline-flex',
          alignItems: 'center',
        },
        ...sx,
      }}
    >
      {showHome && (
        <Tooltip title="Home">
          <Link
            component={RouterLink}
            to={homeHref}
            aria-label="Home"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: items.length === 0 ? 'text.primary' : 'text.secondary',
              textDecoration: 'none',
              borderRadius: 1,
              p: 0.25,
              transition: 'color 0.15s ease, background-color 0.15s ease',
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            <HomeOutlinedIcon sx={{ fontSize: 18 }} />
          </Link>
        </Tooltip>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (item.to && !isLast) {
          return (
            <Link
              key={`${item.label}-${index}`}
              component={RouterLink}
              to={item.to}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                fontSize: '0.8125rem',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: 1,
                py: 0.25,
                px: 0.5,
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {item.icon && (
                <Box component="span" sx={{ display: 'inline-flex', fontSize: 16 }}>
                  {item.icon}
                </Box>
              )}
              <span>{item.label}</span>
            </Link>
          );
        }

        return (
          <Typography
            key={`${item.label}-${index}`}
            component="span"
            aria-current={isLast ? 'page' : undefined}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: isLast ? 'text.primary' : 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: isLast ? 600 : 500,
              py: 0.25,
              px: 0.5,
            }}
          >
            {item.icon && (
              <Box component="span" sx={{ display: 'inline-flex', fontSize: 16 }}>
                {item.icon}
              </Box>
            )}
            {item.label}
          </Typography>
        );
      })}
    </Breadcrumbs>
  );
}
