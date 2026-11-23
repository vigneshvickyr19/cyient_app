import { createContext, useCallback, useContext, useState, useMemo, type ReactNode } from 'react';

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapse: () => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  openSubmenus: Record<string, boolean>;
  toggleSubmenu: (key: string) => void;
  isSubmenuOpen: (key: string) => boolean;

  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export interface SidebarProviderProps {
  children: ReactNode;
  defaultCollapsed?: boolean;
}

export function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = () => setCollapsed((prev) => !prev);

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isSubmenuOpen = useCallback((key: string) => openSubmenus[key] ?? true, [openSubmenus]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapse,
      searchQuery,
      setSearchQuery,
      openSubmenus,
      toggleSubmenu,
      isSubmenuOpen,
      mobileOpen,
      setMobileOpen,
    }),
    [collapsed, searchQuery, openSubmenus, isSubmenuOpen, mobileOpen],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
