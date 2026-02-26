import type { UserRole } from "@/types";

// Pages
import DashboardPage from "../pages/dashboardPage";
import UsersPage from "../pages/usersPage";
import LeadsPage from "../pages/leadsPage";
import OrganizationsPage from "../pages/organizationsPage";
import DealsPage from "../pages/dealsPage";
import TenantsPage from "../pages/tenantsPage";
import WorkflowsPage from "../pages/workflowsPage";

// lazy loading components
import { lazy } from "react";

// const LazyLoadedComponent = lazy(() => import("../components/common/lazyLoadedComponent"));
const OrganizationLeadsPage = lazy(
  () => import("../pages/organizationLeadsPage"),
);
const LeadDetailsPage = lazy(() => import("../pages/leadDetailsPage"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles?: UserRole[];
  unauthorizedFallback?: string;
}

export const routeConfig: RouteConfig[] = [
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/leads",
    element: <LeadsPage />,
    allowedRoles: ["user", "admin"],
  },
  {
    path: "/leads/:id",
    element: <LeadDetailsPage />,
    allowedRoles: ["user", "admin"],
  },
  {
    path: "/organizations",
    element: <OrganizationsPage />,
    allowedRoles: ["user", "admin"],
  },
  {
    path: "/organizations/:id/leads",
    element: <OrganizationLeadsPage />,
    allowedRoles: ["user", "admin"],
  },
  {
    path: "/deals",
    element: <DealsPage />,
    allowedRoles: ["user", "admin"],
  },
  {
    path: "/users",
    element: <UsersPage />,
    allowedRoles: ["admin", "super_admin"],
    unauthorizedFallback: "/dashboard",
  },
  {
    path: "/tenants",
    element: <TenantsPage />,
    allowedRoles: ["super_admin"],
    unauthorizedFallback: "/dashboard",
  },
  {
    path: "/tenants/:id",
    element: <UsersPage />,
    allowedRoles: ["super_admin"],
    unauthorizedFallback: "/dashboard",
  },
  {
    path: "/workflows",
    element: <WorkflowsPage />,
    allowedRoles: ["user", "admin"],
    unauthorizedFallback: "/dashboard",
  },
];
