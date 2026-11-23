import type { ReactNode } from 'react';

export interface NavItem {
  label: string;
  to?: string;
  icon: ReactNode;
  /** Shown only to users holding one of these permission codes. */
  anyOf?: readonly string[];
  /** A count on the item, for example pending actions. */
  badge?: number | null;
  /** Matches only this exact address (not its children). */
  end?: boolean;
  /** Primary button styling in sidebar (e.g. "+ New issue"). */
  variant?: 'default' | 'button';
  /** Nested sub-items for collapsible tree navigation (e.g. Dashboard -> Project, Revenue, Insights). */
  children?: readonly NavItem[];
}

export interface NavGroupAction {
  icon?: ReactNode;
  title?: string;
  onClick?: () => void;
}

export interface NavGroup {
  title?: string;
  items: readonly NavItem[];
  /** Optional action in the group header (e.g. '+' button as in MESSAGES section). */
  action?: NavGroupAction;
}

export interface SidebarUserInfo {
  name: string;
  avatarUrl?: string;
  status?: 'online' | 'busy' | 'offline';
  role?: string;
}
