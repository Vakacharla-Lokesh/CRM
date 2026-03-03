# Server — Express API

The server is an Express v5 REST API backed by MongoDB via Mongoose. It implements JWT authentication, role-based access control, multi-tenancy, Zod request validation, and MongoDB transactions for bulk operations.

---

## Folder Structure

```
server/
├── src/
│   └── server.js          # Express app setup, middleware registration, route mounting
├── index.js               # Entry point (starts HTTP server)
├── config/
│   └── passport.js        # Passport.js strategies (local + JWT)
├── db/
│   └── initDb.js          # Mongoose connection initialization
├── routes/
│   ├── authRoutes.js
│   ├── leadRoutes.js
│   ├── dealRoutes.js
│   ├── organizationRoutes.js
│   ├── userRoutes.js
│   ├── tenantRoutes.js
│   ├── callRoutes.js
│   ├── commentRoutes.js
│   ├── attachmentRoutes.js
│   ├── analyticsRoutes.js
│   └── bulkRoutes.js
├── controllers/
│   ├── authController.js
│   ├── leadController.js
│   ├── dealController.js
│   ├── organizationController.js
│   ├── userController.js
│   ├── tenantController.js
│   ├── callController.js
│   ├── commentController.js
│   ├── attachmentController.js
│   ├── analyticsController.js
│   └── bulkController.js
├── models/
│   ├── userModel.js
│   ├── leadModel.js
│   ├── dealModel.js
│   ├── organizationModel.js
│   ├── tenantModel.js
│   ├── callModel.js
│   ├── commentModel.js
│   └── attachmentModel.js
├── middlewares/
│   ├── auth.js            # JWT authentication middleware
│   ├── rbac.js            # Role authorization + tenant filter injection
│   ├── validate.js        # Zod request body validation
│   ├── validate.params.js # Zod URL param validation
│   └── errorHandler.js    # Global error handler + 404 handler
├── validators/
│   ├── authValidator.js
│   ├── leadsValidator.js
│   ├── dealsValidator.js
│   ├── organizationsValidator.js
│   ├── userValidators.js
│   ├── tenantsValidator.js
│   ├── callsValidator.js
│   ├── commentsValidator.js
│   └── attachmentsValidator.js
└── utils/
    └── rateLimit.js       # express-rate-limit configuration
```

---

## Middleware Stack

Middleware is applied globally in `server.js` in this order:

| Middleware | Package | Purpose |
|---|---|---|
| `helmet` | `helmet` | Sets security HTTP headers (CSP disabled) |
| `morgan` | `morgan` | HTTP request logging in `dev` format |
| `cors` | `cors` | Allows requests from `http://localhost:5173` with credentials |
| `express.json` | built-in | Parses JSON bodies up to 10 MB |
| `express.urlencoded` | built-in | Parses URL-encoded bodies up to 10 MB |
| `passport.initialize` | `passport` | Initializes Passport.js (stateless/JWT mode) |
| `limiter` | `express-rate-limit` | 100 requests per 15 minutes per IP |

After route handlers, two error-handling middlewares run:

- **`notFound`** — catches unmatched routes and returns `404 { message: "Route not found" }`
- **`errorHandler`** — handles Mongoose `ValidationError`, duplicate key (`11000`), `CastError`, JWT errors, and generic 500s

---

## Route-Level Middleware

Most routes apply a chain of three middleware functions before the controller:

1. **`authenticate`** (`middlewares/auth.js`) — Validates the `Authorization: Bearer <token>` header using the JWT Passport strategy. Attaches `req.user = { userId, role, tenantId }` on success.

2. **`authorize(...roles)`** (`middlewares/rbac.js`) — Checks `req.user.role` is in the allowed list. Returns `403` if not. Roles: `user`, `admin`, `super_admin`.

3. **`injectTenantFilter`** (`middlewares/rbac.js`) — Sets `req.tenantFilter` to `{ tenantId: req.user.tenantId }` for non-super_admin users, or `{}` for super_admin (so they see all tenants).

4. **`validate(schema)`** (`middlewares/validate.js`) — Parses `req.body` against a Zod schema. Returns `400` with Zod error details on failure.

---

## Authentication (Passport.js)

Two strategies are registered in `config/passport.js`:

- **`LocalStrategy`** — Used at login. Looks up user by `email`, compares password with `bcryptjs`. Username field is `email`.
- **`JwtStrategy`** — Used on all protected routes. Extracts the bearer token, verifies it with `JWT_SECRET`, and hydrates `req.user` from the DB.

Tokens are signed with `jsonwebtoken` and expire after 24 hours.

---

## API Endpoints

Base path: `/api`

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Returns `{ status: "OK", timestamp }` |

---

