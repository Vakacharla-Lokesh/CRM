import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
}

interface ExpandedMenus {
  leads: boolean;
  campaigns: boolean;
  analytics: boolean;
  settings: boolean;
}

interface NavLinkProps {
  to: string;
  icon: string;
  label: string;
  badge?: number | string;
  onClick?: () => void;
}

interface MenuButtonProps {
  icon: string;
  label: string;
  isExpanded: boolean;
  onClick: () => void;
  badge?: number | string;
}

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

  const NavLink = ({ to, icon, label, badge, onClick }: NavLinkProps) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        isActive(to)
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <span className="text-lg">{icon}</span>
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

  const MenuButton = ({ icon, label, isExpanded, onClick, badge }: MenuButtonProps) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
        isExpanded
          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      <span className="text-lg">{icon}</span>
      {isOpen && (
        <>
          <span>{label}</span>
          {badge && (
            <span className="ml-auto px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
              {badge}
            </span>
          )}
          <span className="ml-auto text-gray-500 dark:text-gray-400">
            {isExpanded ? "▼" : "▶"}
          </span>
        </>
      )}
    </button>
  );

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
          icon="📊"
          label="Dashboard"
        />

        {/* Leads Section */}
        <div>
          <MenuButton
            icon="👥"
            label="Leads"
            isExpanded={expandedMenus.leads}
            onClick={() => toggleMenu("leads")}
          />
          {isOpen && expandedMenus.leads && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/leads"
                icon="📋"
                label="All Leads"
              />
              <NavLink
                to="/leads/new"
                icon="➕"
                label="New Lead"
              />
              <NavLink
                to="/leads/segments"
                icon="🏷️"
                label="Segments"
              />
              <NavLink
                to="/leads/scoring"
                icon="⭐"
                label="Lead Scoring"
              />
            </div>
          )}
        </div>

        {/* Campaigns Section */}
        <div>
          <MenuButton
            icon="📢"
            label="Campaigns"
            isExpanded={expandedMenus.campaigns}
            onClick={() => toggleMenu("campaigns")}
            badge={3}
          />
          {isOpen && expandedMenus.campaigns && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/campaigns"
                icon="📄"
                label="All Campaigns"
              />
              <NavLink
                to="/campaigns/new"
                icon="➕"
                label="New Campaign"
              />
              <NavLink
                to="/campaigns/draft"
                icon="💾"
                label="Drafts"
              />
              <NavLink
                to="/campaigns/performance"
                icon="📈"
                label="Performance"
              />
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div>
          <MenuButton
            icon="📊"
            label="Analytics"
            isExpanded={expandedMenus.analytics}
            onClick={() => toggleMenu("analytics")}
          />
          {isOpen && expandedMenus.analytics && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/analytics/overview"
                icon="🎯"
                label="Overview"
              />
              <NavLink
                to="/analytics/roi"
                icon="💰"
                label="ROI"
              />
              <NavLink
                to="/analytics/engagement"
                icon="📲"
                label="Engagement"
              />
            </div>
          )}
        </div>

        {/* Users Management */}
        <NavLink
          to="/users"
          icon="👤"
          label="Users"
        />

        {/* Settings Section */}
        <div>
          <MenuButton
            icon="⚙️"
            label="Settings"
            isExpanded={expandedMenus.settings}
            onClick={() => toggleMenu("settings")}
          />
          {isOpen && expandedMenus.settings && (
            <div className="ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700">
              <NavLink
                to="/settings/workspace"
                icon="🏢"
                label="Workspace"
              />
              <NavLink
                to="/settings/integrations"
                icon="🔗"
                label="Integrations"
              />
              <NavLink
                to="/settings/api"
                icon="🔑"
                label="API Keys"
              />
              <NavLink
                to="/settings/billing"
                icon="💳"
                label="Billing"
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
