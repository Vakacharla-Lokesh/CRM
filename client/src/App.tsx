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
import { SocketProvider } from "./context/socketContext";

// Public pages
import LoginPage from "./pages/loginPage";
import SignupPage from "./pages/signupPage";
import LandingPage from "./pages/landingPage";
import ForgotPasswordPage from "./pages/forgotPasswordPage";
import ProductPage from "./pages/productPage";

// Styles
import "./App.css";
import { Toaster } from "./components/ui/sonner";

// tanstack query
import { localStoragePersister, queryClient } from "./queryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

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
          path="/product"
          element={<ProductPage />}
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
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: localStoragePersister,
        maxAge: 1000 * 60 * 60 * 24,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      <AppProvider>
        <OfflineProvider>
          <NotificationProvider>
            <SocketProvider>
              <ThemeProvider>
                <Toaster position="top-center" />
                <AppRoutes />
              </ThemeProvider>
            </SocketProvider>
          </NotificationProvider>
        </OfflineProvider>
      </AppProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