### Auth — `/api/auth`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/register` | None | — | Creates a new user and tenant (if `name` provided). Returns JWT. |
| POST | `/login` | None | — | Authenticates with email + password via LocalStrategy. Returns JWT. |
| POST | `/logout` | None | — | Stateless logout (client discards token). Returns success message. |
| POST | `/refresh` | JWT | — | Issues a new JWT using the existing valid token. |
| GET | `/profile` | JWT | — | Returns the authenticated user's profile. |

---

### Leads — `/api/leads`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT + TenantFilter | user, admin, super_admin | Get all leads (scoped to tenant for non-super_admin) |
| GET | `/:id` | JWT | user, admin, super_admin | Get lead by ID |
| POST | `/` | JWT + Validate | user, admin, super_admin | Create a new lead |
| PUT | `/:id` | JWT + Validate | user, admin, super_admin | Full update of a lead |
| DELETE | `/:id` | JWT | user, admin, super_admin | Delete a lead |
| GET | `/tenant/:tenantId` | JWT | admin, super_admin | Get all leads for a specific tenant |
| GET | `/user/:userId` | JWT | user, admin, super_admin | Get leads assigned to a user |
| GET | `/organization/:organizationId` | JWT | user, admin, super_admin | Get leads linked to an organization |
| PATCH | `/:id/status` | JWT + Validate | user, admin, super_admin | Update lead status only |
| PATCH | `/:id/score` | JWT + Validate | user, admin, super_admin | Manually override lead score |
| POST | `/:id/convert` | JWT | user, admin, super_admin | Convert lead to a deal |

---

### Deals — `/api/deals`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT + TenantFilter | user, admin, super_admin | Get all deals (tenant-scoped) |
| GET | `/:id` | JWT | user, admin, super_admin | Get deal by ID |
| POST | `/` | JWT + Validate | user, admin, super_admin | Create a deal |
| PUT | `/:id` | JWT + Validate | user, admin, super_admin | Full update of a deal |
| DELETE | `/:id` | JWT | user, admin, super_admin | Delete a deal |
| GET | `/tenant/:tenantId` | JWT | admin, super_admin | Get deals for a tenant |
| GET | `/user/:userId` | JWT | user, admin, super_admin | Get deals by assigned user |
| GET | `/lead/:leadId` | JWT | user, admin, super_admin | Get deals linked to a lead |
| GET | `/organization/:organizationId` | JWT | user, admin, super_admin | Get deals linked to an organization |
| PATCH | `/:id/status` | JWT + Validate | user, admin, super_admin | Update deal status only |

---

### Organizations — `/api/organizations`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT + TenantFilter | user, admin, super_admin | Get all organizations |
| GET | `/:id` | JWT | user, admin, super_admin | Get organization by ID |
| POST | `/` | JWT + Validate | user, admin, super_admin | Create an organization |
| PUT | `/:id` | JWT + Validate | user, admin, super_admin | Update an organization |
| DELETE | `/:id` | JWT | user, admin, super_admin | Delete an organization |

---

### Users — `/api/users`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| POST | `/password-reset` | None | — | Send password reset (public) |
| GET | `/me` | JWT | — | Get current authenticated user |
| GET | `/search` | JWT + TenantFilter | admin, super_admin | Search users |
| GET | `/stats` | JWT + TenantFilter | admin, super_admin | User statistics |
| GET | `/` | JWT + TenantFilter | admin, super_admin | List all users |
| POST | `/` | JWT + Validate | admin, super_admin | Create a user |
| GET | `/tenant/:tenantId` | JWT | super_admin | List users by tenant |
| GET | `/:id` | JWT | admin, super_admin | Get user by ID |
| PUT | `/:id` | JWT + Validate | admin, super_admin | Full update of a user |
| DELETE | `/:id` | JWT | admin, super_admin | Delete a user |
| PATCH | `/:id/role` | JWT + Validate | super_admin | Update user role |
| PUT | `/:id/password` | JWT + Validate | — | Change password (own account) |
| PATCH | `/:id/profile` | JWT + Validate | — | Update profile fields |
| GET | `/:id/activity` | JWT | — | Get user activity log |
| GET | `/:id/permissions` | JWT | — | Get user permissions |

---

### Tenants — `/api/tenants`

All tenant routes require `super_admin` role.

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT | super_admin | List all tenants |
| GET | `/:id` | JWT | super_admin | Get tenant by ID |
| POST | `/` | JWT + Validate | super_admin | Create a tenant |
| PUT | `/:id` | JWT + Validate | super_admin | Update a tenant |
| DELETE | `/:id` | JWT | super_admin | Delete a tenant |

---

### Calls — `/api/calls`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT | user, admin, super_admin | List all calls |
| GET | `/:id` | JWT | user, admin, super_admin | Get call by ID |
| POST | `/` | JWT + Validate | user, admin, super_admin | Log a call |
| PUT | `/:id` | JWT + Validate | user, admin, super_admin | Update a call |
| DELETE | `/:id` | JWT | user, admin, super_admin | Delete a call |
| GET | `/lead/:leadId` | JWT | user, admin, super_admin | Get calls for a lead |

