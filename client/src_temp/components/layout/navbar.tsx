import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { NavbarProps } from "@/types/interfaces/layout/navbar.interfaces";
import { useAppContext } from "@/hooks/";
import { ThemeControls } from "../common/themeToggle";
import { SettingsModal } from "../modals";

function Navbar({
  onToggleSidebar,
  isUserMenuOpen,
  setIsUserMenuOpen,
}: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  const handleSettingsClick = () => {
    setIsUserMenuOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <nav className="fixed top-0 left-0 z-50 h-16 w-full border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="mx-auto max-w-full flex items-center justify-between px-4 h-full">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/crm.png"
              alt="Campaign Flux Logo"
              className="h-7"
            />
            <span className="text-lg font-semibold hidden sm:inline">
              Campaign Flux
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeControls />
          <div>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div
              className={`absolute right-5 w-48 mt-2 bg-white dark:bg-[#1e1b18] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 ${isUserMenuOpen ? "opacity-100 visible" : ""}`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.userEmail || "guest@example.com"}
                </p>
              </div>
              {/* <button
                onClick={() => console.log("Navigate to profile")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Profile
              </button> */}
              <button
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg transition-colors border-t border-gray-200 dark:border-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </nav>
  );
}

export default Navbar;
