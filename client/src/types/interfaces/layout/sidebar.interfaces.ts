import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Building,
  GitBranch,
  BarChart2,
  ShieldCheck,
  CheckSquare,
  Mail,
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
  /** Legacy role-based guard — used only for super_admin-exclusive items */
  roles?: UserRole[];
  /** Fine-grained permission guard — show only when user has this permission */
  permission?: string;
}

export const navItems: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/leads",
    label: "Leads",
    icon: Users,
    permission: "leads:read",
  },
  {
    to: "/organizations",
    label: "Organizations",
    icon: Building2,
    permission: "organizations:read",
  },
  {
    to: "/deals",
    label: "Deals",
    icon: DollarSign,
    permission: "deals:read",
  },
  {
    to: "/workflows",
    label: "Workflows",
    icon: GitBranch,
    permission: "leads:read",
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: BarChart2,
    permission: "analytics:read",
  },
  {
    to: "/users",
    label: "Users",
    icon: Users,
    permission: "users:read",
  },
  {
    to: "/roles",
    label: "Roles",
    icon: ShieldCheck,
    permission: "roles:read",
  },
  {
    to: "/tenants",
    label: "Tenants",
    icon: Building,
    roles: ["super_admin"],
  },
  {
    to: "/tasks",
    label: "Tasks",
    icon: CheckSquare,
    permission: "tasks:read",
  },
  {
    to: "/campaigns",
    label: "Campaigns",
    icon: Mail,
    permission: "campaigns:read",
  },
];
