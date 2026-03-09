import type { UserRole } from "@/types";

// Pages
import DashboardPage from "../pages/dashboardPage";
import UsersPage from "../pages/usersPage";
import LeadsPage from "../pages/leadsPage";
import OrganizationsPage from "../pages/organizationsPage";
import DealsPage from "../pages/dealsPage";
import TenantsPage from "../pages/tenantsPage";
import WorkflowsPage from "../pages/workflowsPage";
import AnalyticsPage from "../pages/analyticsPage";
import RolesPage from "../pages/rolesPage";
import TasksPage from "../pages/tasksPage";
import CampaignPage from "../pages/campaignPage";

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
  /** Legacy coarse-grained role guard (still used for super_admin-only routes) */
  allowedRoles?: UserRole[];
  /** Fine-grained permission guard — user must have ALL listed permissions */
  requiredPermissions?: string[];
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
    requiredPermissions: ["leads:read"],
  },
  {
    path: "/leads/:id",
    element: <LeadDetailsPage />,
    requiredPermissions: ["leads:read"],
  },
  {
    path: "/organizations",
    element: <OrganizationsPage />,
    requiredPermissions: ["organizations:read"],
  },
  {
    path: "/organizations/:id/leads",
    element: <OrganizationLeadsPage />,
    requiredPermissions: ["organizations:read"],
  },
  {
    path: "/deals",
    element: <DealsPage />,
    requiredPermissions: ["deals:read"],
  },
  {
    path: "/users",
    element: <UsersPage />,
    requiredPermissions: ["users:read"],
    unauthorizedFallback: "/dashboard",
  },
  {
    path: "/roles",
    element: <RolesPage />,
    requiredPermissions: ["roles:read"],
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
    requiredPermissions: ["leads:read"],
    unauthorizedFallback: "/dashboard",
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
    requiredPermissions: ["analytics:read"],
    unauthorizedFallback: "/dashboard",
  },
  {
    path: "/tasks",
    element: <TasksPage />,
    requiredPermissions: ["tasks:read"],
  },
  {
    path: "/campaigns",
    element: <CampaignPage />,
    requiredPermissions: ["campaigns:read"],
    unauthorizedFallback: "/dashboard",
  },
];