---

### Comments — `/api/comments`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT | user, admin, super_admin | List all comments |
| GET | `/:id` | JWT | user, admin, super_admin | Get comment by ID |
| POST | `/` | JWT + Validate | user, admin, super_admin | Create a comment |
| PUT | `/:id` | JWT + Validate | user, admin, super_admin | Update a comment |
| DELETE | `/:id` | JWT | user, admin, super_admin | Delete a comment |
| GET | `/lead/:leadId` | JWT | user, admin, super_admin | Get comments for a lead |

---

### Attachments — `/api/attachments`

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/` | JWT | user, admin, super_admin | List all attachments |
| GET | `/:id` | JWT | user, admin, super_admin | Get attachment metadata |
| POST | `/` | JWT + Validate | user, admin, super_admin | Create an attachment record |
| DELETE | `/:id` | JWT | user, admin, super_admin | Delete an attachment |
| GET | `/lead/:leadId` | JWT | user, admin, super_admin | Get attachments for a lead |
| GET | `/:id/download` | JWT | user, admin, super_admin | Download an attachment |

---

### Analytics — `/api/analytics`

All analytics routes use `[authenticate, injectTenantFilter]`.

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/dashboard` | — | KPIs: totalLeads, conversions, revenue, activeCampaigns + % changes vs previous 30-day period |
| GET | `/leads/trends` | `?days=30` (max 90) | Daily lead counts broken down by status |
| GET | `/leads/status-breakdown` | `?days=30` | Per-status count, avg score, and % of total |
| GET | `/leads/score-distribution` | — | Bucketed counts: 0–19, 20–39, 40–59, 60–79, 80–100 with converted count |
| GET | `/deals/pipeline` | — | Per-stage breakdown (count, total value, avg value) + monthly trends + summary totals |
| GET | `/deals/trends` | `?days=30` | Daily deal count and value by status |
| GET | `/organizations/stats` | — | Per-industry: org count, avg size, total leads, converted leads, conversion rate |
| GET | `/organizations/top` | `?limit=10` | Top organizations by total deal value with lead/deal counts |

---

### Bulk Operations — `/api/bulk`

All bulk routes require `authenticate` + `authorize(user, admin, super_admin)`. Each operation uses a MongoDB session with `startTransaction` / `commitTransaction` for atomicity. On any failure the transaction is aborted.

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/leads/create` | `{ leads: [] }` | Bulk insert leads via `insertMany` |
| POST | `/leads/update` | `{ updates: [{ id, ...fields }] }` | Bulk update leads via `bulkWrite` |
| POST | `/deals/create` | `{ deals: [] }` | Bulk insert deals |
| POST | `/deals/update` | `{ updates: [] }` | Bulk update deals |
| POST | `/comments/create` | `{ comments: [] }` | Bulk insert comments |
| POST | `/calls/create` | `{ calls: [] }` | Bulk insert calls |
| POST | `/organizations/create` | `{ organizations: [] }` | Bulk insert organizations |
| POST | `/organizations/update` | `{ updates: [] }` | Bulk update organizations |

These endpoints are also used by the client's offline sync mechanism — when the user reconnects, queued requests are batched and sent here.

---

## Error Response Formats

| Scenario | Status | Body |
|---|---|---|
| Zod validation failure | 400 | `{ errors: ZodError[] }` |
| Mongoose ValidationError | 400 | `{ message: "Validation Error", errors: string[] }` |
| Invalid MongoDB ID | 400 | `{ message: "Invalid ID format" }` |
| Invalid/expired JWT | 401 | `{ message: "Invalid or expired token" }` |
| Forbidden role | 403 | `{ message: "Forbidden: ..." }` |
| Route not found | 404 | `{ message: "Route not found" }` |
| Duplicate key (MongoDB 11000) | 409 | `{ message: "Duplicate Entry", field: string }` |
| Unhandled error | 500 | `{ message: "Internal Server Error" }` |

---

## Key Packages

| Package | Purpose |
|---|---|
| `express` v5 | HTTP framework |
| `mongoose` v9 | MongoDB ODM + schema validation |
| `passport` + `passport-local` + `passport-jwt` | Authentication strategies |
| `jsonwebtoken` | JWT sign/verify |
| `bcryptjs` | Password hashing |
| `zod` v4 | Runtime request validation |
| `helmet` | Security headers |
| `cors` | Cross-origin request handling |
| `morgan` | Request logging |
| `express-rate-limit` | IP-based rate limiting |
| `dotenv` | Environment variable loading |
| `nodemon` | Dev auto-restart |