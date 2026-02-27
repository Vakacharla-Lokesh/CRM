import { Link, useLocation } from "react-router-dom";

import { useAppContext } from "@/hooks";

import {
  type SidebarProps,
  type NavLinkProps,
  navItems,
} from "@/types/interfaces/layout/sidebar.interfaces";

const NavLink = ({
  to,
  icon,
  label,
  onClick,
  isOpen,
  isActive,
}: NavLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-accent text-primary border-primary rounded-lg"
        : "text-muted-foreground hover:bg-muted border-transparent rounded-lg"
    }`}
  >
    <span className="w-5 h-5 shrink-0">{icon}</span>
    {isOpen && <span>{label}</span>}
  </Link>
);

function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAppContext();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSuperAdmin = user?.role === "super_admin";
  const userPermissions = user?.permissions ?? [];

  const filteredNavItems = navItems.filter((item) => {
    // Items with no guards are always visible (e.g. Dashboard)
    if (!item.roles && !item.permission) return true;

    // Super-admins see everything
    if (isSuperAdmin) return true;

    // Role-exclusive items (e.g. Tenants)
    if (item.roles && item.roles.length > 0) {
      return user?.role ? item.roles.includes(user.role) : false;
    }

    // Permission-gated items
    if (item.permission) {
      return userPermissions.includes(item.permission);
    }

    return false;
  });

  return (
    <aside
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col shadow-sm`}
      style={{
        height: "calc(100vh - 4rem)",
        position: "sticky",
        top: "4rem",
      }}
    >
      <nav className="p-4 space-y-2 shrink-0">
        {filteredNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            icon={<Icon size={20} />}
            label={label}
            isOpen={isOpen}
            isActive={isActive(to)}
          />
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
