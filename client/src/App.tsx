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
import { useAuth } from "@/hooks";
import { useAppContext } from "@/hooks";
import { OfflineProvider } from "./context/offlineContext";
import { NotificationProvider } from "./context/notificationContext";
import { ThemeProvider } from "./components/common/themeProvider";

// Public pages
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import LandingPage from "./pages/landingPage";
import ForgotPasswordPage from "./pages/forgotPasswordPage";

// Styles
import "./App.css";
import { Toaster } from "./components/ui/sonner";

// tanstack query
import { queryClient } from "./queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function AppRoutes() {
  const { isLoggedIn } = useAuth();
  const { loading } = useAppContext();

  // Show loading spinner while the initial auth state is being restored
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            !isLoggedIn() ? (
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
            !isLoggedIn() ? (
              <SignupPage />
            ) : (
              <Navigate
                to="/dashboard"
                replace
              />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />

        {/* Authenticated routes – delegated to AppRouter */}
        {isLoggedIn() ? (
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

      {/* TanStack Query DevTools — only visible in development, tree-shaken in production */}
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-left"
      />
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <OfflineProvider>
          <NotificationProvider>
            <ThemeProvider>
              <Toaster position="top-center" />
              <AppRoutes />
            </ThemeProvider>
          </NotificationProvider>
        </OfflineProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
