import { Navigate, Route, Routes } from "react-router-dom";
import { useAppContext } from "@/hooks";
import { routeConfig } from "./routeConfig";
import type { RouteConfig } from "./routeConfig";
import { PageLoadingFallback } from "@/components/common/suspenseFallback";

import { Suspense } from "react";

interface ProtectedRouteProps {
  config: RouteConfig;
}

function ProtectedRoute({ config }: ProtectedRouteProps) {
  const { user } = useAppContext();
  const {
    allowedRoles,
    requiredPermissions,
    unauthorizedFallback = "/dashboard",
  } = config;

  // Super admins bypass all permission / role guards
  if (user?.role === "super_admin") {
    return <>{config.element}</>;
  }

  // Coarse role guard (for super_admin-exclusive routes like /tenants)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to={unauthorizedFallback} replace />;
    }
  }

  // Fine-grained permission guard
  if (requiredPermissions && requiredPermissions.length > 0) {
    const userPerms: string[] = user?.permissions ?? [];
    const hasAll = requiredPermissions.every((p) => userPerms.includes(p));
    if (!hasAll) {
      return <Navigate to={unauthorizedFallback} replace />;
    }
  }

  return <>{config.element}</>;
}

export function AppRouter() {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
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
    </Suspense>
  );
}
