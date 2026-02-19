import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BarChart2, Search } from "lucide-react";
import type {
  ConnectivityStatus,
  NavbarProps,
} from "@/types/interfaces/layout/navbar.interfaces";

function Navbar({
  onToggleSidebar,
  isSidebarOpen: _isSidebarOpen,
  onToggleRightPanel,
  isRightPanelOpen,
}: NavbarProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, _setOfflineQueueCount] = useState(0);
  const [_connectivityStatus, _setConnectivityStatus] =
    useState<ConnectivityStatus>({
      ws: false,
      sse: false,
      longPoll: false,
      shortPoll: false,
    });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode") || "false");
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("App is back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("App is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    const htmlElement = document.documentElement;
    if (newDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(newDarkMode));
  };

  const handleSync = async () => {
    console.log("Sync triggered");
  };

  const handleStressTest = () => {
    console.log("Stress test triggered");
  };

  const handleDiagnostics = () => {
    console.log("Diagnostics triggered");
  };

  const handleLogout = () => {
    console.log("Logout triggered");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 h-16 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
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
          <div className="hidden md:flex md:items-center gap-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>

          <button
            onClick={handleSync}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg shadow transition-colors ${
              isOnline
                ? "text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                : "text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600"
            }`}
            title={
              isOnline
                ? "All synced"
                : `${offlineQueueCount} items pending sync`
            }
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-green-300" : "bg-yellow-300"
              } animate-pulse`}
            />
            <span className="hidden sm:inline">
              {isOnline ? "Synced" : "Syncing"}
            </span>
            {offlineQueueCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold">
                {offlineQueueCount}
              </span>
            )}
          </button>

          <button
            onClick={handleStressTest}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
            title="Run stress test (1000 leads)"
          >
            <BarChart2 size={16} />
            <span className="hidden xl:inline">Stress Test</span>
          </button>

          <button
            onClick={handleDiagnostics}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg shadow transition-colors"
            title="View event loop diagnostics"
          >
            <Search size={16} />
            <span className="hidden xl:inline">Diagnostics</span>
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                />
              </svg>
            )}
          </button>

          <button
            onClick={() => onToggleRightPanel && onToggleRightPanel()}
            className={`p-2 rounded-lg transition-colors ${
              isRightPanelOpen
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            aria-label="Toggle monitoring panel"
            title="Toggle monitoring panel"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </button>

          <div className="relative group">
            <button
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

            <div className="absolute right-0 w-48 mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  user@example.com
                </p>
              </div>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Profile
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                Settings
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-gray-200 dark:border-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
