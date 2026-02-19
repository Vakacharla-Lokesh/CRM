import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Building,
} from "lucide-react";
import { useAppContext } from "@/context";

import type {
  SidebarProps,
  NavLinkProps,
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

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";

  return (
    <aside
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col`}
      style={{
        height: "calc(100vh - 4rem)",
        position: "sticky",
        top: "4rem",
      }}
    >
      <nav className="p-4 space-y-2 shrink-0">
        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isOpen={isOpen}
          isActive={isActive("/dashboard")}
        />

        {/* Leads */}
        <NavLink
          to="/leads"
          icon={<Users size={20} />}
          label="Leads"
          isOpen={isOpen}
          isActive={isActive("/leads")}
        />

        {/* Organizations */}
        <NavLink
          to="/organizations"
          icon={<Building2 size={20} />}
          label="Organizations"
          isOpen={isOpen}
          isActive={isActive("/organizations")}
        />

        {/* Deals */}
        <NavLink
          to="/deals"
          icon={<DollarSign size={20} />}
          label="Deals"
          isOpen={isOpen}
          isActive={isActive("/deals")}
        />

        {/* Users - Only for admin and super_admin */}
        {isAdmin && (
          <NavLink
            to="/users"
            icon={<Users size={20} />}
            label="Users"
            isOpen={isOpen}
            isActive={isActive("/users")}
          />
        )}

        {/* Tenants - Only for super_admin */}
        {isSuperAdmin && (
          <NavLink
            to="/tenants"
            icon={<Building size={20} />}
            label="Tenants"
            isOpen={isOpen}
            isActive={isActive("/tenants")}
          />
        )}
      </nav>

      {/* Quick Stats Section */}
      {isOpen && (
        <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700 shrink-0">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-4">
            Quick Stats
          </h3>

          <div className="space-y-3">
            {/* Total Leads */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Leads
              </p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                12,450
              </p>
            </div>

            {/* Active Campaigns */}
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Active Campaigns
              </p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                8
              </p>
            </div>

            {/* Conversion Rate */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                3.2%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Sidebar Stats */}
      {!isOpen && (
        <div className="p-2 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-auto shrink-0">
          <div
            className="w-16 h-16 mx-auto p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex flex-col items-center justify-center"
            title="Total Leads"
          >
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Leads
            </span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              12.4k
            </span>
          </div>
          <div
            className="w-16 h-16 mx-auto p-2 bg-green-50 dark:bg-green-900/20 rounded-lg flex flex-col items-center justify-center"
            title="Active Campaigns"
          >
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Campaign
            </span>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              8
            </span>
          </div>
          <div
            className="w-16 h-16 mx-auto p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex flex-col items-center justify-center"
            title="Conversion Rate"
          >
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Conv.
            </span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
              3.2%
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
