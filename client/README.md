# Campaign Flux — Client

**React 19 + TypeScript frontend** for the Campaign Flux CRM platform.

This document provides complete documentation for the frontend architecture, including folder structure, custom hooks, context providers, component hierarchy, data flow patterns, and the offline-sync lifecycle.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Component Hierarchy](#component-hierarchy)
- [Context Providers](#context-providers)
- [Custom Hooks Reference](#custom-hooks-reference)
  - [Utility Hooks](#utility-hooks)
  - [Data Hooks](#data-hooks)
  - [Offline Hooks](#offline-hooks)
  - [Analytics Hooks](#analytics-hooks)
- [Services Layer](#services-layer)
- [Application Flow](#application-flow)
  - [Bootstrap](#1-bootstrap)
  - [Auth Lifecycle](#2-auth-lifecycle)
  - [Data Flow Pattern](#3-data-flow-pattern)
  - [Offline Sync Flow](#4-offline--sync-flow)
  - [Analytics Flow](#5-analytics-flow)
- [Pages](#pages)
- [State Management](#state-management)
- [Form Handling](#form-handling)
- [UI Components](#ui-components)
- [Key Packages](#key-packages)
- [Development](#development)
- [Build & Deployment](#build--deployment)

---

## Tech Stack

| Layer               | Technology       | Version | Purpose                                       |
| ------------------- | ---------------- | ------- | --------------------------------------------- |
| **Framework**       | React            | 19      | UI library with hooks & concurrent features   |
| **Language**        | TypeScript       | 5.7     | Type safety and developer experience          |
| **Build Tool**      | Vite             | 7       | Lightning-fast dev server & bundler           |
| **Routing**         | React Router     | 7       | Client-side routing with data loading         |
| **Styling**         | Tailwind CSS     | 4       | Utility-first CSS framework                   |
| **UI Library**      | shadcn/ui        | Latest  | Accessible component library (Radix UI)       |
| **Data Tables**     | TanStack Table   | 8       | Headless table library with sorting/filtering |
| **Server State**    | TanStack Query   | 5       | Data fetching, caching, and synchronization   |
| **Charts**          | Recharts         | 2       | Composable charting library                   |
| **Icons**           | Lucide React     | Latest  | Beautiful & consistent icon set               |
| **Notifications**   | Sonner           | Latest  | Toast notification system                     |
| **Forms**           | Custom Hooks     | -       | `useForm` with Zod validation                 |
| **Offline Storage** | IndexedDB        | Native  | Browser database for offline queue            |
| **HTTP Client**     | Axios            | 1.7     | Promise-based HTTP client                     |
| **WebSockets**      | Socket.io Client | 4.8     | Real-time bidirectional communication         |

---

## Folder Structure

```
client/
├── public/
│   └── crm.png                # App logo
│
├── src/
│   ├── main.tsx              # App entry point - renders root with providers
│   ├── App.tsx               # Root component - defines all routes
│   │
│   ├── components/           # React components (organized by feature)
│   │   ├── common/           # Shared UI components
│   │   │   ├── dataTable.tsx           # Generic data table wrapper
│   │   │   ├── confirmDialog.tsx       # Confirmation modal
│   │   │   ├── statCard.tsx            # Dashboard metric card
│   │   │   ├── loadingSpinner.tsx      # Loading indicator
│   │   │   ├── errorBoundary.tsx       # Error boundary
│   │   │   ├── themeProvider.tsx       # Theme context provider
│   │   │   ├── emailExportDialogBox.tsx # Email export dialog
│   │   │   └── ProtectedByPermission.tsx # Permission-based rendering
│   │   │
│   │   ├── dashboard/        # Dashboard-specific components
│   │   │   ├── skeletonRows.tsx        # Loading skeleton
│   │   │   ├── emptyState.tsx          # Empty state placeholder
│   │   │   ├── progressRow.tsx         # Progress indicator
│   │   │   └── dashboardStats.tsx      # Stats widget
│   │   │
│   │   ├── layout/           # Layout components
│   │   │   ├── sidebar.tsx             # Main navigation sidebar
│   │   │   ├── header.tsx              # Top header bar
│   │   │   ├── layout.tsx              # Main layout wrapper
│   │   │   └── rightPanel.tsx          # Activity monitoring panel
│   │   │
│   │   ├── leads/            # Lead management components
│   │   │   ├── leadColumns.tsx         # Table column definitions
│   │   │   ├── leadStatistics.tsx      # Lead stats widget
│   │   │   ├── leadDetailTabs.tsx      # Detail page tabs
│   │   │   ├── tabs/                   # Tab content components
│   │   │   │   ├── callsTab.tsx
│   │   │   │   ├── commentsTab.tsx
│   │   │   │   ├── attachmentsTab.tsx
│   │   │   │   └── activityTab.tsx
│   │   │   └── ...
│   │   │
│   │   ├── organizations/    # Organization components
│   │   │   ├── organizationColumns.tsx
│   │   │   ├── organizationDetail.tsx
│   │   │   └── ...
│   │   │
│   │   ├── users/            # User management components
│   │   │   ├── userColumns.tsx
│   │   │   ├── userTable.tsx
│   │   │   └── ...
│   │   │
│   │   ├── tenants/          # Tenant management (super admin only)
│   │   │   ├── tenantColumns.tsx
│   │   │   ├── tenantTable.tsx
│   │   │   └── ...
│   │   │
│   │   ├── modals/           # Modal dialogs
│   │   │   ├── leadModal.tsx           # Create/edit lead
│   │   │   ├── dealModal.tsx           # Create/edit deal
│   │   │   ├── organizationModal.tsx   # Create/edit organization
│   │   │   ├── settingsModal.tsx       # User settings
│   │   │   ├── form-fields/            # Reusable form fields
│   │   │   ├── sections/               # Modal sections
│   │   │   └── shared/                 # Shared modal components
│   │   │
│   │   ├── bulk/             # Bulk operation components
│   │   │   ├── BulkActionBar.tsx       # Action bar for bulk ops
│   │   │   └── BulkImportDialog.tsx    # CSV import dialog
│   │   │
│   │   └── ui/               # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── table.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── tooltip.tsx
│   │       ├── sonner.tsx              # Toast notifications
│   │       └── ...                     # 30+ UI primitives
│   │
│   ├── context/              # React Context providers
│   │   ├── AppContext.tsx              # Auth state, user, online status
│   │   ├── OfflineContext.tsx          # Offline queue provider
│   │   ├── NotificationContext.tsx     # Notification system
│   │   ├── SocketContext.tsx           # WebSocket connection
│   │   ├── useOffline.ts               # Offline context hook
│   │   └── index.ts                    # Barrel export
│   │
│   ├── hooks/                # Custom React hooks (30+ hooks)
│   │   ├── useAuth.ts                  # Authentication hook
│   │   ├── useAppContext.ts            # App context consumer
│   │   ├── useDebounce.ts              # Debounce input values
│   │   ├── useForm.ts                  # Form state management
│   │   ├── useIndexedDB.ts             # IndexedDB operations
│   │   ├── useLocalStorage.ts          # localStorage wrapper
│   │   ├── useSocket.ts                # WebSocket hook
│   │   ├── useNotifications.ts         # Notification hook
│   │   │
│   │   ├── leads/                      # Lead-related hooks
│   │   │   ├── useLeadData.ts          # Lead CRUD operations
│   │   │   ├── useLeadActivityData.ts  # Activity timeline
│   │   │   └── tabs/                   # Tab-specific hooks
│   │   │       ├── useCallData.ts
│   │   │       ├── useCommentData.ts
│   │   │       └── useAttachmentData.ts
│   │   │
│   │   ├── deals/
│   │   │   └── useDealData.ts          # Deal CRUD operations
│   │   │
│   │   ├── organizations/
│   │   │   └── useOrganizationData.ts  # Organization CRUD
│   │   │
│   │   ├── users/
│   │   │   ├── useUserData.ts          # User management
│   │   │   ├── useUsersStats.ts        # User statistics
│   │   │   └── useUserAnalyticsData.ts # User-specific analytics
│   │   │
│   │   ├── tenants/
│   │   │   ├── useTenantData.ts        # Tenant management
│   │   │   └── useTenantsStats.ts      # Tenant statistics
│   │   │
│   │   ├── analytics/                  # Analytics hooks
│   │   │   ├── useDashboardStats.ts    # Dashboard metrics
│   │   │   └── useAnalyticsData.ts     # Detailed analytics
│   │   │
│   │   ├── useOfflineManager.ts        # Core offline sync logic
│   │   ├── useRoles.ts                 # Role management hooks
│   │   ├── usePermissions.ts           # Permission checking hooks
│   │   ├── useWorkflowData.ts          # Workflow management
│   │   └── index.ts                    # Barrel export
│   │
│   ├── pages/                # Route pages (one per route)
│   │   ├── landingPage.tsx             # Public landing page
│   │   ├── loginPage.tsx               # Login form
│   │   ├── signupPage.tsx              # Registration form
│   │   ├── forgotPasswordPage.tsx      # Password reset request
│   │   ├── dashboardPage.tsx           # Main dashboard
│   │   ├── leadsPage.tsx               # Lead list view
│   │   ├── leadDetailPage.tsx          # Lead detail view
│   │   ├── dealsPage.tsx               # Deal list view
│   │   ├── dealDetailPage.tsx          # Deal detail view
│   │   ├── organizationsPage.tsx       # Organization list
│   │   ├── organizationDetailPage.tsx  # Organization detail
│   │   ├── usersPage.tsx               # User management
│   │   ├── tenantsPage.tsx             # Tenant management (super admin)
│   │   ├── rolesPage.tsx               # Role management
│   │   ├── analyticsPage.tsx           # Analytics dashboard
│   │   └── settingsPage.tsx            # User settings
│   │
│   ├── services/             # API client layer
│   │   ├── api/              # API modules
│   │   │   ├── core.ts                 # Axios instance, interceptors
│   │   │   ├── auth.api.ts             # Auth endpoints
│   │   │   ├── leads.api.ts            # Lead endpoints
│   │   │   ├── deals.api.ts            # Deal endpoints
│   │   │   ├── organizations.api.ts    # Organization endpoints
│   │   │   ├── users.api.ts            # User endpoints
│   │   │   ├── tenants.api.ts          # Tenant endpoints
│   │   │   ├── calls.api.ts            # Call endpoints
│   │   │   ├── comments.api.ts         # Comment endpoints
│   │   │   ├── attachments.api.ts      # Attachment endpoints
│   │   │   ├── analytics.api.ts        # Analytics endpoints
│   │   │   ├── bulk.api.ts             # Bulk operation endpoints
│   │   │   ├── search.api.ts           # Search endpoints
│   │   │   ├── export.api.ts           # Export endpoints
│   │   │   ├── leadActivities.api.ts   # Lead activity endpoints
│   │   │   ├── userAnalytics.api.ts    # User analytics endpoints
│   │   │   ├── roles.api.ts            # Role endpoints
│   │   │   └── index.ts                # Barrel export
│   │   ├── exportService.ts            # CSV export logic
│   │   ├── index.ts                    # Service exports
│   │   └── ...
│   │
│   ├── types/                # TypeScript types & interfaces
│   │   ├── index.ts                    # Main type exports
│   │   ├── auth.ts                     # Auth-related types
│   │   ├── lead.ts                     # Lead types
│   │   ├── deal.ts                     # Deal types
│   │   ├── organization.ts             # Organization types
│   │   ├── user.ts                     # User types
│   │   ├── tenant.ts                   # Tenant types
│   │   ├── constants/                  # Constant enums & values
│   │   │   ├── landingPage.ts
│   │   │   └── ...
│   │   └── interfaces/                 # Form interfaces
│   │       └── form-interfaces/
│   │           ├── lead.form.interfaces.ts
│   │           ├── deal.form.interfaces.ts
│   │           └── ...
│   │
│   ├── utils/                # Utility functions
│   │   ├── formValidators.ts           # Zod form schemas
│   │   ├── dateUtils.ts                # Date formatting
│   │   ├── exportUtils.ts              # Export helpers
│   │   └── ...
│   │
│   ├── offline/              # Offline sync utilities
│   │   ├── routeResolver.ts            # Map actions to bulk routes
│   │   └── ...
│   │
│   ├── router/               # Routing configuration
│   │   └── router.tsx                  # Protected route wrapper
│   │
│   ├── queryClient.ts        # TanStack Query configuration
│   ├── App.css               # Global styles
│   └── index.css             # Tailwind directives
│
├── index.html                # HTML entry point
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript configuration
├── tsconfig.node.json        # TypeScript config for Vite
├── vite.config.ts            # Vite build configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── components.json           # shadcn/ui configuration
├── eslint.config.js          # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                 # This file
```

---

## Component Hierarchy

```
App (Router)
│
├── AppProvider (Auth context)
│   ├── OfflineProvider (Offline queue)
│   │   ├── NotificationProvider (Notifications)
│   │   │   ├── SocketProvider (WebSocket)
│   │   │   │   ├── ThemeProvider (Theme state)
│   │   │   │   │   ├── PersistQueryClientProvider (React Query)
│   │   │   │   │   │   │
│   │   │   │   │   │   ├── Public Routes (/, /login, /signup, /forgot-password)
│   │   │   │   │   │   │   ├── LandingPage
│   │   │   │   │   │   │   ├── LoginPage
│   │   │   │   │   │   │   ├── SignupPage
│   │   │   │   │   │   │   └── ForgotPasswordPage
│   │   │   │   │   │   │
│   │   │   │   │   │   └── Protected Routes (require auth)
│   │   │   │   │   │       ├── Layout
│   │   │   │   │   │       │   ├── Sidebar
│   │   │   │   │   │       │   ├── Header
│   │   │   │   │   │       │   ├── RightPanel (monitoring)
│   │   │   │   │   │       │   └── Outlet (page content)
│   │   │   │   │   │       │
│   │   │   │   │   │       ├── DashboardPage
│   │   │   │   │   │       │   ├── DashboardStats
│   │   │   │   │   │       │   ├── StatCard (×4)
│   │   │   │   │   │       │   ├── Charts (Recharts)
│   │   │   │   │   │       │   └── Activity Feed
│   │   │   │   │   │       │
│   │   │   │   │   │       ├── LeadsPage
│   │   │   │   │   │       │   ├── LeadStatistics
│   │   │   │   │   │       │   ├── DataTable (TanStack Table)
│   │   │   │   │   │       │   │   ├── leadColumns
│   │   │   │   │   │       │   │   └── Row Actions
│   │   │   │   │   │       │   ├── BulkActionBar
│   │   │   │   │   │       │   ├── LeadModal (create/edit)
│   │   │   │   │   │       │   └── ConfirmDialog (delete)
│   │   │   │   │   │       │
│   │   │   │   │   │       ├── LeadDetailPage
│   │   │   │   │   │       │   ├── Lead Header
│   │   │   │   │   │       │   └── Tabs
│   │   │   │   │   │       │       ├── CallsTab
│   │   │   │   │   │       │       ├── CommentsTab
│   │   │   │   │   │       │       ├── AttachmentsTab
│   │   │   │   │   │       │       └── ActivityTab
│   │   │   │   │   │       │
│   │   │   │   │   │       ├── DealsPage
│   │   │   │   │   │       ├── DealDetailPage
│   │   │   │   │   │       ├── OrganizationsPage
│   │   │   │   │   │       ├── OrganizationDetailPage
│   │   │   │   │   │       ├── UsersPage (admin/super_admin)
│   │   │   │   │   │       ├── TenantsPage (super_admin only)
│   │   │   │   │   │       ├── RolesPage (admin/super_admin)
│   │   │   │   │   │       ├── AnalyticsPage
│   │   │   │   │   │       └── SettingsPage
│   │   │   │   │   │
│   │   │   │   │   └── Toaster (sonner notifications)
```

---

## Context Providers

### 1. AppContext (`useAppContext`)

**Location**: `src/context/AppContext.tsx`

**Purpose**: Manages global auth state, user session, and online status.

**State**:

```typescript
{
  user: User | null; // Current authenticated user
  token: string | null; // JWT access token
  isAuthenticated: boolean; // Computed: !!(user && token)
  isOnline: boolean; // navigator.onLine status
  loading: boolean; // True while hydrating from localStorage
}
```

**Methods**:

```typescript
login(email: string, password: string): Promise<AuthResponse>
signup(userData: SignupDTO): Promise<AuthResponse>
logout(): Promise<void>
updateUser(user: Partial<User>): void
refreshToken(): Promise<string>
```

**Lifecycle**:

1. On mount: reads `auth_token` and `user_data` from `localStorage`
2. Hydrates state and sets `loading = false`
3. Listens to `online/offline` window events → updates `isOnline`
4. Listens to `auth:logout` custom event → clears session (fired by API interceptor on 401)

**Usage**:

```typescript
const { user, isAuthenticated, login, logout } = useAppContext();
```

---

### 2. OfflineContext (`useOffline`)

**Location**: `src/context/OfflineContext.tsx`

**Purpose**: Wraps `useOfflineManager` hook and provides offline queue API to all components.

**State**:

```typescript
{
  queue: OfflineRequest[];        // Pending requests
  isSyncing: boolean;             // True during sync
  isOnline: boolean;              // Network status
  isOfflineModeEnabled: boolean;  // Manual offline toggle
  lastSyncTime: Date | null;      // Last successful sync timestamp
}
```

**Methods**:

```typescript
addToQueue(request: OfflineRequestInput): string  // Returns idempotencyKey
removeFromQueue(id: string): void
retryRequest(id: string): void
clearQueue(): void
syncQueue(): Promise<void>
getStats(): { pending: number; failed: number }
toggleOfflineMode(): void
```

**Usage**:

```typescript
const { isOnline, addToQueue, syncQueue } = useOffline();

// Queue a request when offline
if (!isOnline) {
  const idempotencyKey = addToQueue({
    url: "/api/leads",
    method: "POST",
    body: leadData,
    entityType: "leads",
    operationType: "create",
  });
}
```

---

### 3. NotificationContext

**Location**: `src/context/NotificationContext.tsx`

**Purpose**: Manages in-app notifications (non-toast).

**State**:

```typescript
{
  notifications: Notification[];
  unreadCount: number;
}
```

**Methods**:

```typescript
addNotification(notification: Notification): void
markAsRead(id: string): void
markAllAsRead(): void
clearNotifications(): void
```

---

### 4. SocketContext

**Location**: `src/context/SocketContext.tsx`

**Purpose**: Manages WebSocket connection for real-time updates.

**State**:

```typescript
{
  socket: Socket | null;
  connected: boolean;
}
```

**Events Listened**:

- `notification` → Add to NotificationContext
- `lead:updated` → Refresh lead data
- `deal:updated` → Refresh deal data
- `user:updated` → Update user state

**Usage**:

```typescript
const { socket, connected } = useSocket();

useEffect(() => {
  if (socket) {
    socket.on("customEvent", handleCustomEvent);
    return () => socket.off("customEvent", handleCustomEvent);
  }
}, [socket]);
```

---

### 5. ThemeProvider

**Location**: `src/components/common/themeProvider.tsx`

**Purpose**: Manages light/dark theme state.

**State**:

```typescript
{
  theme: "light" | "dark" | "system";
}
```

**Methods**:

```typescript
setTheme(theme: 'light' | 'dark' | 'system'): void
```

---

## Custom Hooks Reference

### Utility Hooks

#### `useDebounce<T>(value: T, delay: number): T`

**Location**: `src/hooks/useDebounce.ts`

**Purpose**: Debounces rapidly changing values (useful for search inputs).

**Example**:

```typescript
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  // Only runs 500ms after user stops typing
  if (debouncedSearch) {
    searchLeads(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

#### `useForm<T>(initialValues: T, validationSchema?: ZodSchema)`

**Location**: `src/hooks/useForm.ts`

**Purpose**: Manages form state, validation, and submission.

**Returns**:

```typescript
{
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => void) => (e: FormEvent) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  isValid: boolean;
}
```

**Example**:

```typescript
const { values, errors, handleChange, handleSubmit } = useForm(
  { email: '', password: '' },
  loginSchema
);

<form onSubmit={handleSubmit(onLogin)}>
  <input value={values.email} onChange={handleChange('email')} />
  {errors.email && <span>{errors.email}</span>}
</form>
```

---

#### `useLocalStorage<T>(key: string, initialValue: T)`

**Location**: `src/hooks/useLocalStorage.ts`

**Purpose**: Syncs React state with localStorage.

**Returns**: `[value, setValue, remove]`

**Example**:

```typescript
const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light");
```

---

#### `useIndexedDB(dbName: string, storeName: string)`

**Location**: `src/hooks/useIndexedDB.ts`

**Purpose**: Provides CRUD operations for IndexedDB.

**Methods**:

```typescript
get<T>(key: string): Promise<T | undefined>
set<T>(key: string, value: T): Promise<void>
delete(key: string): Promise<void>
getAll<T>(): Promise<T[]>
clear(): Promise<void>
```

---

### Data Hooks

All data hooks follow a similar pattern and return:

```typescript
{
  data: T[];               // Array of entities
  loading: boolean;        // Initial load state
  loadingMore: boolean;    // Pagination load state
  error: Error | null;     // Error state
  hasNextPage: boolean;    // Pagination flag
  // CRUD methods
  create: (dto: CreateDTO) => Promise<T>
  update: (id: string, dto: UpdateDTO) => Promise<T>
  delete: (id: string) => Promise<void>
  // Additional methods vary by hook
}
```

---

#### `useLeadData()`

**Location**: `src/hooks/leads/useLeadData.ts`

**Purpose**: Manages lead data with filtering, search, pagination.

**Returns**:

```typescript
{
  leads: Lead[];
  filteredLeads: Lead[];        // After filters applied
  loading: boolean;
  loadingMore: boolean;
  error: Error | null;
  filters: LeadFilters;
  isSearchMode: boolean;
  searchLoading: boolean;
  hasNextPage: boolean;

  fetchLeads: () => Promise<void>
  createLead: (dto: CreateLeadDTO) => Promise<Lead>
  updateLead: (id: string, dto: UpdateLeadDTO) => Promise<Lead>
  deleteLead: (id: string) => Promise<void>
  searchLeads: (query: string) => Promise<void>
  updateFilter: (key: keyof LeadFilters, value: any) => void
  resetFilters: () => void
  loadMore: () => Promise<void>
  convertToDeal: (leadId: string, dealData: CreateDealDTO) => Promise<Deal>
}
```

**Filters**:

```typescript
{
  status?: 'New' | 'Converted' | 'Dead' | 'Follow-Up';
  source?: LeadSource;
  search?: string;
  minScore?: number;
  maxScore?: number;
  organizationId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page: number;
  limit: number;
}
```

---

#### `useDealData()`

**Location**: `src/hooks/deals/useDealData.ts`

**Purpose**: Manages deal data with stage filtering.

**Returns**: Similar to `useLeadData` plus:

```typescript
{
  deals: Deal[];
  // ... standard CRUD methods
  updateStage: (id: string, stage: DealStage) => Promise<Deal>
  markAsWon: (id: string) => Promise<Deal>
  markAsLost: (id: string, reason: string) => Promise<Deal>
}
```

---

#### `useOrganizationData()`

**Location**: `src/hooks/organizations/useOrganizationData.ts`

**Purpose**: Manages organization data.

**Returns**: Standard data hook pattern with:

```typescript
{
  organizations: Organization[];
  fetchOrganizations: () => Promise<void>
  createOrganization: (dto: CreateOrganizationDTO) => Promise<Organization>
  // ... etc
}
```

---

#### `useUserData()`

**Location**: `src/hooks/users/useUserData.ts`

**Purpose**: User management (admin/super_admin only).

**Returns**:

```typescript
{
  users: User[];
  // ... standard CRUD
  updateUserRole: (id: string, role: string) => Promise<User>
  deactivateUser: (id: string) => Promise<User>
  reactivateUser: (id: string) => Promise<User>
}
```

---

#### `useTenantData()`

**Location**: `src/hooks/tenants/useTenantData.ts`

**Purpose**: Tenant management (super_admin only).

**Returns**: Standard CRUD for tenants.

---

#### `useCallData(leadId: string)`

**Location**: `src/hooks/leads/tabs/useCallData.ts`

**Purpose**: Call logs for a specific lead.

**Returns**:

```typescript
{
  calls: Call[];
  loading: boolean;
  error: Error | null;
  createCall: (dto: CreateCallDTO) => Promise<Call>
  updateCall: (id: string, dto: UpdateCallDTO) => Promise<Call>
  deleteCall: (id: string) => Promise<void>
}
```

---

#### `useCommentData(leadId: string)`

**Location**: `src/hooks/leads/tabs/useCommentData.ts`

**Purpose**: Comments for a specific lead.

**Returns**: Similar to `useCallData`.

---

#### `useAttachmentData(leadId: string)`

**Location**: `src/hooks/leads/tabs/useAttachmentData.ts`

**Purpose**: File attachments for a specific lead.

**Returns**:

```typescript
{
  attachments: Attachment[];
  loading: boolean;
  uploading: boolean;  // Separate flag for upload
  error: Error | null;
  uploadAttachment: (file: File) => Promise<Attachment>
  downloadAttachment: (attachment: Attachment) => Promise<void>
  deleteAttachment: (id: string) => Promise<void>
}
```

**`downloadAttachment` flow**:

1. Fetch `GET /api/attachments/:id/download` (returns presigned S3 URL)
2. Create temporary `<a>` element with `href = presignedUrl`
3. Trigger download
4. Remove `<a>` element

---

### Offline Hooks

#### `useOfflineManager()`

**Location**: `src/hooks/useOfflineManager.ts`

**Purpose**: Core offline queue engine. Used internally by `OfflineProvider`.

**State**:

```typescript
{
  queue: OfflineRequest[];
  isSyncing: boolean;
  isOnline: boolean;
  isOfflineModeEnabled: boolean;
  lastSyncTime: Date | null;
}
```

**Queue Entry Structure**:

```typescript
{
  id: string;                     // Unique ID: "METHOD-url-timestamp-random"
  url: string;                    // API endpoint
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body: unknown;                  // Request payload
  headers?: Record<string, string>;
  timestamp: number;              // Unix timestamp
  retries: number;                // Current retry count
  maxRetries: number;             // Max allowed retries (default: 3)
  idempotencyKey: string;         // crypto.randomUUID()
  entityType: 'leads' | 'deals' | 'comments' | 'calls' | 'attachments' | 'organizations' | 'users';
  operationType: 'create' | 'update' | 'delete';
}
```

**Methods**:

##### `addToQueue(request: OfflineRequestInput): string`

- Only queues if `isOfflineModeEnabled` or `!isOnline`
- Persists to IndexedDB `offlineQueue` store
- Returns `idempotencyKey` (or empty string if not queued)

##### `syncQueue(): Promise<void>`

- Groups queue by `${entityType}-${operationType}`
- Fires one bulk API call per group: `POST /api/bulk/:entityType/:operationType`
- On success: removes entries from queue
- On failure: increments `retries`; if `retries >= maxRetries`, marks as failed
- Fires `CustomEvent('offlineSync', { detail: { succeeded, failed, errors } })`

**Lifecycle**:

1. On mount: reads queue from IndexedDB
2. Listens to `online` event → auto-sync
3. Listens to `offlineSync` custom event → update UI

---

### Analytics Hooks

#### `useDashboardStats(period?: '7d' | '30d' | '90d')`

**Location**: `src/hooks/analytics/useDashboardStats.ts`

**Purpose**: Fetches dashboard metrics for specified period.

**Returns**:

```typescript
{
  stats: DashboardStats | null;
  changes: DashboardChanges | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**DashboardStats**:

```typescript
{
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  deadLeads: number;
  totalDeals: number;
  dealsInProgress: number;
  wonDeals: number;
  lostDeals: number;
  totalRevenue: number;
  averageDealValue: number;
  conversionRate: number;
  totalOrganizations: number;
}
```

**DashboardChanges** (percentage change from previous period):

```typescript
{
  totalLeads: number;
  newLeads: number;
  // ... etc (same structure as stats)
}
```

---

#### `useAnalyticsData()`

**Location**: `src/hooks/analytics/useAnalyticsData.ts`

**Purpose**: Fetches detailed analytics charts data.

**Returns**:

```typescript
{
  leadTrends: LeadTrendDay[];
  leadStatusDistribution: LeadStatusEntry[];
  scoreDistribution: ScoreBucket[];
  dealPipeline: DealPipelineStage[];
  orgIndustryStats: OrgIndustryStat[];
  topOrganizations: TopOrganization[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>
}
```

---

#### `useUserAnalyticsData()`

**Location**: `src/hooks/users/useUserAnalyticsData.ts`

**Purpose**: User-specific analytics and custom dashboards.

**Returns**:

```typescript
{
  widgets: Widget[];
  loading: boolean;
  error: Error | null;
  createWidget: (widget: CreateWidgetDTO) => Promise<Widget>
  updateWidget: (id: string, updates: Partial<Widget>) => Promise<Widget>
  deleteWidget: (id: string) => Promise<void>
  reorderWidgets: (widgets: Widget[]) => Promise<void>
}
```

---

### Permission Hooks

#### `usePermissions()`

**Location**: `src/hooks/usePermissions.ts`

**Purpose**: Access current user's permissions.

**Returns**:

```typescript
{
  permissions: string[];           // e.g., ['leads:read', 'deals:write']
  loading: boolean;
}
```

---

#### `useHasPermission(permission: string): boolean`

**Example**:

```typescript
const canEditLeads = useHasPermission("leads:write");
```

---

#### `useHasAllPermissions(permissions: string[]): boolean`

**Example**:

```typescript
const canManageUsers = useHasAllPermissions([
  "users:read",
  "users:write",
  "users:delete",
]);
```

---

#### `useHasAnyPermission(permissions: string[]): boolean`

**Example**:

```typescript
const canViewAnalytics = useHasAnyPermission([
  "analytics:read",
  "analytics:export",
]);
```

---

### Role Hooks

#### `useRoles()`

**Purpose**: Fetch and manage roles.

**Returns**:

```typescript
{
  roles: Role[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>
}
```

---

#### `useCreateRole()`, `useUpdateRole()`, `useDeleteRole()`

Mutation hooks for role management.

---

## Services Layer

### API Core

**Location**: `src/services/api/core.ts`

**Axios Instance**:

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g., http://localhost:3000/api
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

**Request Interceptor**:

- Attaches `Authorization: Bearer <token>` from localStorage
- Adds `X-Request-ID` header

**Response Interceptor**:

- On 401 Unauthorized → fires `window.dispatchEvent(new CustomEvent('auth:logout'))`
- Extracts `response.data` for cleaner usage

**Token Management**:

```typescript
setToken(token: string): void      // Stores in memory + localStorage
clearToken(): void                 // Clears from both
getToken(): string | null          // Retrieves token
```

---

### API Modules

Each API module exports methods that return promises. Example:

**`leads.api.ts`**:

```typescript
export const leadsAPI = {
  getAll: (params?: LeadQueryParams) => apiClient.get("/leads", { params }),
  getById: (id: string) => apiClient.get(`/leads/${id}`),
  create: (dto: CreateLeadDTO) => apiClient.post("/leads", dto),
  update: (id: string, dto: UpdateLeadDTO) =>
    apiClient.put(`/leads/${id}`, dto),
  delete: (id: string) => apiClient.delete(`/leads/${id}`),
  search: (query: string) =>
    apiClient.get("/leads/search", { params: { q: query } }),
  convertToDeal: (leadId: string, dealData: CreateDealDTO) =>
    apiClient.post(`/leads/${leadId}/convert`, dealData),
};
```

**Bulk API** (`bulk.api.ts`):

```typescript
export const bulkAPI = {
  createLeads: (leads: CreateLeadDTO[]) =>
    apiClient.post("/bulk/leads/create", { leads }),
  updateLeads: (leads: UpdateLeadDTO[]) =>
    apiClient.post("/bulk/leads/update", { leads }),
  deleteLeads: (leadIds: string[]) =>
    apiClient.post("/bulk/leads/delete", { leadIds }),
  // ... same for deals, organizations, etc.
};
```

---

### Export Service

**Location**: `src/services/exportService.ts`

**Methods**:

```typescript
exportLeads(leadIds?: string[]): Promise<Blob>
exportDeals(dealIds?: string[]): Promise<Blob>
exportEmailLeads(leadIds: string[], email: string): Promise<void>
```

**Flow**:

1. Call `POST /api/export/leads` or `POST /api/export/leads/email`
2. Backend generates CSV using `fast-csv`
3. If email export: sends via Nodemailer
4. If direct export: returns CSV blob → triggers download

**Usage**:

```typescript
import { exportLeads } from "@/services/exportService";

const handleExport = async () => {
  const blob = await exportLeads(selectedLeadIds);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${Date.now()}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};
```

---

## Application Flow

### 1. Bootstrap

```
main.tsx
  ├─ ReactDOM.createRoot(document.getElementById('root'))
  └─ <App />
      └─ <AppProvider>
          └─ <OfflineProvider>
              └─ <NotificationProvider>
                  └─ <SocketProvider>
                      └─ <ThemeProvider>
                          └─ <PersistQueryClientProvider>
                              └─ <BrowserRouter>
                                  └─ <Routes>
```

On mount:

1. `AppProvider` reads localStorage for `auth_token` + `user_data`
2. If token exists → hydrates user state
3. `OfflineProvider` reads IndexedDB for queued requests
4. `SocketProvider` connects to WebSocket server (if authenticated)

---

### 2. Auth Lifecycle

#### Login Flow

```
LoginPage
  ├─ useForm hook manages form state
  ├─ On submit → calls login(email, password)
  └─ AppContext.login()
      ├─ POST /api/auth/login (Passport local strategy)
      ├─ Response: { token, user }
      ├─ setToken(token) → localStorage + Axios headers
      ├─ setState({ user, token, isAuthenticated: true })
      └─ Navigate to /dashboard
```

#### Protected Route

```
<Route path="/dashboard" element={<ProtectedRoute />}>
  └─ Checks isAuthenticated
      ├─ If false → <Navigate to="/login" />
      └─ If true → <Outlet /> (renders DashboardPage)
```

#### Auto-Logout on 401

```
Axios Response Interceptor
  └─ If status === 401
      ├─ window.dispatchEvent(new CustomEvent('auth:logout'))
      └─ AppContext listens to this event
          ├─ Clears localStorage
          ├─ Clears state
          └─ Redirects to /login
```

---

### 3. Data Flow Pattern

#### Example: Fetching Leads

```
LeadsPage component
  ├─ const { filteredLeads, loading, createLead } = useLeadData()
  │
  └─ useLeadData hook
      ├─ useEffect: fetchLeads() on mount
      └─ fetchLeads()
          ├─ setState({ loading: true })
          ├─ leadsAPI.getAll(filters)
          │   └─ apiClient.get('/leads', { params: filters })
          │       └─ Backend: GET /api/leads
          │           ├─ authenticate middleware → req.user
          │           ├─ injectTenantFilter → req.tenantFilter
          │           ├─ leadController.getAllLeads
          │           ├─ leadService.findAll(filters, tenantId)
          │           ├─ leadModel.find({ ...filters, tenantId })
          │           └─ Response: { count, leads }
          ├─ setState({ leads: response.leads, loading: false })
          └─ Apply filters → set filteredLeads
```

#### Creating a Lead

```
LeadModal
  ├─ const { createLead } = useLeadData()
  ├─ const { isOnline, addToQueue } = useOffline()
  └─ onSave()
      ├─ if (isOnline)
      │   └─ await createLead(formData)
      │       ├─ POST /api/leads
      │       ├─ Response: new lead
      │       ├─ Update local state
      │       └─ Close modal
      └─ else
          └─ addToQueue({
                url: '/api/leads',
                method: 'POST',
                body: formData,
                entityType: 'leads',
                operationType: 'create'
              })
              ├─ Persist to IndexedDB
              └─ Show toast: "Queued for sync"
```

---

### 4. Offline / Sync Flow

#### Queue Action

```
User creates lead while offline
  └─ addToQueue(request)
      ├─ Generate id = `POST-/api/leads-${Date.now()}-${Math.random()}`
      ├─ Generate idempotencyKey = crypto.randomUUID()
      ├─ Create OfflineRequest object
      ├─ Save to IndexedDB `offlineQueue` store
      ├─ Update state: queue.push(request)
      └─ Return idempotencyKey
```

#### Auto-Sync on Reconnect

```
Window 'online' event
  └─ useOfflineManager listens
      └─ syncQueue()
          ├─ Group queue by "${entityType}-${operationType}"
          ├─ For each group:
          │   └─ POST /api/bulk/:entityType/:operationType
          │       ├─ Body: { [entityType]: [...items] }
          │       ├─ Backend processes with MongoDB transaction
          │       ├─ Response: { succeeded: [...], failed: [...] }
          │       ├─ Remove succeeded from queue
          │       └─ Increment retries on failed (or remove if maxRetries exceeded)
          └─ Fire CustomEvent('offlineSync', { detail: { succeeded, failed, errors } })
              └─ UI components listen and refresh data
```

#### Idempotency

Each queued request has an `idempotencyKey`. When syncing:

- Backend checks if an item with this key already exists
- If yes → skip creation
- If no → create normally

This prevents duplicate entries on retry.

---

### 5. Analytics Flow

```
DashboardPage
  ├─ const { stats, changes, loading } = useDashboardStats('30d')
  │   └─ useEffect: fetch dashboard stats on mount
  │       └─ GET /api/analytics/dashboard?period=30d
  │           ├─ Backend aggregates data for past 30 days
  │           ├─ Compares to previous 30 days for % change
  │           └─ Response: { stats, changes }
  │
  ├─ Render StatCard components with stats
  │
  └─ const { leadTrends, dealPipeline } = useAnalyticsData()
      └─ Fetch detailed charts data
          ├─ GET /api/analytics/leads/trends
          ├─ GET /api/analytics/deals/pipeline
          └─ Render Recharts components
```

---

## Pages

### Public Pages

| Route              | Component            | Purpose                      |
| ------------------ | -------------------- | ---------------------------- |
| `/`                | `LandingPage`        | Marketing page with features |
| `/login`           | `LoginPage`          | Login form                   |
| `/signup`          | `SignupPage`         | Registration form            |
| `/forgot-password` | `ForgotPasswordPage` | Password reset request       |

### Protected Pages (Require Auth)

| Route                | Component                | Required Permission          | Purpose                       |
| -------------------- | ------------------------ | ---------------------------- | ----------------------------- |
| `/dashboard`         | `DashboardPage`          | -                            | Main dashboard with analytics |
| `/leads`             | `LeadsPage`              | `leads:read`                 | Lead list view                |
| `/leads/:id`         | `LeadDetailPage`         | `leads:read`                 | Lead detail with tabs         |
| `/deals`             | `DealsPage`              | `deals:read`                 | Deal list view                |
| `/deals/:id`         | `DealDetailPage`         | `deals:read`                 | Deal detail view              |
| `/organizations`     | `OrganizationsPage`      | `organizations:read`         | Organization list             |
| `/organizations/:id` | `OrganizationDetailPage` | `organizations:read`         | Organization detail           |
| `/users`             | `UsersPage`              | `users:read`                 | User management               |
| `/tenants`           | `TenantsPage`            | `tenants:read` (super_admin) | Tenant management             |
| `/roles`             | `RolesPage`              | `roles:read`                 | Role management               |
| `/analytics`         | `AnalyticsPage`          | `analytics:read`             | Detailed analytics            |
| `/settings`          | `SettingsPage`           | -                            | User profile settings         |

---

## State Management

### Local Component State

- `useState` for simple UI state (modals, dropdowns, form fields)

### Global State (Context)

- `AppContext` — auth, user, online status
- `OfflineContext` — offline queue
- `NotificationContext` — notifications
- `SocketContext` — WebSocket connection
- `ThemeContext` — theme preference

### Server State (TanStack Query)

- Used selectively for caching expensive queries
- Example: Dashboard stats, analytics data
- Configured with `queryClient` in `src/queryClient.ts`

### Persistent State

- **localStorage** — auth token, user data, theme, offline mode
- **IndexedDB** — offline queue (via `useIndexedDB` hook)

---

## Form Handling

### Form State

Managed by `useForm` custom hook:

```typescript
const { values, errors, touched, handleChange, handleSubmit, isValid } =
  useForm(initialValues, validationSchema);
```

### Validation

Uses Zod schemas defined in `src/utils/formValidators.ts`:

```typescript
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
```

### Form Components

Reusable fields in `src/components/modals/form-fields/`:

- `FormField` — Text input with label + error
- `FormSelect` — Select dropdown
- `FormTextarea` — Textarea input
- `FormCheckbox` — Checkbox input

---

## UI Components

### shadcn/ui Components

Pre-built, accessible components from Radix UI:

- `Button`, `Input`, `Select`, `Dialog`, `Dropdown Menu`, `Tooltip`
- `Table`, `Card`, `Badge`, `Tabs`, `Sheet`, `Command`
- `Alert`, `Toast` (Sonner), `Popover`, `Avatar`, `Separator`
- Full list: `src/components/ui/`

### Custom Components

- `DataTable` — TanStack Table wrapper with sorting, filtering, pagination
- `StatCard` — Dashboard metric card with trend indicator
- `ConfirmDialog` — Confirmation modal for destructive actions
- `LoadingSpinner` — Centered spinner
- `ErrorBoundary` — Catches React errors
- `ProtectedByPermission` — Conditional rendering based on permissions

---

## Key Packages

### Core Dependencies

| Package      | Version | Purpose            |
| ------------ | ------- | ------------------ |
| `react`      | 19.0.0  | UI framework       |
| `react-dom`  | 19.0.0  | React DOM renderer |
| `typescript` | 5.7.3   | Type safety        |
| `vite`       | 7.1.3   | Build tool         |

### Routing & Data Fetching

| Package                                | Version | Purpose                 |
| -------------------------------------- | ------- | ----------------------- |
| `react-router`                         | 7.1.3   | Client-side routing     |
| `@tanstack/react-query`                | 5.66.1  | Server state management |
| `@tanstack/react-query-persist-client` | 5.66.1  | Query persistence       |
| `axios`                                | 1.7.9   | HTTP client             |

### UI & Styling

| Package        | Version | Purpose                  |
| -------------- | ------- | ------------------------ |
| `tailwindcss`  | 4.0.0   | Utility-first CSS        |
| `@radix-ui/*`  | Latest  | Accessible UI primitives |
| `lucide-react` | 0.478.0 | Icon library             |
| `sonner`       | 2.2.0   | Toast notifications      |
| `recharts`     | 2.14.2  | Chart library            |

### Tables

| Package                 | Version | Purpose                |
| ----------------------- | ------- | ---------------------- |
| `@tanstack/react-table` | 8.21.1  | Headless table library |

### Utilities

| Package          | Version | Purpose                |
| ---------------- | ------- | ---------------------- |
| `zod`            | 3.24.1  | Schema validation      |
| `clsx`           | 2.1.1   | Conditional classNames |
| `tailwind-merge` | 2.5.5   | Merge Tailwind classes |
| `date-fns`       | 4.1.0   | Date utilities         |

### Real-Time

| Package            | Version | Purpose          |
| ------------------ | ------- | ---------------- |
| `socket.io-client` | 4.8.1   | WebSocket client |

---

## Development

### Start Dev Server

```bash
npm run dev
```

Runs on `http://localhost:5173` with HMR.

### Build for Production

```bash
npm run build
```

Outputs to `dist/`.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run typecheck
```

---

## Build & Deployment

### Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

For production:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Build Command

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Drag dist/ folder to Netlify dashboard
# Or use Netlify CLI
```

### Serve with Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/campaign-flux/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Testing

### Unit Tests (Coming Soon)

```bash
npm run test
```

### E2E Tests (Coming Soon)

```bash
npm run test:e2e
```

---

## Contributing

See main [README.md](../README.md#contributing) for guidelines.

---

## License

MIT License. See [LICENSE](../LICENSE).

---

<div align="center">

**[⬆ back to top](#campaign-flux--client)**

Built with ❤️ using React 19 + TypeScript + Vite

</div>
