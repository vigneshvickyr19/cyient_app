import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import type { ReactNode } from 'react';
import type { NavGroup, NavItem } from '@cyient/shared-ui';
import { adminPageOrder, adminPermissions, type AdminPage } from './permissions';

const pages: Record<AdminPage, { label: string; icon: ReactNode }> = {
  roles: { label: 'Roles', icon: <AdminPanelSettingsOutlinedIcon /> },
  users: { label: 'Users', icon: <PeopleOutlinedIcon /> },
  masters: { label: 'Master lists', icon: <ListAltOutlinedIcon /> },
  audit: { label: 'Audit trail', icon: <HistoryOutlinedIcon /> },
  emails: { label: 'Email log', icon: <EmailOutlinedIcon /> },
  logs: { label: 'Technical log', icon: <ReceiptLongOutlinedIcon /> },
  jobs: { label: 'Jobs', icon: <ScheduleOutlinedIcon /> },
  numbering: { label: 'Numbering', icon: <FormatListNumberedOutlinedIcon /> },
};

export interface AdminNavOptions {
  basePath?: string;
  exclude?: readonly AdminPage[];
  extraItems?: readonly NavItem[];
}

/** The navigation group of the administration pages; AppShell shows each item only to users holding its permission. */
export function adminNav(basePathOrOptions: string | AdminNavOptions = '/admin'): NavGroup {
  const options: AdminNavOptions =
    typeof basePathOrOptions === 'string' ? { basePath: basePathOrOptions } : basePathOrOptions;
  const base = (options.basePath ?? '/admin').replace(/\/$/, '');
  const excludeSet = new Set(options.exclude ?? []);

  const items: NavItem[] = adminPageOrder
    .filter((page) => !excludeSet.has(page))
    .map((page) => ({
      label: pages[page].label,
      to: `${base}/${page}`,
      icon: pages[page].icon,
      anyOf: [adminPermissions[page]],
    }));

  return {
    title: 'Administration',
    items: [...items, ...(options.extraItems ?? [])],
  };
}
