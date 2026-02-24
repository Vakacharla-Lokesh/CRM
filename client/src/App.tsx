import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout";
import { AppRouter } from "./router/router";

// Context and hooks
import { AppProvider } from "./context";
import { useAppContext } from "@/hooks";
import { OfflineProvider } from "./context/offlineContext";
import { ThemeProvider } from "./components/common/themeProvider";

// Public pages
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import LandingPage from "./pages/landingPage";

// Styles
import "./App.css";

function AppRoutes() {
  const { isAuthenticated, loading } = useAppContext();

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
              <LoginPage />
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
              <SignupPage />
            ) : (
              <Navigate
                to="/dashboard"
                replace
              />
            )
          }
        />

        {/* Authenticated routes – delegated to AppRouter */}
        {isAuthenticated ? (
          <Route
            path="/*"
            element={
              <Layout>
                <AppRouter />
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
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </OfflineProvider>
    </AppProvider>
  );
}

export default App;
