import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Navbar({
  onToggleSidebar,
  isSidebarOpen,
  onToggleRightPanel,
  isRightPanelOpen,
}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [connectivityStatus, setConnectivityStatus] = useState({
    ws: false,
    sse: false,
    longPoll: false,
    shortPoll: false,
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem("darkMode") || "false");
  });

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
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
    // Sync logic will be implemented in Phase 4 with custom hooks
  };

  const handleStressTest = () => {
    console.log("Stress test triggered");
    // Stress test logic will be implemented in Phase 4
  };

  const handleDiagnostics = () => {
    console.log("Diagnostics triggered");
    // Show event loop diagnostics
  };

  const handleLogout = () => {
    console.log("Logout triggered");
    // Logout logic will be implemented later
  };

  return (
    <nav className="fixed top-0 left-0 z-50 h-16 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      <div className="mx-auto max-w-full flex items-center justify-between px-4 h-full">
        {/* Left Section - Logo & Menu Toggle */}
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
              src="/public/crm.png"
              alt="Campaign Flux Logo"
              className="h-7"
            />
            <span className="text-lg font-semibold hidden sm:inline">
              Campaign Flux
            </span>
          </Link>
        </div>

        {/* Right Section - Status & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connectivity Status */}
          <div className="hidden md:flex md:items-center gap-1 px-3 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>{isOnline ? "Online" : "Offline"}</span>
          </div>

          {/* Sync Button with Offline Count */}
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

          {/* Stress Test Button */}
          <button
            onClick={handleStressTest}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow transition-colors"
            title="Run stress test (1000 leads)"
          >
            <span>📊</span>
            <span className="hidden xl:inline">Stress Test</span>
          </button>

          {/* Diagnostics Button */}
          <button
            onClick={handleDiagnostics}
            className="hidden lg:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 rounded-lg shadow transition-colors"
            title="View event loop diagnostics"
          >
            <span>🔍</span>
            <span className="hidden xl:inline">Diagnostics</span>
          </button>

          {/* Dark Mode Toggle */}
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
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm.464-4.536a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm-2.828-2.828a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM13 11a1 1 0 110-2h1a1 1 0 110 2h-1zm4 0a1 1 0 110-2h1a1 1 0 110 2h-1zM9 18a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1zm4 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Right Panel Toggle */}
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

          {/* User Menu Dropdown */}
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

            {/* Dropdown Menu */}
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
