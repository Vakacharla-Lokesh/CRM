# Campaign Flux — Client

React 19 + TypeScript frontend for the Campaign Flux CRM platform. This document covers the complete folder structure, every custom hook, context providers, data flow, and the offline-sync lifecycle.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Context Providers](#context-providers)
- [Custom Hooks — Reference](#custom-hooks--reference)
  - [Utility Hooks](#utility-hooks)
  - [Data Hooks](#data-hooks)
  - [Offline Hooks](#offline-hooks)
  - [Analytics Hooks](#analytics-hooks)
- [Application Flow](#application-flow)
  - [1. Bootstrap](#1-bootstrap)
  - [2. Auth Lifecycle](#2-auth-lifecycle)
  - [3. Data Flow Pattern](#3-data-flow-pattern)
  - [4. Offline / Sync Flow](#4-offline--sync-flow)
  - [5. Analytics Flow](#5-analytics-flow)
- [Pages](#pages)
- [Services Layer](#services-layer)
- [Key Packages](#key-packages)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Icons | Lucide React |
| Offline Storage | IndexedDB (native browser API) |
| Form Handling | Custom `useForm` hook + `formValidators.ts` |

---

## Folder Structure

```
client/
├── public/
│   └── crm.png
└── src/
    ├── main.tsx                   # App entry point, mounts providers
    ├── App.tsx                    # Root component, defines all routes
    ├── context/
    │   ├── AppContext.tsx         # Auth state, online status, user session
    │   ├── OfflineContext.tsx     # Offline queue provider (wraps useOfflineManager)
    │   └── index.ts
    ├── hooks/                     # All custom hooks (see reference below)
    ├── pages/                     # One file per route
    ├── components/
    │   ├── common/                # Shared UI: StatCard, ConfirmDialog, etc.
    │   ├── dashboard/             # SkeletonRows, EmptyState, ProgressRow
    │   ├── layout/                # Sidebar, Header, RightPanel (monitoring)
    │   ├── leads/                 # Lead list, detail tabs (calls, comments, attachments)
    │   ├── organizations/         # Org list and detail
    │   ├── users/                 # User management table
    │   ├── tenants/               # Tenant management (super_admin only)
    │   ├── modals/                # CreateLead, CreateDeal, Settings, etc.
    │   └── ui/                    # shadcn/ui primitives (Button, Input, Dialog…)
    ├── services/
    │   ├── api/
    │   │   ├── core.ts            # Axios-style HTTP client with JWT injection
    │   │   ├── auth.api.ts
    │   │   ├── leads.api.ts
    │   │   ├── deals.api.ts
    │   │   ├── organizations.api.ts
    │   │   ├── users.api.ts
    │   │   ├── tenants.api.ts
    │   │   ├── analytics.api.ts
    │   │   ├── calls.api.ts
    │   │   ├── comments.api.ts
    │   │   ├── attachments.api.ts
    │   │   └── bulk.api.ts
    │   ├── authService.ts
    │   ├── leadService.ts
    │   ├── dealService.ts
    │   ├── organizationService.ts
    │   ├── userService.ts
    │   ├── tenantService.ts
    │   ├── exportService.ts       # CSV export for leads
    │   └── index.ts
    ├── types/                     # TypeScript interfaces and DTOs
    └── utils/
        ├── indexedDB.ts           # DB init (campaignFluxDB), store definitions
        └── formValidators.ts      # Validation functions per entity
```

---

## Context Providers

The app wraps all children in two context providers, mounted in `main.tsx` in this order:

```
<AppProvider>           ← auth state, online/offline flag, user data
  <OfflineProvider>     ← offline queue, sync state, manual offline toggle
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </OfflineProvider>
</AppProvider>
```

### AppContext (`useAppContext`)

Manages the authenticated session for the entire application. On mount it reads `auth_token` and `user_data` from `localStorage`. It exposes:

| Value / Method | Type | Description |
|---|---|---|
| `user` | `User \| null` | The currently authenticated user object |
| `token` | `string \| null` | Raw JWT string |
| `isAuthenticated` | `boolean` | True when both `user` and `token` are present |
| `isOnline` | `boolean` | Mirrors `navigator.onLine`, updated via window events |
| `loading` | `boolean` | True while hydrating session from localStorage |
| `login(email, password)` | `Promise<AuthResponse>` | Calls `POST /auth/login`, saves token + user to state and localStorage |
| `signup(userData)` | `Promise<AuthResponse>` | Calls `POST /auth/register`, same persistence behaviour |
| `logout()` | `Promise<void>` | Calls `POST /auth/logout`, clears state and localStorage, fires `auth:logout` window event |
| `updateUser(user)` | `void` | Syncs partial user updates back to state and localStorage |
| `refreshToken()` | `Promise<string>` | Calls `POST /auth/refresh`, replaces stored token |

When the browser fires an `auth:logout` window event (emitted by the API core on 401 responses), the context clears the session automatically without requiring an explicit `logout()` call.

### OfflineContext (`useOffline`)

A thin wrapper around `useOfflineManager`. Exposes the entire offline queue API to any component tree consumer. See [Offline Hooks](#offline-hooks) for the full API.

---

## Custom Hooks — Reference

### Utility Hooks

#### `useAsync<T>`

The core async-state primitive used by all data hooks. Wraps any async function with unified `loading`/`error`/`data` state and built-in exponential-backoff retry.

```ts
const { loading, error, data, execute, executeWithRetry, reset } = useAsync<Lead[]>();

// Basic call — no retry
await execute(() => leadService.getAllLeads());

// With up to 3 retries, backoff: 1s → 2s → 4s (capped at 10s)
await executeWithRetry(() => leadService.getAllLeads(), 3);
```

**What it tracks:**

| Return | Type | Description |
|---|---|---|
| `loading` | `boolean` | True while the promise is pending |
| `error` | `Error \| null` | Holds the last error on failure, null on success |
| `data` | `T \| null` | Holds the resolved value on success |
| `execute(fn, retries?)` | `Promise<T>` | Runs the async function with optional retry count |
| `executeWithRetry(fn, max?)` | `Promise<T>` | Shorthand — defaults to 3 retries |
| `reset()` | `void` | Clears loading, error, and data back to initial state |
| `setError(err)` | `void` | Manually sets an error without running an async function |

**Retry logic:** Each retry waits `Math.min(1000 * 2^attempt, 10000)` ms before reattempting. After all retries are exhausted the error is surfaced and re-thrown to the caller.

---

#### `useFetch<T>`

A lower-level hook for direct HTTP calls without going through the service layer. Supports in-memory response caching, request cancellation via `AbortController`, and optional success/error callbacks.

```ts
const { data, loading, error, fetchData } = useFetch<Lead[]>('/api/leads', {
  cache: true,
  cacheTime: 5 * 60 * 1000,  // 5 minutes
  onSuccess: (data) => console.log('loaded', data),
});
```

**Options:**

| Option | Default | Description |
|---|---|---|
| `method` | `'GET'` | HTTP method |
| `cache` | `true` | Enable in-memory cache (GET only) |
| `cacheTime` | `300000` (5 min) | How long a cached entry stays valid |
| `onSuccess` | `null` | Callback fired with response data |
| `onError` | `null` | Callback fired with the error |

**Behaviours:**
- GET responses are cached per URL in a `Map<url, {data, timestamp}>` ref
- Aborts any in-flight request if `fetchData` is called again before the previous resolves
- `fetchData(url?, options?)` can be called imperatively with per-call overrides

---

#### `useForm<TValues>`

A full-featured form state manager. Accepts `initialValues`, an async `onSubmit` handler, and an optional `validate` function.

```ts
const {
  values, errors, touched, isSubmitting,
  handleChange, handleBlur, handleSubmit,
  setFieldValue, setFieldError, resetForm, getFieldProps, getFieldMeta,
} = useForm<LoginFormData>(
  { userEmail: '', password: '', rememberMe: false },
  async (values) => { await login(values.userEmail, values.password); },
  validateLoginForm,
);
```

**Lifecycle:**
1. `handleChange` — updates `values[name]` for the changed field and clears any existing error for that field
2. `handleBlur` — marks the field as `touched` and runs the `validate` function for that field only, setting its error if invalid
3. `handleSubmit` — marks all fields as `touched`, runs full validation across all fields, calls `onSubmit(values)` if valid, catches thrown errors and writes them to `errors.submit`
4. `resetForm` — restores initial values and clears all error/touched state

**Helpers:**

| Helper | Description |
|---|---|
| `getFieldProps(name)` | Returns `{ name, value, onChange, onBlur }` for spreading onto inputs |
| `getFieldMeta(name)` | Returns `{ error, touched, value }` for displaying validation UI |
| `setFieldValue(name, value)` | Programmatically set a field (used for checkboxes and custom selects) |
| `setFieldError(name, msg)` | Manually set an error on a specific field |
| `setFieldTouched(name)` | Programmatically mark a field as touched |
| `resetField(name)` | Resets a single field to its initial value and clears its error/touched state |
| `validateForm()` | Runs the full validate function and updates `errors` state, returns `boolean` |

Form validation functions live in `src/utils/formValidators.ts` and are co-located per entity: `validateLoginForm`, `validateLeadForm`, `validateUserForm`, `validateTenantForm`, `validateOrganizationForm`, `validateSettingsForm`.

---

#### `useDebounce<T>`

Delays updating a value until input has been stable for `delay` ms (default 500ms). Used for live-search inputs across the leads, organizations, and users pages.

```ts
const debouncedSearch = useDebounce(searchInput, 300);

useEffect(() => {
  updateFilter('search', debouncedSearch);
}, [debouncedSearch]);
```

The hook sets up a `setTimeout` on each value change and clears it via cleanup if the value changes again before the delay elapses, ensuring only the last value in a rapid sequence triggers the downstream effect.

---

#### `useLocalStorage<T>`

A typed wrapper around `window.localStorage` that keeps React state and persisted storage in sync.

```ts
const [theme, setTheme, removeTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
```

Also exports standalone utility functions for use outside of React components (used by `AppContext` and `api/core.ts`):

| Function | Description |
|---|---|
| `getFromLocalStorage<T>(key, default?)` | Parses and returns stored JSON, falls back to `default` |
| `saveToLocalStorage(key, value)` | JSON-stringifies and stores a value, returns `boolean` success |
| `removeFromLocalStorage(key)` | Removes a single key, returns `boolean` success |
| `clearLocalStorage()` | Wipes all localStorage keys, returns `boolean` success |

---

#### `useAuth`

A role and permission helper that reads from `AppContext`. Makes no API calls — purely derives permission state from the current user's role.

```ts
const {
  hasRole, hasPermission, can, owns,
  isLoggedIn, getRole, getUserId, getUserEmail,
} = useAuth();

hasRole('admin');                          // boolean
hasRole(['admin', 'super_admin']);         // OR logic
hasPermission('create_lead');             // based on role → permission map
can('delete', { type: 'lead', userId: '...' });  // permission + ownership check
owns({ ownerId: '123' });                 // compares against current user._id
```

**Built-in permission map (role → boolean):**

| Permission | `user` | `admin` | `super_admin` |
|---|---|---|---|
| `create_lead` | ✗ | ✓ | ✓ |
| `read_lead` | ✗ | ✓ | ✓ |
| `update_lead` | ✗ | ✓ | ✓ |
| `delete_lead` | ✗ | ✓ | ✓ |
| `create_user` | ✗ | ✓ | ✓ |
| `manage_roles` | ✗ | ✓ | ✓ |
| `view_reports` | ✗ | ✓ | ✓ |
| `manage_settings` | ✗ | ✓ | ✓ |

Used primarily for conditional rendering (hiding admin-only buttons, tabs, pages). The server enforces the real RBAC via its own `authorize` middleware.

---

#### `useIndexedDB<T>`

Provides typed CRUD operations against a named `IDBObjectStore` inside the `campaignFluxDB` (version 1) browser database.

```ts
const { addItem, updateItem, deleteItem, getItem, getAll, getAllByIndex, clear } =
  useIndexedDB<Lead & { id: string }>('leads');
```

**Object stores created on first DB open:**
`users`, `leads`, `deals`, `organizations`, `tenants`, `comments`, `calls`, `attachments`

All stores use `{ keyPath: 'id' }`. Data hooks mirror every server response into the matching store, making the local DB a full offline read cache.

| Method | Returns | Description |
|---|---|---|
| `addItem(item)` | `Promise<IDBValidKey>` | Inserts a new record — fails if key exists |
| `updateItem(id, item)` | `Promise<IDBValidKey>` | Upserts via `store.put` — creates or replaces |
| `deleteItem(id)` | `Promise<void>` | Deletes by key |
| `getItem(id)` | `Promise<T \| undefined>` | Fetches a single record by key |
| `getAll()` | `Promise<T[]>` | Returns all records in the store |
| `getAllByIndex(indexName, key)` | `Promise<T[]>` | Queries by a named index |
| `clear()` | `Promise<void>` | Empties the entire store |

---

### Data Hooks

All data hooks follow the same internal pattern:

1. Declare local state with `useState` (`items`, `filteredItems`, `loading`, `error`, `statistics`, `filters`, pagination cursors)
2. Call `useAsync` for the async state machine
3. Call `useIndexedDB` for the matching store
4. On mount (`useEffect`), fetch the first page from the server and mirror results to IndexedDB
5. Expose `loadMore()` for cursor-based pagination, CRUD operations, and filter controls
6. Re-run filter + statistics calculations client-side after any mutation

#### `useLeadData`

Manages the full lead list for the `/leads` page with cursor-based pagination (20 per page).

```ts
const {
  leads, filteredLeads, loading, loadingMore, error,
  statistics, filters, hasNextPage,
  fetchLeads, loadMore,
  createLead, updateLead, deleteLead, fetchLeadById,
  updateFilter, resetFilters,
} = useLeadData();
```

**Statistics computed from local `leads` array (no extra network request):**
- `total` — total count of loaded leads
- `byStatus: Record<string, number>` — count per `leadStatus` value
- `bySource: Record<string, number>` — count per `leadSource` value
- `conversionRate` — `(Converted count / total * 100).toFixed(1)` as a string

**Filters applied client-side against the in-memory array:**
- `status` — exact match on `leadStatus`
- `source` — exact match on `leadSource`
- `search` — case-insensitive substring match on `leadFirstName`, `leadLastName`, `leadEmail`
- `dateFrom` / `dateTo` — timestamp range on `createdAt`

`updateFilter(key, value)` updates a single filter key and immediately re-runs `applyFilters`. `resetFilters()` clears all filters and restores `filteredLeads = leads`. No re-fetch occurs on filter changes.

After `createLead`, `updateLead`, or `deleteLead`, the hook updates local state directly then re-runs filter and statistics calculations so the UI is always consistent.

---

#### `useDealData`

Manages the deal pipeline list for the `/deals` page. Cursor-based pagination (20 per page). Mirrors each fetched deal to the `deals` IndexedDB store.

```ts
const {
  deals, filteredDeals, loading, loadingMore, error,
  statistics, filters, hasNextPage,
  fetchDeals, loadMore,
  createDeal, updateDeal, deleteDeal, updateDealStatus,
  setFilters,
} = useDealData();
```

**Filters:** `status`, `stage`, `search`, `dateFrom`, `dateTo`, `minValue`, `maxValue`

**Statistics (computed via `useMemo` — recalculates whenever `deals` changes):**
- `total`, `totalValue`, `avgValue`, `forecastValue`
- `byStatus: Record<DealStatus, number>`
- `byStage: Record<string, number>`

---

#### `useOrganizationData`

Manages the organizations list for the `/organizations` page. Cursor-based pagination (20 per page).

```ts
const {
  organizations, filteredOrganizations, loading, loadingMore,
  statistics, filters,
  fetchOrganizations, loadMore,
  createOrganization, updateOrganization, deleteOrganization,
  searchOrganizations, bulkUpdateOrganizations,
  updateFilter, resetFilters,
} = useOrganizationData();
```

**Statistics:** `total`, `byIndustry: Record<string, number>`

**Filters:** `industry` (exact), `search` (name, website, industry), `dateFrom`, `dateTo`

Unlike lead/deal hooks, `createOrganization` and `updateOrganization` write through to IndexedDB via `updateItem` and `deleteOrganization` calls `deleteItem`, keeping the local store in sync with mutations.

---

#### `useUserData`

Manages the user list — accessible only to `admin` and `super_admin` roles. Cursor-based pagination (20 per page). Mirrors to `users` IndexedDB store.

```ts
const {
  users, filteredUsers, loading, loadingMore,
  statistics, filters, hasNextPage,
  fetchUsers, loadMore,
  createUser, updateUser, deleteUser,
  updateFilter, resetFilters,
} = useUserData();
```

**Statistics (via `useMemo`):** `total`, `active`, `inactive`, `byRole: Record<UserRole, number>`

**Filters:** `role` (exact), `status` (`active` / `inactive` based on `user.isActive`), `search` (firstName, lastName, email)

---

#### `useTenantData`

Manages tenants — accessible to `super_admin` only. Same cursor-based pattern (20 per page). Mirrors to `tenants` IndexedDB store.

```ts
const {
  tenants, filteredTenants, loading, loadingMore,
  statistics, filters, hasNextPage,
  fetchTenants, loadMore,
  createTenant, updateTenant, deleteTenant,
  setFilters,
} = useTenantData();
```

**Filters (computed via `useMemo`):** `search` (tenantName, email, mobile), `dateFrom`, `dateTo`

---

#### `useCallData(leadId)`

Fetches all call logs for a specific lead. Used inside the lead detail page's Calls tab. Fetches `GET /api/calls/lead/:leadId` on mount and exposes CRUD.

```ts
const {
  calls, loading, error,
  createCall, updateCall, deleteCall,
} = useCallData(leadId);
```

State updates after CRUD are applied optimistically to local array — no re-fetch required.

---

#### `useCommentData(leadId)`

Fetches all comments for a specific lead. Used inside the lead detail page's Comments tab. Fetches `GET /api/comments/lead/:leadId` on mount.

```ts
const {
  comments, loading, error,
  createComment, deleteComment,
} = useCommentData(leadId);
```

---

#### `useAttachmentData(leadId)`

Fetches all file attachments for a specific lead. Used inside the lead detail page's Attachments tab.

```ts
const {
  attachments, loading, uploading, error,
  uploadAttachment, downloadAttachment, deleteAttachment,
} = useAttachmentData(leadId);
```

- `uploading` — a separate boolean that is only `true` during file upload (distinct from the general `loading` state)
- `uploadAttachment(file: File)` — sends `multipart/form-data` to `POST /api/attachments`
- `downloadAttachment(attachment)` — fetches `GET /api/attachments/:id/download` and triggers a browser file download via a dynamically created `<a>` element

---

### Offline Hooks

#### `useOfflineManager`

The core offline queue engine, consumed by `OfflineProvider` and accessed anywhere via `useOffline()`.

```ts
const {
  queue, isSyncing, isOnline, isOfflineModeEnabled, lastSyncTime,
  addToQueue, removeFromQueue, retryRequest, clearQueue,
  syncQueue, getStats, toggleOfflineMode,
} = useOfflineManager();
```

**State:**

| Field | Type | Description |
|---|---|---|
| `queue` | `OfflineRequest[]` | All pending requests (in-memory + persisted to IndexedDB `offlineQueue` store) |
| `isSyncing` | `boolean` | True while a sync batch is in-flight |
| `isOnline` | `boolean` | Mirrors `navigator.onLine` |
| `isOfflineModeEnabled` | `boolean` | Manual "force offline" toggle, persisted to `localStorage` |
| `lastSyncTime` | `Date \| null` | Timestamp of the last successful sync run |

**Queue entry shape:**

```ts
{
  id: string;             // unique: "METHOD-url-timestamp-random"
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body: unknown;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;        // incremented on each failed attempt
  maxRetries: number;     // default 3
  idempotencyKey: string; // crypto.randomUUID(), returned to caller
  entityType: 'leads' | 'deals' | 'comments' | 'calls' | 'attachments' | 'organizations' | 'users';
  operationType: 'create' | 'update' | 'delete';
}
```

**`addToQueue(...)`** — only enqueues when `isOfflineModeEnabled === true` OR `!isOnline`. Returns the `idempotencyKey` string (or empty string if the request was not queued because the app is online and manual mode is off).

**`syncQueue()`** — groups queue entries by `${entityType}-${operationType}`, then fires one `POST /api/bulk/:entityType/:operationType` per group. On success, removes all entries in the group from the queue. On failure, increments `retries`; if `retries >= maxRetries`, the entry is counted as permanently failed. After the sync run, fires `CustomEvent('offlineSync', { detail: { succeeded, failed, errors } })`.

**Auto-sync triggers:**
1. `window` `online` event — immediate `syncQueue()` call
2. `setInterval` every 30 seconds while online and `queue.length > 0`

**`getStats()`** returns a snapshot:

```ts
{
  total: number;          // all entries in queue
  pending: number;        // total minus permanently failed
  failed: number;         // entries where retries >= maxRetries
  byEntity: Record<string, number>;  // count per entityType
}
```

**`toggleOfflineMode(enabled)`** — persists the preference to `localStorage` under the key `offlineModeEnabled`. The right panel UI toggle calls this to allow developers to simulate offline conditions without disconnecting the network.

---

### Analytics Hooks

#### `useDashboardStats`

Fetches the top-level KPI cards shown at the top of the dashboard page.

```ts
const { stats, changes, loading, error } = useDashboardStats();
```

Calls `GET /api/analytics/dashboard` once on mount.

**`stats` shape:**
```ts
{
  totalLeads: number;
  conversions: number;
  revenue: number;
  activeCampaigns: number;
}
```

**`changes` shape** (period-over-period % vs previous 30 days, used for the trend arrow on StatCard):
```ts
{
  totalLeads: number;
  conversions: number;
  revenue: number;
  activeCampaigns: number;
}
```

---

#### `useAnalyticsData(days = 30)`

Fetches all chart data for the dashboard in a single `Promise.all`. Accepts a `days` parameter (max 90) to control the trend time window.

```ts
const {
  leadTrends, leadStatusBreakdown, leadScoreDistribution,
  dealPipeline, dealPipelineSummary, dealPipelineMonthlyTrends, dealTrends,
  organizationStats, topOrganizations,
  loading, error, refreshData,
} = useAnalyticsData(30);
```

**API calls fired in parallel:**

| Returned Field | API Endpoint | Shape |
|---|---|---|
| `leadTrends` | `GET /api/analytics/leads/trends?days=N` | `{ date, total, byStatus[] }[]` |
| `leadStatusBreakdown` | `GET /api/analytics/leads/status-breakdown?days=N` | `{ status, count, avgScore, percentage }[]` |
| `leadScoreDistribution` | `GET /api/analytics/leads/score-distribution` | `{ bucket, count, convertedCount }[]` |
| `dealPipeline` + `dealPipelineSummary` + `dealPipelineMonthlyTrends` | `GET /api/analytics/deals/pipeline` | pipeline per stage + summary totals + monthly trend |
| `dealTrends` | `GET /api/analytics/deals/trends?days=N` | `{ date, count, value }[]` |
| `organizationStats` | `GET /api/analytics/organizations/stats` | `{ industry, organizationCount, totalLeads, convertedLeads, conversionRate }[]` |
| `topOrganizations` | `GET /api/analytics/organizations/top?limit=10` | `{ name, dealValue, ... }[]` |

All data is fed directly into Recharts line/bar chart components and progress-bar rows on the dashboard page. `refreshData()` re-runs the full `Promise.all`.

---

## Application Flow

### 1. Bootstrap

```
index.html
  └─ main.tsx
       ├─ <AppProvider>
       │    useEffect on mount:
       │      → getFromLocalStorage('auth_token')
       │      → getFromLocalStorage('user_data')
       │      → if both present: setUser, setToken, setIsAuthenticated(true)
       │      → setLoading(false)
       │
       │    window event listeners:
       │      'online'  → setIsOnline(true)
       │      'offline' → setIsOnline(false)
       │      'auth:logout' → clear session state
       │
       └─ <OfflineProvider>
            useOfflineManager on mount:
              → opens IndexedDB offlineQueue store
              → loads any persisted queue entries into queueRef + state
              → reads offlineModeEnabled from localStorage
```

### 2. Auth Lifecycle

**Login:**
```
LoginPage
  useForm validates email + password client-side
  handleSubmit → AppContext.login(email, password)
    → authService.login({ userEmail, password })
        → POST /api/auth/login
    ← { user, token }
    → setUser, setToken, setIsAuthenticated(true)
    → saveToLocalStorage('auth_token', token)
    → saveToLocalStorage('user_data', user)
  → navigate('/dashboard')
```

**Session restore on page reload:**
```
AppProvider useEffect (on mount)
  → getFromLocalStorage('auth_token') + ('user_data')
  → if both present: restore session without a network call
  → setLoading(false)
```

**Auto-logout on 401:**
```
api/core HTTP client receives 401 response from server
  → window.dispatchEvent(new Event('auth:logout'))
AppContext listener
  → setUser(null), setToken(null), setIsAuthenticated(false)
  → removeFromLocalStorage('auth_token') + ('user_data')
```

**Logout:**
```
AppContext.logout()
  → authService.logout() → POST /api/auth/logout (stateless, best-effort)
  → clear all state + localStorage
```

### 3. Data Flow Pattern

Every page that needs server data follows this chain:

```
Page Component
  └─ Feature Hook (e.g. useLeadData)
       └─ useEffect on mount
            → useAsync.execute(() => leadService.getAllLeads({ limit: 20 }))
                 └─ api/core HTTP client
                      → reads auth_token from localStorage
                      → sets Authorization: Bearer <token> header
                      → sends request to Express backend
                      ← response or 401
                 ← { leads, nextCursor, hasNextPage }
            → setLeads(data)
            → for each lead: useIndexedDB.updateItem(lead._id, lead)
            → calculateStatistics(data)
            → applyFilters(data, currentFilters)
       ← { leads, filteredLeads, loading, error, statistics, filters, ... }

User changes a filter:
  → updateFilter('status', 'New')
       → setFilters(...)
       → applyFilters(leads, newFilters)   ← no network call
       → setFilteredLeads(result)

User clicks "Load More":
  → loadMore()
       → leadService.getAllLeads({ cursor: nextCursor, limit: 20 })
       → setLeads(prev => [...prev, ...newPage])
       → mirror new items to IndexedDB
       → re-run statistics + filters on combined array
```

### 4. Offline / Sync Flow

The offline system has two activation modes: **automatic** (triggered by `navigator.onLine` going `false`) and **manual** (user clicks the "Offline Mode" toggle in the right-panel monitoring sidebar).

**Queueing a request when offline:**
```
Component calls a CRUD operation (e.g. createLead)
  → leadService.createLead(data)
       → api/core HTTP client
            → checks: isOfflineModeEnabled === true || !isOnline
            → instead of fetching, calls addToQueue(url, 'POST', body, headers, 3, 'leads', 'create')
                 → builds OfflineRequest with crypto.randomUUID() idempotencyKey
                 → queueRef.current.set(request.id, request)   ← in-memory
                 → setQueue([...queueRef.current.values()])     ← React state
                 → saveToIndexedDB(request)                     ← persists across reloads
            ← returns idempotencyKey to caller
```

**Sync when connection restores:**
```
window 'online' event fires
  → useOfflineManager.syncQueue()
       → guard: if (!isOnline || isSyncing || queue.length === 0) return
       → setIsSyncing(true)
       → group queue entries by `${entityType}-${operationType}`

       for each group (e.g. "leads-create"):
         → build payload = requests.map(r => r.body)
         → fetch POST /api/bulk/leads/create
              body: { leads: [...payloads] }
              header: Authorization: Bearer <token>
         ← success → removeFromQueue for each entry
         ← HTTP error → retryRequest (retries++)
                         if retries >= maxRetries → mark as failed, add to errors[]

       → setLastSyncTime(new Date())
       → setIsSyncing(false)
       → window.dispatchEvent(new CustomEvent('offlineSync', { detail: result }))
```

**Auto-sync polling:** While online and `queue.length > 0`, a `setInterval` calls `syncQueue()` every 30 seconds as a background safety net.

**Right Panel (monitoring sidebar UI):**
- Live connection status indicators (green/red LEDs via `ConnectivityLEDs` component)
- Sync status badge showing pending/failed counts from `getStats()`
- "Offline Mode ON/OFF" button calls `toggleOfflineMode(!isOfflineModeEnabled)`
- "Sync Queue" button calls `syncQueue()` manually (disabled while offline or queue is empty)
- Shows last sync timestamp from `lastSyncTime`

### 5. Analytics Flow

```
DashboardPage mounts
  ├─ useDashboardStats()
  │    → GET /api/analytics/dashboard
  │    ← { stats, changes }
  │    → renders 4 StatCard components with KPI values + % change arrows
  │
  └─ useAnalyticsData(30)
       → Promise.all([7 analytics endpoints fired simultaneously])
       ← all data resolved at once
       → leadTrends.slice(-10) fed into line chart (last 10 days)
       → leadStatusBreakdown fed into status progress bars
       → dealPipeline fed into bar chart (value per stage)
       → dealPipelineSummary feeds total pipeline value / avg deal value KPIs
       → organizationStats fed into industry breakdown table
       → topOrganizations fed into top-orgs list
```

All chart data is shaped in `DashboardPage` before being passed to Recharts components. There are no intermediate selectors or stores — the hook returns raw API data and the page component does the final transform.

---

## Pages

| Route | Page File | Primary Hooks |
|---|---|---|
| `/` | `landingPage.tsx` | none |
| `/login` | `loginPage.tsx` | `useForm`, `useAppContext` |
| `/signup` | `signupPage.tsx` | `useAppContext` |
| `/dashboard` | `dashboardPage.tsx` | `useDashboardStats`, `useAnalyticsData` |
| `/leads` | `leadsPage.tsx` | `useLeadData`, `useDebounce` |
| `/leads/:id` | `leadDetailPage.tsx` | `useLeadData`, `useCallData`, `useCommentData`, `useAttachmentData` |
| `/organizations` | `organizationsPage.tsx` | `useOrganizationData`, `useDebounce` |
| `/deals` | `dealsPage.tsx` | `useDealData` |
| `/users` | `usersPage.tsx` | `useUserData`, `useAuth` |
| `/tenants` | `tenantsPage.tsx` | `useTenantData`, `useAuth` |

Route protection is handled in `App.tsx` — if `!isAuthenticated`, any protected route redirects to `/login`.

---

## Services Layer

The services layer sits between hooks and the network. Each service file imports from `api/core.ts` and exposes typed async methods.

**`api/core.ts`** — the authenticated HTTP client:
- Reads `auth_token` from localStorage on every request and injects `Authorization: Bearer <token>`
- On 401, fires the `auth:logout` window event and rejects the promise
- Exports typed helpers: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete_<T>`

| Service | Key Methods |
|---|---|
| `authService` | `login`, `signup`, `logout`, `refreshToken`, `changePassword`, `getStatus` |
| `leadService` | `getAllLeads({ cursor, limit })`, `getLeadById`, `createLead`, `updateLead`, `deleteLead`, `convertLead`, `updateLeadStatus`, `updateLeadScore` |
| `dealService` | `getAllDeals({ cursor, limit })`, `getDealById`, `createDeal`, `updateDeal`, `deleteDeal`, `updateDealStatus` |
| `organizationService` | `getAllOrganizations`, `createOrganization`, `updateOrganization`, `deleteOrganization`, `bulkUpdateOrganizations` |
| `userService` | `getAllUsers`, `createUser`, `updateUser`, `deleteUser`, `updateUserRole`, `updatePassword` |
| `tenantService` | `getAllTenants({ cursor, limit })`, `createTenant`, `updateTenant`, `deleteTenant` |
| `exportService` | `exportLeadsToCSV(leads)` — generates and downloads a `.csv` file client-side without a server call |
| `analyticsAPI` | `dashboard`, `leadTrends`, `leadStatusBreakdown`, `leadScoreDistribution`, `dealPipeline`, `dealTrends`, `organizationStats`, `topOrganizations` |

---

## Key Packages

| Package | Version | Purpose |
|---|---|---|
| `react` | 19 | UI framework |
| `react-router-dom` | v7 | Client-side routing with protected route patterns |
| `@tanstack/react-table` | v8 | Headless table with sorting, filtering, pagination |
| `recharts` | latest | SVG chart library (line, bar, progress) |
| `tailwindcss` | v4 | Utility-first CSS |
| `@radix-ui/*` | latest | Accessible UI primitives (Dialog, Checkbox, Select, etc.) via shadcn/ui |
| `lucide-react` | latest | Icon library |
| `vite` | 7 | Build tool and dev server with HMR |
| `typescript` | 5 | Static typing across all layers |