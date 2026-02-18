import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/layout";
import { AppProvider, useAppContext } from "./context";

// Page imports
import LoginPage from "./components/pages/loginPage";
import SignupPage from "./components/pages/signupPage";
import DashboardPage from "./components/pages/dashboardPage";
import UsersPage from "./components/pages/usersPage";

import "./app.css";

function AppRoutes() {
  const { isAuthenticated, loading } = useAppContext();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for dark mode preference
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Update document class and localStorage when dark mode changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDarkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes - without sidebar/navbar */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/home" replace />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupPage /> : <Navigate to="/home" replace />}
        />

        {/* Protected Routes - with Layout */}
        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <Layout
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
              >
                <Routes>
                  <Route
                    path="/home"
                    element={<DashboardPage />}
                  />
                  <Route
                    path="/"
                    element={<Navigate to="/home" replace />}
                  />
                  <Route
                    path="/users"
                    element={<UsersPage />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/home"
                        replace
                      />
                    }
                  />
                </Routes>
              </Layout>
            }
          />
        ) : (
          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />
        )}
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}

export default App;
