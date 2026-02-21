import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout";
import { AppProvider, useAppContext } from "./context";
import { OfflineProvider } from "./context/OfflineContext";

import { lazy, Suspense } from "react";
import { PageLoadingFallback } from "./components/common/suspenseFallback";

const LoginPage = lazy(() => import("./pages/loginPage"));
const SignupPage = lazy(() => import("./pages/signupPage"));
const DashboardPage = lazy(() => import("./pages/dashboardPage"));
const UsersPage = lazy(() => import("./pages/usersPage"));
const LeadsPage = lazy(() => import("./pages/leadsPage"));
const OrganizationsPage = lazy(() => import("./pages/organizationsPage"));
const DealsPage = lazy(() => import("./pages/dealsPage"));
const TenantsPage = lazy(() => import("./pages/tenantsPage"));

import "./app.css";
import { ThemeProvider } from "./components/common/theme-provider";
import LeadDetailsPage from "./pages/leadDetailsPage";
import LandingPage from "./pages/landingPage";
import OrganizationLeadsPage from "./pages/organizationLeadsPage";

function AppRoutes() {
  const { isAuthenticated, loading } = useAppContext();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

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
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Suspense fallback={<PageLoadingFallback />}>
                <LoginPage />
              </Suspense>
            ) : (
              <Navigate
                to="/dashboard"
                replace
              />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <Suspense fallback={<PageLoadingFallback />}>
                <SignupPage />
              </Suspense>
            ) : (
              <Navigate
                to="/dashboard"
                replace
              />
            )
          }
        />

        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <Layout
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
              >
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    <Route
                      path="/dashboard"
                      element={<DashboardPage />}
                    />
                    <Route
                      path="/"
                      element={
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      }
                    />
                    <Route
                      path="/leads"
                      element={<LeadsPage />}
                    />
                    <Route
                      path="/leads/:id"
                      element={<LeadDetailsPage />}
                    />
                    <Route
                      path="/organizations"
                      element={<OrganizationsPage />}
                    />
                    <Route
                      path="/organizations/:id/leads"
                      element={<OrganizationLeadsPage />}
                    />
                    <Route
                      path="/deals"
                      element={<DealsPage />}
                    />
                    <Route
                      path="/users"
                      element={<UsersPage />}
                    />
                    <Route
                      path="/tenants"
                      element={<TenantsPage />}
                    />
                    <Route
                      path="/tenants/:id"
                      element={<UsersPage />}
                    />
                    <Route
                      path="*"
                      element={
                        <Navigate
                          to="/dashboard"
                          replace
                        />
                      }
                    />
                  </Routes>
                </Suspense>
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
      <OfflineProvider>
        <ThemeProvider
          defaultTheme="dark"
          storageKey="vite-ui-theme"
        >
          <AppRoutes />
        </ThemeProvider>
      </OfflineProvider>
    </AppProvider>
  );
}

export default App;
