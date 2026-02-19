import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Plus,
  Tag,
  Star,
  Megaphone,
  FileText,
  Save,
  TrendingUp,
  BarChart2,
  Target,
  DollarSign,
  Smartphone,
  User,
  Settings,
  Building2,
  Link2,
  Key,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import type {
  ExpandedMenus,
  MenuButtonProps,
  SidebarProps,
  NavLinkProps,
} from "@/types/interfaces/layout/sidebar.interfaces";

const NavLink = ({
  to,
  icon,
  label,
  badge,
  onClick,
  isOpen,
  isActive,
}: NavLinkProps) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    <span className="w-5 h-5 shrink-0">{icon}</span>
    {isOpen && (
      <>
        <span>{label}</span>
        {badge && (
          <span className="ml-auto px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
            {badge}
          </span>
        )}
      </>
    )}
  </Link>
);

const MenuButton = ({
  icon,
  label,
  isExpanded,
  onClick,
  badge,
  isOpen,
}: MenuButtonProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
      isExpanded
        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    <span className="w-5 h-5 shrink-0">{icon}</span>
    {isOpen && (
      <>
        <span>{label}</span>
        {badge && (
          <span className="ml-auto px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
            {badge}
          </span>
        )}
        <span className="ml-auto text-gray-500 dark:text-gray-400">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </>
    )}
  </button>
);

function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({
    leads: true,
    campaigns: false,
    analytics: false,
    settings: false,
  });

  const toggleMenu = (menu: keyof ExpandedMenus) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={`transition-all duration-300 ${
        isOpen ? "w-64" : "w-20"
      } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto`}
      style={{
        height: "calc(100vh - 4rem)",
        position: "sticky",
        top: "4rem",
      }}
    >
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Dashboard */}
        <NavLink
          to="/"
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          isOpen={isOpen}
          isActive={isActive("/")}
        />

        {/* Leads Section */}
        <div>
          <MenuButton
            icon={<Users size={20} />}
            label="Leads"
            isExpanded={expandedMenus.leads}
            onClick={() => toggleMenu("leads")}
            isOpen={isOpen}
          />
          {isOpen && expandedMenus.leads && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/leads"
                icon={<ClipboardList size={20} />}
                label="All Leads"
                isOpen={isOpen}
                isActive={isActive("/leads")}
              />
              <NavLink
                to="/leads/new"
                icon={<Plus size={20} />}
                label="New Lead"
                isOpen={isOpen}
                isActive={isActive("/leads/new")}
              />
              <NavLink
                to="/leads/segments"
                icon={<Tag size={20} />}
                label="Segments"
                isOpen={isOpen}
                isActive={isActive("/leads/segments")}
              />
              <NavLink
                to="/leads/scoring"
                icon={<Star size={20} />}
                label="Lead Scoring"
                isOpen={isOpen}
                isActive={isActive("/leads/scoring")}
              />
            </div>
          )}
        </div>

        {/* Campaigns Section */}
        <div>
          <MenuButton
            icon={<Megaphone size={20} />}
            label="Campaigns"
            isExpanded={expandedMenus.campaigns}
            onClick={() => toggleMenu("campaigns")}
            badge={3}
            isOpen={isOpen}
          />
          {isOpen && expandedMenus.campaigns && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/campaigns"
                icon={<FileText size={20} />}
                label="All Campaigns"
                isOpen={isOpen}
                isActive={isActive("/campaigns")}
              />
              <NavLink
                to="/campaigns/new"
                icon={<Plus size={20} />}
                label="New Campaign"
                isOpen={isOpen}
                isActive={isActive("/campaigns/new")}
              />
              <NavLink
                to="/campaigns/draft"
                icon={<Save size={20} />}
                label="Drafts"
                isOpen={isOpen}
                isActive={isActive("/campaigns/draft")}
              />
              <NavLink
                to="/campaigns/performance"
                icon={<TrendingUp size={20} />}
                label="Performance"
                isOpen={isOpen}
                isActive={isActive("/campaigns/performance")}
              />
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div>
          <MenuButton
            icon={<BarChart2 size={20} />}
            label="Analytics"
            isExpanded={expandedMenus.analytics}
            onClick={() => toggleMenu("analytics")}
            isOpen={isOpen}
          />
          {isOpen && expandedMenus.analytics && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/analytics/overview"
                icon={<Target size={20} />}
                label="Overview"
                isOpen={isOpen}
                isActive={isActive("/analytics/overview")}
              />
              <NavLink
                to="/analytics/roi"
                icon={<DollarSign size={20} />}
                label="ROI"
                isOpen={isOpen}
                isActive={isActive("/analytics/roi")}
              />
              <NavLink
                to="/analytics/engagement"
                icon={<Smartphone size={20} />}
                label="Engagement"
                isOpen={isOpen}
                isActive={isActive("/analytics/engagement")}
              />
            </div>
          )}
        </div>

        {/* Users Management */}
        <NavLink
          to="/users"
          icon={<User size={20} />}
          label="Users"
          isOpen={isOpen}
          isActive={isActive("/users")}
        />

        {/* Settings Section */}
        <div>
          <MenuButton
            icon={<Settings size={20} />}
            label="Settings"
            isExpanded={expandedMenus.settings}
            onClick={() => toggleMenu("settings")}
            isOpen={isOpen}
          />
          {isOpen && expandedMenus.settings && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/settings/workspace"
                icon={<Building2 size={20} />}
                label="Workspace"
                isOpen={isOpen}
                isActive={isActive("/settings/workspace")}
              />
              <NavLink
                to="/settings/integrations"
                icon={<Link2 size={20} />}
                label="Integrations"
                isOpen={isOpen}
                isActive={isActive("/settings/integrations")}
              />
              <NavLink
                to="/settings/api"
                icon={<Key size={20} />}
                label="API Keys"
                isOpen={isOpen}
                isActive={isActive("/settings/api")}
              />
              <NavLink
                to="/settings/billing"
                icon={<CreditCard size={20} />}
                label="Billing"
                isOpen={isOpen}
                isActive={isActive("/settings/billing")}
              />
            </div>
          )}
        </div>
      </nav>

      {/* Quick Stats Section */}
      {isOpen && (
        <div className="p-4 mt-8 border-t border-gray-200 dark:border-gray-700">
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
        <div className="p-2 space-y-2 border-t border-gray-200 dark:border-gray-700 mt-8">
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
