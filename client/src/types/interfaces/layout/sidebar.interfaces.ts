import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Building,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/types";

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

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["user", "admin", "super_admin"],
  },
  {
    to: "/leads",
    label: "Leads",
    icon: Users,
    roles: ["user", "admin"],
  },
  {
    to: "/organizations",
    label: "Organizations",
    icon: Building2,
    roles: ["user", "admin"],
  },
  {
    to: "/deals",
    label: "Deals",
    icon: DollarSign,
    roles: ["user", "admin"],
  },
  {
    to: "/users",
    label: "Users",
    icon: Users,
    roles: ["admin"],
  },
  {
    to: "/tenants",
    label: "Tenants",
    icon: Building,
    roles: ["super_admin"],
  },
];
