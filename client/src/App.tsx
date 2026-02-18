import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/layout/layout";
import { AppProvider } from "./context";

// Page imports
import LoginPage from "./components/pages/loginPage";
import SignupPage from "./components/pages/signupPage";
import DashboardPage from "./components/pages/dashboardPage";
import UsersPage from "./components/pages/usersPage";

import "./app.css";

function App() {
  const [isAuthenticated] = useState(false);
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
    <AppProvider>
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
    </AppProvider>
  );
}

export default App;
