import { Navigate, Route, Routes } from "react-router-dom";
import { useAppContext } from "@/hooks";
import { routeConfig } from "./routeConfig";
import type { RouteConfig } from "./routeConfig";

interface ProtectedRouteProps {
  config: RouteConfig;
}

function ProtectedRoute({ config }: ProtectedRouteProps) {
  const { user } = useAppContext();
  const { allowedRoles, unauthorizedFallback = "/dashboard" } = config;

  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{config.element}</>;
  }

  if (user && allowedRoles.includes(user.role)) {
    return <>{config.element}</>;
  }

  return (
    <Navigate
      to={unauthorizedFallback}
      replace
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      {/* Default redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* Permission-based routes */}
      {routeConfig.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<ProtectedRoute config={route} />}
        />
      ))}

      {/* Catch-all */}
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
  );
}
