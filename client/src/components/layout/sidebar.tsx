import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { useAppContext } from "@/hooks";
import { routeConfig } from "@/router/routeConfig";

import {
  type SidebarProps,
  type NavLinkProps,
  navItems,
} from "@/types/interfaces/layout/sidebar.interfaces";

const preloadMap = new Map(
  routeConfig.filter((r) => r.preload).map((r) => [r.path, r.preload!]),
);

const NavLink = ({
  to,
  icon,
  label,
  onClick,
  isOpen,
  isActive,
}: NavLinkProps) => {
  const handlePrefetch = () => {
    preloadMap.get(to)?.();
  };

  return (
    <Link
      to={to}
      onClick={onClick}
      onPointerEnter={handlePrefetch}
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
};

function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const { user } = useAppContext();

  const isActive = (path: string) => location.pathname === path;

  const isSuperAdmin = user?.role === "super_admin";
  const userPermissions = user?.permissions ?? [];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles && !item.permission) return true;
    if (isSuperAdmin) return true;
    if (item.roles && item.roles.length > 0) {
      return user?.role ? item.roles.includes(user.role) : false;
    }
    if (item.permission) {
      return userPermissions.includes(item.permission);
    }
    return false;
  });

  useEffect(() => {
    if (!user) return;

    const visiblePaths = filteredNavItems.map((item) => item.to);

    const id = requestIdleCallback(
      () => {
        visiblePaths.forEach((path) => {
          preloadMap.get(path)?.();
        });
      },
      { timeout: 3000 },
    );

    return () => cancelIdleCallback(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); 

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
