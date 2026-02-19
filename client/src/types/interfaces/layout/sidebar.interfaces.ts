export interface SidebarProps {
  isOpen: boolean;
}

export interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isOpen: boolean;
  isActive: boolean;
}
