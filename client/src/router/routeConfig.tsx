import type { UserRole } from "@/types";
import { lazy } from "react";

const DashboardPage = lazy(() => import("../pages/dashboardPage"));
const preloadDashboard = () => import("../pages/dashboardPage");

const UsersPage = lazy(() => import("../pages/usersPage"));
const preloadUsers = () => import("../pages/usersPage");

const LeadsPage = lazy(() => import("../pages/leadsPage"));
const preloadLeads = () => import("../pages/leadsPage");

const OrganizationsPage = lazy(() => import("../pages/organizationsPage"));
const preloadOrganizations = () => import("../pages/organizationsPage");

const DealsPage = lazy(() => import("../pages/dealsPage"));
const preloadDeals = () => import("../pages/dealsPage");

const TenantsPage = lazy(() => import("../pages/tenantsPage"));
const preloadTenants = () => import("../pages/tenantsPage");

const WorkflowsPage = lazy(() => import("../pages/workflowsPage"));
const preloadWorkflows = () => import("../pages/workflowsPage");

const AnalyticsPage = lazy(() => import("../pages/analyticsPage"));
const preloadAnalytics = () => import("../pages/analyticsPage");

const RolesPage = lazy(() => import("../pages/rolesPage"));
const preloadRoles = () => import("../pages/rolesPage");

const TasksPage = lazy(() => import("../pages/tasksPage"));
const preloadTasks = () => import("../pages/tasksPage");

const CampaignPage = lazy(() => import("../pages/campaignPage"));
const preloadCampaign = () => import("../pages/campaignPage");

const OrganizationLeadsPage = lazy(
  () => import("../pages/organizationLeadsPage"),
);
const LeadDetailsPage = lazy(() => import("../pages/leadDetailsPage"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  unauthorizedFallback?: string;
  preload?: () => Promise<unknown>;
}

export const routeConfig: RouteConfig[] = [
  {
    path: "/dashboard",
    element: <DashboardPage />,
    preload: preloadDashboard,
  },
  {
    path: "/leads",
    element: <LeadsPage />,
    requiredPermissions: ["leads:read"],
    preload: preloadLeads,
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
    preload: preloadOrganizations,
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
    preload: preloadDeals,
  },
  {
    path: "/users",
    element: <UsersPage />,
    requiredPermissions: ["users:read"],
    unauthorizedFallback: "/dashboard",
    preload: preloadUsers,
  },
  {
    path: "/roles",
    element: <RolesPage />,
    requiredPermissions: ["roles:read"],
    unauthorizedFallback: "/dashboard",
    preload: preloadRoles,
  },
  {
    path: "/tenants",
    element: <TenantsPage />,
    allowedRoles: ["super_admin"],
    unauthorizedFallback: "/dashboard",
    preload: preloadTenants,
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
    preload: preloadWorkflows,
  },
  {
    path: "/analytics",
    element: <AnalyticsPage />,
    requiredPermissions: ["analytics:read"],
    unauthorizedFallback: "/dashboard",
    preload: preloadAnalytics,
  },
  {
    path: "/tasks",
    element: <TasksPage />,
    requiredPermissions: ["tasks:read"],
    preload: preloadTasks,
  },
  {
    path: "/campaigns",
    element: <CampaignPage />,
    requiredPermissions: ["campaigns:read"],
    unauthorizedFallback: "/dashboard",
    preload: preloadCampaign,
  },
];
