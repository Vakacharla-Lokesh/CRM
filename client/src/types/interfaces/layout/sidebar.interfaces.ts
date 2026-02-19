export interface SidebarProps {
  isOpen: boolean;
}

export interface ExpandedMenus {
  leads: boolean;
  campaigns: boolean;
  analytics: boolean;
  settings: boolean;
}

export interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number | string;
  onClick?: () => void;
  isOpen: boolean;
  isActive: boolean;
}

export interface MenuButtonProps {
  icon: React.ReactNode;
  label: string;
  isExpanded: boolean;
  onClick: () => void;
  badge?: number | string;
  isOpen: boolean;
}
