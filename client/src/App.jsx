import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/layout.jsx";

// Page imports
import LoginPage from "./components/pages/loginPage.jsx";
import SignupPage from "./components/pages/signupPage.jsx";
import DashboardPage from "./components/pages/dashboardPage.jsx";
import UsersPage from "./components/pages/usersPage.jsx";

import "./app.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
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

  return (
    <Router>
      <Routes>
        {/* Auth Routes - without sidebar/navbar */}
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/signup"
          element={<SignupPage />}
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
                    path="/"
                    element={<DashboardPage />}
                  />
                  <Route
                    path="/users"
                    element={<UsersPage />}
                  />
                  <Route
                    path="*"
                    element={
                      <Navigate
                        to="/"
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
            path="/"
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

export default App;
