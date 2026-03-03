# Campaign Flux — Server

**Node.js + Express + MongoDB backend** for the Campaign Flux CRM platform.

This document provides complete documentation for the backend architecture, including API endpoints, middleware stack, authentication flow, database models, AWS integrations, and deployment instructions.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture Overview](#architecture-overview)
- [Middleware Stack](#middleware-stack)
- [Authentication & Authorization](#authentication--authorization)
  - [Passport.js Strategies](#passportjs-strategies)
  - [JWT Flow](#jwt-flow)
  - [RBAC & Permissions](#rbac--permissions)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Leads](#leads-endpoints)
  - [Deals](#deals-endpoints)
  - [Organizations](#organizations-endpoints)
  - [Users](#users-endpoints)
  - [Tenants](#tenants-endpoints)
  - [Calls](#calls-endpoints)
  - [Comments](#comments-endpoints)
  - [Attachments](#attachments-endpoints)
  - [Analytics](#analytics-endpoints)
  - [Bulk Operations](#bulk-operations-endpoints)
  - [Roles & Permissions](#roles--permissions-endpoints)
  - [Search](#search-endpoints)
  - [Export](#export-endpoints)
- [Request Validation](#request-validation)
- [Error Handling](#error-handling)
- [AWS Integration](#aws-integration)
  - [S3 (File Storage)](#s3-file-storage)
  - [SQS (Job Queue)](#sqs-job-queue)
  - [Lambda (Workers)](#lambda-workers)
  - [DynamoDB (Job Store)](#dynamodb-job-store)
  - [LocalStack Setup](#localstack-setup)
- [Background Jobs](#background-jobs)
- [Email Service](#email-service)
- [Seed Scripts](#seed-scripts)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)
- [Performance](#performance)
- [Security](#security)

---

## Tech Stack

| Layer                | Technology         | Version | Purpose                   |
| -------------------- | ------------------ | ------- | ------------------------- |
| **Runtime**          | Node.js            | 20+     | JavaScript runtime        |
| **Framework**        | Express            | 5.2.2   | Web application framework |
| **Database**         | MongoDB            | 7.0     | NoSQL database            |
| **ODM**              | Mongoose           | 9.1.6   | MongoDB object modeling   |
| **Authentication**   | Passport.js        | 0.7.1   | Authentication middleware |
| **JWT**              | jsonwebtoken       | 9.0.2   | Token-based auth          |
| **Password Hashing** | bcryptjs           | 2.4.3   | Secure password storage   |
| **Validation**       | Zod                | 3.24.1  | Schema validation         |
| **Security**         | Helmet             | 8.1.0   | Security headers          |
| **Logging**          | Morgan             | 1.10.1  | HTTP request logging      |
| **CORS**             | CORS               | 2.8.5   | Cross-origin requests     |
| **Rate Limiting**    | express-rate-limit | 8.2.1   | API rate limiting         |
| **Email**            | Nodemailer         | 6.10.0  | Email delivery            |
| **CSV**              | fast-csv           | 5.0.2   | CSV parsing/generation    |
| **AWS SDK**          | @aws-sdk/client-\* | 3.806+  | AWS service clients       |

---

## Folder Structure

```
server/
├── src/
│   ├── index.js              # Server entry point (HTTP server start)
│   ├── server.js             # Express app setup & middleware registration
│   │
│   ├── config/               # Configuration files
│   │   └── passport.js       # Passport.js strategies (local + JWT)
│   │
│   ├── db/                   # Database connection
│   │   └── initDb.js         # Mongoose connection initialization
│   │
│   ├── routes/               # API route definitions (14 files)
│   │   ├── authRoutes.js                 # /api/auth
│   │   ├── leadRoutes.js                 # /api/leads
│   │   ├── dealRoutes.js                 # /api/deals
│   │   ├── organizationRoutes.js         # /api/organizations
│   │   ├── userRoutes.js                 # /api/users
│   │   ├── tenantRoutes.js               # /api/tenants
│   │   ├── callRoutes.js                 # /api/calls
│   │   ├── commentRoutes.js              # /api/comments
│   │   ├── attachmentRoutes.js           # /api/attachments
│   │   ├── analyticsRoutes.js            # /api/analytics
│   │   ├── bulkRoutes.js                 # /api/bulk
│   │   ├── roleRoutes.js                 # /api/roles
│   │   ├── searchRoutes.js               # /api/search
│   │   ├── exportRoutes.js               # /api/export
│   │   └── statsRoutes.js                # /api/stats
│   │
│   ├── controllers/          # Request handlers (one per route file)
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── dealController.js
│   │   ├── organizationController.js
│   │   ├── userController.js
│   │   ├── tenantController.js
│   │   ├── callController.js
│   │   ├── commentController.js
│   │   ├── attachmentController.js
│   │   ├── analyticsController.js
│   │   ├── bulkController.js
│   │   ├── roleController.js
│   │   ├── searchController.js
│   │   ├── exportController.js
│   │   └── statsController.js
│   │
│   ├── models/               # Mongoose schemas & models
│   │   ├── userModel.js              # Users collection
│   │   ├── leadModel.js              # Leads collection
│   │   ├── dealModel.js              # Deals collection
│   │   ├── organizationModel.js      # Organizations collection
│   │   ├── tenantModel.js            # Tenants collection
│   │   ├── roleModel.js              # Roles collection
│   │   ├── callModel.js              # Calls collection
│   │   ├── commentModel.js           # Comments collection
│   │   ├── attachmentModel.js        # Attachments collection
│   │   ├── activityModel.js          # Activities (timeline) collection
│   │   └── workflowModel.js          # Workflows (automation) collection
│   │
│   ├── middlewares/          # Express middleware
│   │   ├── auth.js                   # JWT authentication
│   │   ├── rbac.js                   # Permission checks & tenant context
│   │   ├── validate.js               # Zod request body validation
│   │   ├── validate.params.js        # Zod URL param validation
│   │   └── errorHandler.js           # Global error handler
│   │
│   ├── validators/           # Zod validation schemas
│   │   ├── authValidator.js
│   │   ├── leadsValidator.js
│   │   ├── dealsValidator.js
│   │   ├── organizationsValidator.js
│   │   ├── userValidators.js
│   │   ├── tenantsValidator.js
│   │   ├── callsValidator.js
│   │   ├── commentsValidator.js
│   │   ├── attachmentsValidator.js
│   │   └── roleValidators.js
│   │
│   ├── services/             # Business logic & external services
│   │   ├── aws/                      # AWS service integrations
│   │   │   ├── awsClient.js          # SDK client initialization
│   │   │   ├── s3Manager.js          # S3 operations
│   │   │   ├── initAwsResources.js   # Bootstrap AWS resources
│   │   │   ├── queue/                # SQS queue service
│   │   │   │   ├── queue.service.js
│   │   │   │   └── queue.config.js
│   │   │   └── lambdas/              # Lambda function handlers
│   │   │       └── jobProcessor.lambda.js
│   │   ├── emailService.js           # Nodemailer email service
│   │   ├── leadService.js            # Lead business logic
│   │   ├── dealService.js            # Deal business logic
│   │   ├── organizationService.js    # Organization business logic
│   │   ├── userService.js            # User business logic
│   │   ├── roleService.js            # Role business logic
│   │   ├── bulkService.js            # Bulk operations with transactions
│   │   └── exportService.js          # CSV export generation
│   │
│   ├── workers/              # Background job workers
│   │   ├── workflowWorker.js         # Workflow execution
│   │   ├── exportWorker.js           # Export generation
│   │   └── leadReminderWorker.js     # Lead reminder notifications
│   │
│   ├── modules/              # Feature modules
│   │   └── jobs/
│   │       ├── jobRegistry.js        # Worker function registry
│   │       └── jobStore.js           # DynamoDB job tracking
│   │
│   ├── utils/                # Utility functions
│   │   ├── rateLimit.js              # Rate limiter configuration
│   │   ├── logger.js                 # Winston logger
│   │   ├── requestContext.js         # Request context store
│   │   ├── asyncCatch.js             # Async error wrapper
│   │   └── appError.js               # Custom error class
│   │
│   └── scripts/              # Database seed scripts
│       ├── seedTenants.js            # Generate test tenants
│       ├── seedUsers.js              # Generate test users
│       └── seedRoles.js              # Create default roles
│
├── .env                      # Environment variables (create from .env.example)
├── .env.example              # Environment template
├── package.json              # Dependencies & scripts
├── package-lock.json         # Locked dependencies
└── README.md                 # This file
```

---

## Architecture Overview

### Request Flow

```
Client Request
    │
    ├─→ Express Middleware Stack
    │   ├─ Helmet (Security headers)
    │   ├─ Morgan (HTTP logging)
    │   ├─ CORS (Origin validation)
    │   ├─ express.json (Body parsing)
    │   ├─ express.urlencoded (Form parsing)
    │   ├─ Passport.initialize (Auth setup)
    │   └─ Rate Limiter (100 req/15min per IP)
    │
    ├─→ Route Handler
    │   ├─ Route-Level Middleware Chain:
    │   │   ├─ authenticateRequest (JWT validation)
    │   │   ├─ injectTenantContext (Tenant filter injection)
    │   │   ├─ requirePermission(...) (Permission check)
    │   │   └─ validate(schema) (Zod validation)
    │   │
    │   └─ Controller Function
    │       ├─ Delegates to Service Layer
    │       ├─ Service Layer
    │       │   ├─ Business logic
    │       │   ├─ Validation
    │       │   ├─ MongoDB queries (via Mongoose)
    │       │   └─ External service calls (AWS, email)
    │       │
    │       └─ Returns Response
    │
    ├─→ Response
    │   ├─ JSON format
    │   ├─ HTTP status code
    │   └─ Data payload
    │
    └─→ Error Handling Middleware (if error occurs)
        ├─ Log error
        ├─ Format error response
        └─ Return 4xx/5xx response
```

### Multi-Tenant Architecture

Every request is scoped to a tenant:

1. **JWT Payload** includes `{ userId, tenantId, role }`
2. **authenticateRequest** middleware attaches `req.user = { userId, tenantId, role }`
3. **injectTenantContext** middleware sets:
   - `req.tenantFilter = { tenantId }` (for non-super_admin)
   - `req.tenantFilter = {}` (for super_admin — sees all data)
4. **Controllers** apply `req.tenantFilter` to all queries
5. **Super Admin** bypasses tenant filter to manage multiple tenants

### Permission-Based Access Control

```
User
  └─→ Role (e.g., "Sales Manager")
       └─→ Permissions Array [
             "leads:read",
             "leads:write",
             "deals:read",
             "analytics:read"
           ]

Middleware: requirePermission('leads:write')
  └─→ Checks if req.user's role has 'leads:write' permission
  └─→ Returns 403 Forbidden if not authorized
```

---

## Middleware Stack

### Global Middleware (Applied to All Routes)

Defined in `server.js`:

| Middleware              | Package              | Purpose                                            | Order |
| ----------------------- | -------------------- | -------------------------------------------------- | ----- |
| **helmet**              | `helmet`             | Sets security HTTP headers (CSP disabled for dev)  | 1     |
| **morgan**              | `morgan`             | HTTP request logging in `dev` format               | 2     |
| **cors**                | `cors`               | CORS with credentials from `http://localhost:5173` | 3     |
| **express.json**        | Built-in             | Parses JSON bodies up to 10 MB                     | 4     |
| **express.urlencoded**  | Built-in             | Parses URL-encoded bodies up to 10 MB              | 5     |
| **passport.initialize** | `passport`           | Initializes Passport.js (stateless JWT mode)       | 6     |
| **limiter**             | `express-rate-limit` | 100 requests per 15 minutes per IP                 | 7     |

### Route-Level Middleware

Applied to specific routes:

#### 1. `authenticateRequest` (`middlewares/auth.js`)

**Purpose**: Validates JWT token from `Authorization: Bearer <token>` header.

**Flow**:

1. Extract token from header
2. Pass to Passport JWT strategy
3. Strategy verifies token signature and expiry
4. Hydrates `req.user = { userId, role, tenantId }` from token payload
5. Returns `401 Unauthorized` if token is invalid/expired

**Usage**:

```javascript
router.get("/leads", authenticateRequest, getAllLeads);
```

---

#### 2. `injectTenantContext` (`middlewares/rbac.js`)

**Purpose**: Sets `req.tenantFilter` based on user role.

**Logic**:

```javascript
if (req.user.role === "super_admin") {
  req.tenantFilter = {}; // See all tenants
  req.tenantId = null;
} else {
  req.tenantFilter = { tenantId: req.user.tenantId };
  req.tenantId = req.user.tenantId;
}
```

**Usage**:

```javascript
router.get("/leads", authenticateRequest, injectTenantContext, getAllLeads);
```

---

#### 3. `requirePermission(permission: string)` (`middlewares/rbac.js`)

**Purpose**: Checks if user's role has the required permission.

**Flow**:

1. Fetch user's role from database
2. Check if `role.permissions` array includes `permission`
3. Return `403 Forbidden` if not authorized
4. Call `next()` if authorized

**Usage**:

```javascript
router.post(
  "/leads",
  authenticateRequest,
  injectTenantContext,
  requirePermission("leads:write"),
  createLead,
);
```

**Permission Format**: `<resource>:<action>`

- Examples: `leads:read`, `deals:write`, `analytics:export`, `users:delete`

---

#### 4. `validate(schema: ZodSchema)` (`middlewares/validate.js`)

**Purpose**: Validates `req.body` against a Zod schema.

**Flow**:

1. Parse `req.body` with `schema.parse(req.body)`
2. If validation fails → return `400 Bad Request` with Zod error details
3. If validation succeeds → call `next()`

**Usage**:

```javascript
import { createLeadSchema } from "../validators/leadsValidator.js";

router.post(
  "/leads",
  authenticateRequest,
  validate(createLeadSchema),
  createLead,
);
```

**Example Zod Schema**:

```javascript
export const createLeadSchema = z.object({
  leadFirstName: z.string().min(1, 'First name is required'),
  leadLastName: z.string().optional(),
  leadEmail: z.string().email('Invalid email').optional(),
  leadSource: z.enum(['API', 'Phone', 'Website', ...]),
  leadStatus: z.enum(['New', 'Converted', 'Dead', 'Follow-Up']),
  leadScore: z.number().min(0).max(100).optional(),
  organizationId: z.string().optional()
});
```

---

### Error Handling Middleware

Applied at the end of the middleware chain:

#### 1. `notFound` (`middlewares/errorHandler.js`)

**Purpose**: Catches requests to undefined routes.

**Response**:

```json
{
  "status": "error",
  "message": "Route not found"
}
```

---

#### 2. `errorHandler` (`middlewares/errorHandler.js`)

**Purpose**: Global error handler for all errors.

**Handles**:

- **Mongoose ValidationError** → 400 with field errors
- **MongoDB Duplicate Key (11000)** → 400 with "Duplicate value" message
- **Mongoose CastError** → 400 with "Invalid ID format"
- **JWT Errors** (invalid, expired) → 401 with "Unauthorized"
- **Custom AppError** → Uses error's `statusCode` and `message`
- **Generic Error** → 500 with "Internal server error"

**Response Format**:

```json
{
  "status": "error",
  "message": "Error message",
  "errors": [...]  // Optional: field-level errors
}
```

---

## Authentication & Authorization

### Passport.js Strategies

Configured in `config/passport.js`:

#### 1. LocalStrategy

**Used For**: Login (username + password validation)

**Username Field**: `userEmail`

**Flow**:

1. Find user by `userEmail`
2. If user not found → `Incorrect email`
3. If user found → compare password with `bcryptjs.compare(password, user.password)`
4. If password match → return user
5. If password mismatch → `Incorrect password`

**Usage**:

```javascript
// In authController.js login function
passport.authenticate("local", (err, user, info) => {
  if (!user) return res.status(401).json({ message: info.message });
  // Generate JWT and return
});
```

---

#### 2. JwtStrategy

**Used For**: Protecting routes (token validation)

**Token Extraction**: `Authorization: Bearer <token>` header

**Secret**: `process.env.JWT_SECRET`

**Flow**:

1. Extract token from header
2. Verify signature and expiry with `jsonwebtoken.verify(token, JWT_SECRET)`
3. Extract payload: `{ userId, role, tenantId }`
4. Find user in database by `userId`
5. If user exists → attach `req.user = { userId, role, tenantId }`
6. If user not found → return `Unauthorized`

---

### JWT Flow

#### Token Generation (Login)

```javascript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  {
    userId: user._id,
    role: user.role,
    tenantId: user.tenantId,
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" },
);

res.json({ token, user });
```

**Token Payload**:

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "role": "admin",
  "tenantId": "507f1f77bcf86cd799439012",
  "iat": 1672531200,
  "exp": 1672617600
}
```

---

#### Token Refresh

```javascript
// POST /api/auth/refresh
export const refreshToken = asyncCatch(async (req, res) => {
  const oldToken = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(oldToken, process.env.JWT_SECRET);

  const user = await userModel.findById(decoded.userId);
  if (!user) throw new AppError("User not found", 404);

  const newToken = jwt.sign(
    { userId: user._id, role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  res.json({ token: newToken });
});
```

---

### RBAC & Permissions

#### System Roles

| Role          | Description    | Default Permissions                                                                                                                |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `user`        | Standard user  | `leads:read`, `deals:read`, `organizations:read`, `calls:*`, `comments:*`                                                          |
| `admin`       | Tenant admin   | All `user` permissions + `leads:write`, `leads:delete`, `deals:write`, `users:read`, `users:write`, `analytics:read`, `roles:read` |
| `super_admin` | Platform admin | All permissions across all tenants                                                                                                 |

#### Permission Categories

| Category          | Permissions                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------- |
| **Leads**         | `leads:read`, `leads:write`, `leads:delete`, `leads:export`, `leads:assign`, `leads:view_all` |
| **Deals**         | `deals:read`, `deals:write`, `deals:delete`, `deals:export`, `deals:view_all`                 |
| **Organizations** | `organizations:read`, `organizations:write`, `organizations:delete`, `organizations:export`   |
| **Users**         | `users:read`, `users:write`, `users:delete`, `users:manage_roles`, `users:view_all`           |
| **Roles**         | `roles:read`, `roles:write`, `roles:delete`                                                   |
| **Tenants**       | `tenants:read`, `tenants:write`, `tenants:delete` (super_admin only)                          |
| **Analytics**     | `analytics:read`, `analytics:export`, `analytics:view_all`                                    |
| **Calls**         | `calls:read`, `calls:write`, `calls:delete`                                                   |
| **Comments**      | `comments:read`, `comments:write`, `comments:delete`                                          |
| **Attachments**   | `attachments:read`, `attachments:write`, `attachments:delete`                                 |
| **Bulk**          | `bulk:import`, `bulk:export`                                                                  |

#### Role Model

```javascript
{
  _id: ObjectId,
  tenantId: ObjectId,          // null for system roles
  name: String,                 // e.g., "Sales Manager"
  description: String,
  permissions: [String],        // Array of permission strings
  isSystemRole: Boolean,        // Cannot be deleted
  createdAt: Date,
  updatedAt: Date
}
```

---

## Database Models

All models use Mongoose schemas. Below are the key models:

### User Model

**Collection**: `Users`  
**File**: `models/userModel.js`

```javascript
{
  _id: ObjectId (alias: userId),
  tenantId: ObjectId,
  firstName: String (required),
  lastName: String,
  userEmail: String (unique, required, email format),
  mobile: String (10 digits, starts with 1-9),
  password: String (required, bcrypt hashed),
  role: String (enum: ['user', 'admin', 'super_admin'], required),
  roleId: ObjectId (ref: 'Roles', required for non-super_admin),
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ userEmail: 1 }` (unique)
- `{ tenantId: 1, role: 1 }`
- `{ userEmail: "text" }` (full-text search)

**Pre-Save Hook**: Hashes password with `bcryptjs` before saving.

---

### Lead Model

**Collection**: `Leads`  
**File**: `models/leadModel.js`

```javascript
{
  _id: ObjectId (alias: leadId),
  tenantId: ObjectId,
  userId: ObjectId (required, creator),
  organizationId: ObjectId (optional),
  leadFirstName: String (required),
  leadLastName: String,
  leadEmail: String (email format),
  leadSource: String (enum: ['API', 'Outsource', 'Phone', 'Website', ...]),
  leadScore: Number (0-100, default: 0),
  leadStatus: String (enum: ['New', 'Converted', 'Dead', 'Follow-Up'], required),
  idempotencyKey: String (for offline sync deduplication),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ userId: 1, createdAt: -1 }`
- `{ tenantId: 1 }`
- `{ organizationId: 1 }`
- `{ leadFirstName: "text", leadLastName: "text", leadEmail: "text" }` (full-text)

---

### Deal Model

**Collection**: `Deals`  
**File**: `models/dealModel.js`

```javascript
{
  _id: ObjectId (alias: dealId),
  tenantId: ObjectId,
  userId: ObjectId (required, owner),
  leadId: ObjectId (optional, if converted from lead),
  organizationId: ObjectId (optional),
  dealName: String (required),
  dealValue: Number (required),
  dealStage: String (enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'], required),
  dealStatus: String (enum: ['In Progress', 'Won', 'Lost'], required),
  expectedCloseDate: Date,
  actualCloseDate: Date,
  lostReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ userId: 1, createdAt: -1 }`
- `{ tenantId: 1 }`
- `{ dealStage: 1, dealStatus: 1 }`

---

### Organization Model

**Collection**: `Organizations`  
**File**: `models/organizationModel.js`

```javascript
{
  _id: ObjectId (alias: organizationId),
  tenantId: ObjectId,
  organizationName: String (required),
  organizationIndustry: String (enum: ['Technology', 'Healthcare', 'Finance', ...]),
  organizationSize: String (enum: ['1-10', '11-50', '51-200', ...]),
  organizationWebsite: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ tenantId: 1 }`
- `{ organizationName: "text" }` (full-text)

---

### Call Model

**Collection**: `Calls`  
**File**: `models/callModel.js`

```javascript
{
  _id: ObjectId (alias: callId),
  leadId: ObjectId (required),
  userId: ObjectId (required, caller),
  callType: String (enum: ['Inbound', 'Outbound'], required),
  callStatus: String (enum: ['Connected', 'No Answer', 'Voicemail', ...]),
  callDuration: Number (seconds),
  callNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ leadId: 1, createdAt: -1 }`
- `{ userId: 1 }`

---

### Comment Model

**Collection**: `Comments`  
**File**: `models/commentModel.js`

```javascript
{
  _id: ObjectId (alias: commentId),
  leadId: ObjectId (required),
  userId: ObjectId (required, author),
  commentText: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ leadId: 1, createdAt: -1 }`

---

### Attachment Model

**Collection**: `Attachments`  
**File**: `models/attachmentModel.js`

```javascript
{
  _id: ObjectId (alias: attachmentId),
  leadId: ObjectId (required),
  s3Key: String (required),
  s3Url: String (required),
  fileName: String (required),
  fileSize: Number,
  fileType: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ leadId: 1, createdAt: -1 }`

---

### Tenant Model

**Collection**: `Tenants`  
**File**: `models/tenantModel.js`

```javascript
{
  _id: ObjectId (alias: tenantId),
  tenantName: String (required),
  email: String (required, email format),
  mobile: String (required, 10 digits),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:

- `{ tenantName: "text", email: "text" }` (full-text)

---

## API Endpoints

### Base URL

```
http://localhost:3000/api
```

All protected routes require:

```
Authorization: Bearer <your-jwt-token>
```

---

### Authentication Endpoints

**Base**: `/api/auth`

| Method | Path               | Auth | Description                                      |
| ------ | ------------------ | ---- | ------------------------------------------------ |
| `POST` | `/register`        | None | Create new user and tenant. Returns JWT.         |
| `POST` | `/login`           | None | Authenticate with email + password. Returns JWT. |
| `POST` | `/refresh`         | JWT  | Refresh access token. Returns new JWT.           |
| `POST` | `/logout`          | None | Stateless logout (client discards token).        |
| `GET`  | `/profile`         | JWT  | Get current user profile.                        |
| `POST` | `/forgot-password` | None | Request password reset OTP.                      |
| `POST` | `/reset-password`  | None | Reset password with OTP.                         |

#### Example: Register

**Request**:

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "userEmail": "john@example.com",
  "password": "SecurePass123!",
  "mobile": "9876543210",
  "tenantName": "ACME Corp"  // Creates new tenant
}
```

**Response**:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "userEmail": "john@example.com",
    "role": "admin",
    "tenantId": "507f1f77bcf86cd799439012"
  }
}
```

---

#### Example: Login

**Request**:

```http
POST /api/auth/login
Content-Type: application/json

{
  "userEmail": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response**:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "role": "admin",
    "tenantId": "507f1f77bcf86cd799439012"
  }
}
```

---

### Leads Endpoints

**Base**: `/api/leads`

All routes require `authenticateRequest + injectTenantContext`.

| Method   | Path           | Permission     | Description                           |
| -------- | -------------- | -------------- | ------------------------------------- |
| `GET`    | `/`            | `leads:read`   | List all leads (paginated, filtered)  |
| `GET`    | `/:id`         | `leads:read`   | Get lead by ID                        |
| `POST`   | `/`            | `leads:write`  | Create new lead                       |
| `PUT`    | `/:id`         | `leads:write`  | Update lead                           |
| `DELETE` | `/:id`         | `leads:delete` | Delete lead                           |
| `GET`    | `/search`      | `leads:read`   | Search leads (query param: `?q=term`) |
| `POST`   | `/:id/convert` | `leads:write`  | Convert lead to deal                  |

#### Example: Get All Leads

**Request**:

```http
GET /api/leads?page=1&limit=50&status=New&source=Website
Authorization: Bearer <token>
```

**Response**:

```json
{
  "count": 150,
  "page": 1,
  "limit": 50,
  "totalPages": 3,
  "leads": [
    {
      "leadId": "507f1f77bcf86cd799439011",
      "leadFirstName": "Alice",
      "leadLastName": "Smith",
      "leadEmail": "alice@example.com",
      "leadSource": "Website",
      "leadStatus": "New",
      "leadScore": 75,
      "organizationId": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    ...
  ]
}
```

---

#### Example: Create Lead

**Request**:

```http
POST /api/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadFirstName": "Bob",
  "leadLastName": "Johnson",
  "leadEmail": "bob@example.com",
  "leadSource": "Phone",
  "leadStatus": "New",
  "leadScore": 60,
  "organizationId": "507f1f77bcf86cd799439012"
}
```

**Response**:

```json
{
  "message": "Lead created successfully",
  "lead": {
    "leadId": "507f1f77bcf86cd799439013",
    "leadFirstName": "Bob",
    "leadLastName": "Johnson",
    ...
  }
}
```

---

### Deals Endpoints

**Base**: `/api/deals`

| Method   | Path         | Permission     | Description       |
| -------- | ------------ | -------------- | ----------------- |
| `GET`    | `/`          | `deals:read`   | List all deals    |
| `GET`    | `/:id`       | `deals:read`   | Get deal by ID    |
| `POST`   | `/`          | `deals:write`  | Create new deal   |
| `PUT`    | `/:id`       | `deals:write`  | Update deal       |
| `DELETE` | `/:id`       | `deals:delete` | Delete deal       |
| `PATCH`  | `/:id/stage` | `deals:write`  | Update deal stage |
| `PATCH`  | `/:id/won`   | `deals:write`  | Mark deal as won  |
| `PATCH`  | `/:id/lost`  | `deals:write`  | Mark deal as lost |

---

### Organizations Endpoints

**Base**: `/api/organizations`

| Method   | Path      | Permission             | Description            |
| -------- | --------- | ---------------------- | ---------------------- |
| `GET`    | `/`       | `organizations:read`   | List all organizations |
| `GET`    | `/:id`    | `organizations:read`   | Get organization by ID |
| `POST`   | `/`       | `organizations:write`  | Create organization    |
| `PUT`    | `/:id`    | `organizations:write`  | Update organization    |
| `DELETE` | `/:id`    | `organizations:delete` | Delete organization    |
| `GET`    | `/search` | `organizations:read`   | Search organizations   |

---

### Users Endpoints

**Base**: `/api/users`

| Method   | Path        | Permission           | Description                             |
| -------- | ----------- | -------------------- | --------------------------------------- |
| `GET`    | `/`         | `users:read`         | List all users (tenant-scoped)          |
| `GET`    | `/:id`      | `users:read`         | Get user by ID                          |
| `POST`   | `/`         | `users:write`        | Create new user                         |
| `PUT`    | `/:id`      | `users:write`        | Update user                             |
| `DELETE` | `/:id`      | `users:delete`       | Soft delete user (set isActive = false) |
| `PATCH`  | `/:id/role` | `users:manage_roles` | Update user role                        |
| `GET`    | `/search`   | `users:read`         | Search users                            |

---

### Tenants Endpoints

**Base**: `/api/tenants`

**All routes require `super_admin` role**.

| Method   | Path   | Description        |
| -------- | ------ | ------------------ |
| `GET`    | `/`    | List all tenants   |
| `GET`    | `/:id` | Get tenant by ID   |
| `POST`   | `/`    | Create new tenant  |
| `PUT`    | `/:id` | Update tenant      |
| `DELETE` | `/:id` | Soft delete tenant |

---

### Calls Endpoints

**Base**: `/api/calls`

| Method   | Path            | Permission     | Description          |
| -------- | --------------- | -------------- | -------------------- |
| `GET`    | `/`             | `calls:read`   | List all calls       |
| `GET`    | `/:id`          | `calls:read`   | Get call by ID       |
| `POST`   | `/`             | `calls:write`  | Log a call           |
| `PUT`    | `/:id`          | `calls:write`  | Update call          |
| `DELETE` | `/:id`          | `calls:delete` | Delete call          |
| `GET`    | `/lead/:leadId` | `calls:read`   | Get calls for a lead |

---

### Comments Endpoints

**Base**: `/api/comments`

| Method   | Path            | Permission        | Description             |
| -------- | --------------- | ----------------- | ----------------------- |
| `GET`    | `/`             | `comments:read`   | List all comments       |
| `GET`    | `/:id`          | `comments:read`   | Get comment by ID       |
| `POST`   | `/`             | `comments:write`  | Create comment          |
| `PUT`    | `/:id`          | `comments:write`  | Update comment          |
| `DELETE` | `/:id`          | `comments:delete` | Delete comment          |
| `GET`    | `/lead/:leadId` | `comments:read`   | Get comments for a lead |

---

### Attachments Endpoints

**Base**: `/api/attachments`

| Method   | Path            | Permission           | Description                                |
| -------- | --------------- | -------------------- | ------------------------------------------ |
| `GET`    | `/`             | `attachments:read`   | List all attachments                       |
| `GET`    | `/:id`          | `attachments:read`   | Get attachment metadata                    |
| `POST`   | `/`             | `attachments:write`  | Create attachment record (after S3 upload) |
| `DELETE` | `/:id`          | `attachments:delete` | Delete attachment (from DB + S3)           |
| `GET`    | `/lead/:leadId` | `attachments:read`   | Get attachments for a lead                 |
| `GET`    | `/:id/download` | `attachments:read`   | Get presigned download URL                 |

#### Example: Upload Attachment

**Flow**:

1. Client gets presigned upload URL from S3
2. Client uploads file directly to S3
3. Client creates attachment record via API

**Request**:

```http
POST /api/attachments
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadId": "507f1f77bcf86cd799439011",
  "s3Key": "attachments/tenant123/lead456/file.pdf",
  "s3Url": "https://s3.amazonaws.com/crm-attachments/...",
  "fileName": "file.pdf",
  "fileSize": 524288,
  "fileType": "application/pdf"
}
```

---

### Analytics Endpoints

**Base**: `/api/analytics`

All routes require `analytics:read` permission.

| Method | Path                      | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| `GET`  | `/dashboard`              | Dashboard stats (query param: `?period=7d`) |
| `GET`  | `/leads/trends`           | Lead trends over time                       |
| `GET`  | `/leads/status`           | Lead count by status                        |
| `GET`  | `/leads/score`            | Lead score distribution                     |
| `GET`  | `/deals/pipeline`         | Deal pipeline by stage                      |
| `GET`  | `/deals/pipeline/summary` | Deal pipeline summary metrics               |
| `GET`  | `/deals/pipeline/trends`  | Deal pipeline monthly trends                |
| `GET`  | `/organizations/industry` | Organization count by industry              |
| `GET`  | `/organizations/top`      | Top organizations by deal value             |

#### Example: Dashboard Stats

**Request**:

```http
GET /api/analytics/dashboard?period=30d
Authorization: Bearer <token>
```

**Response**:

```json
{
  "stats": {
    "totalLeads": 1245,
    "newLeads": 87,
    "convertedLeads": 42,
    "deadLeads": 15,
    "totalDeals": 156,
    "dealsInProgress": 89,
    "wonDeals": 52,
    "lostDeals": 15,
    "totalRevenue": 2450000,
    "averageDealValue": 47115,
    "conversionRate": 3.37,
    "totalOrganizations": 342
  },
  "changes": {
    "totalLeads": 12.5,
    "newLeads": 8.3,
    "convertedLeads": -2.1,
    ...
  }
}
```

---

### Bulk Operations Endpoints

**Base**: `/api/bulk`

All routes require `bulk:import` permission.

**Uses MongoDB transactions** to ensure atomicity.

| Method | Path                    | Description                           |
| ------ | ----------------------- | ------------------------------------- |
| `POST` | `/leads/create`         | Bulk create leads (up to 1000)        |
| `POST` | `/leads/update`         | Bulk update leads                     |
| `POST` | `/leads/delete`         | Bulk delete leads                     |
| `POST` | `/deals/create`         | Bulk create deals (up to 500)         |
| `POST` | `/deals/update`         | Bulk update deals                     |
| `POST` | `/deals/delete`         | Bulk delete deals                     |
| `POST` | `/organizations/create` | Bulk create organizations (up to 500) |
| `POST` | `/organizations/update` | Bulk update organizations             |
| `POST` | `/comments/create`      | Bulk create comments                  |
| `POST` | `/calls/create`         | Bulk create calls                     |

#### Example: Bulk Create Leads

**Request**:

```http
POST /api/bulk/leads/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "leads": [
    {
      "leadFirstName": "Alice",
      "leadEmail": "alice@example.com",
      "leadSource": "Website",
      "leadStatus": "New"
    },
    {
      "leadFirstName": "Bob",
      "leadEmail": "bob@example.com",
      "leadSource": "Phone",
      "leadStatus": "New"
    },
    ...
  ]
}
```

**Response**:

```json
{
  "message": "Bulk create completed",
  "succeeded": [
    { "leadId": "507f1f77bcf86cd799439011", "leadFirstName": "Alice", ... },
    { "leadId": "507f1f77bcf86cd799439012", "leadFirstName": "Bob", ... }
  ],
  "failed": [],
  "stats": {
    "total": 2,
    "succeeded": 2,
    "failed": 0
  }
}
```

---

### Roles & Permissions Endpoints

**Base**: `/api/roles`

| Method   | Path           | Permission     | Description                    |
| -------- | -------------- | -------------- | ------------------------------ |
| `GET`    | `/`            | `roles:read`   | List all roles (tenant-scoped) |
| `GET`    | `/:id`         | `roles:read`   | Get role by ID                 |
| `POST`   | `/`            | `roles:write`  | Create custom role             |
| `PUT`    | `/:id`         | `roles:write`  | Update role                    |
| `DELETE` | `/:id`         | `roles:delete` | Delete role (not system roles) |
| `GET`    | `/permissions` | `roles:read`   | List all available permissions |

---

### Search Endpoints

**Base**: `/api/search`

| Method | Path             | Permission           | Description                           |
| ------ | ---------------- | -------------------- | ------------------------------------- |
| `GET`  | `/leads`         | `leads:read`         | Search leads (query param: `?q=term`) |
| `GET`  | `/deals`         | `deals:read`         | Search deals                          |
| `GET`  | `/organizations` | `organizations:read` | Search organizations                  |
| `GET`  | `/users`         | `users:read`         | Search users                          |

Uses MongoDB text indexes for fuzzy matching.

---

### Export Endpoints

**Base**: `/api/export`

| Method | Path             | Permission             | Description                        |
| ------ | ---------------- | ---------------------- | ---------------------------------- |
| `POST` | `/leads`         | `leads:export`         | Export leads to CSV (returns blob) |
| `POST` | `/leads/email`   | `leads:export`         | Export leads to CSV and email      |
| `POST` | `/deals`         | `deals:export`         | Export deals to CSV                |
| `POST` | `/organizations` | `organizations:export` | Export organizations to CSV        |

#### Example: Export Leads

**Request**:

```http
POST /api/export/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
}
```

**Response**: CSV file blob

**Headers**:

```
Content-Type: text/csv
Content-Disposition: attachment; filename="leads-export-1672531200000.csv"
```

---

## Request Validation

All `POST` and `PUT` endpoints validate request bodies using **Zod schemas**.

### Example Validation Schema

**File**: `validators/leadsValidator.js`

```javascript
import { z } from "zod";

export const createLeadSchema = z.object({
  leadFirstName: z.string().min(1, "First name is required"),
  leadLastName: z.string().optional(),
  leadEmail: z.string().email("Invalid email").optional(),
  leadSource: z.enum([
    "API",
    "Outsource",
    "Phone",
    "Website",
    "Facebook Ads",
    "Google Ads",
    "Instagram",
    "LinkedIn",
    "Email Marketing",
    "Referral",
    "Cold Call",
    "WhatsApp",
    "Other",
  ]),
  leadStatus: z.enum(["New", "Converted", "Dead", "Follow-Up"]),
  leadScore: z.number().min(0).max(100).optional(),
  organizationId: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();
```

### Validation Error Response

**Status**: `400 Bad Request`

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "path": ["leadFirstName"],
      "message": "First name is required"
    },
    {
      "path": ["leadEmail"],
      "message": "Invalid email"
    }
  ]
}
```

---

## Error Handling

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [...]  // Optional field-level errors
}
```

### HTTP Status Codes

| Code  | Meaning               | Example                             |
| ----- | --------------------- | ----------------------------------- |
| `200` | OK                    | Successful GET request              |
| `201` | Created               | Successful POST (resource created)  |
| `400` | Bad Request           | Validation error, malformed request |
| `401` | Unauthorized          | Invalid/expired JWT                 |
| `403` | Forbidden             | Permission denied                   |
| `404` | Not Found             | Resource not found                  |
| `409` | Conflict              | Duplicate key error                 |
| `500` | Internal Server Error | Unexpected server error             |

### Custom Error Class

**File**: `utils/appError.js`

```javascript
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

**Usage**:

```javascript
throw new AppError("Lead not found", 404);
```

---

## AWS Integration

### S3 (File Storage)

**Purpose**: Store attachments linked to leads.

**Buckets**:

- `crm-attachments` — User-uploaded files
- `crm-exports` — Generated CSV exports
- `crm-workflows` — Workflow logs and artifacts

**Operations**:

- `uploadFile(bucket, key, data)` — Upload file
- `downloadFile(bucket, key)` — Generate presigned download URL
- `deleteFile(bucket, key)` — Delete file
- `getPresignedUploadUrl(bucket, key, fileSize)` — Get presigned upload URL

**File**: `services/aws/s3Manager.js`

---

### SQS (Job Queue)

**Purpose**: Async job processing (exports, workflows, reminders).

**Queue**: `crm-jobs-queue`

**Flow**:

1. Controller enqueues job: `queueService.enqueue('export-leads', { leadIds, email })`
2. SQS stores message
3. Lambda polls queue and processes job
4. Lambda worker executes job and updates DynamoDB
5. Result stored in S3 or emailed

**File**: `services/aws/queue/queue.service.js`

---

### Lambda (Workers)

**Purpose**: Serverless background job execution.

**Handler**: `services/aws/lambdas/jobProcessor.lambda.js`

**Registered Workers**:

- `workflow-execution` — Execute workflow automations
- `export-generation` — Generate CSV exports
- `lead-reminder` — Send lead follow-up reminders

**Job Registry**: `modules/jobs/jobRegistry.js`

**Usage**:

```javascript
jobRegistry.register("export-generation", exportWorker.handler);
```

---

### DynamoDB (Job Store)

**Purpose**: Track job status and metadata.

**Table**: `crm-jobs`

**Schema**:

```javascript
{
  jobId: String (partition key),
  tenantId: String (sort key),
  jobType: String,
  status: String (enum: ['pending', 'processing', 'completed', 'failed']),
  payload: Object,
  result: Object,
  error: String,
  createdAt: Number,
  updatedAt: Number
}
```

**File**: `modules/jobs/jobStore.js`

---

### LocalStack Setup

**Purpose**: Local AWS service emulation for development.

**Start LocalStack**:

```bash
docker-compose up -d
```

**Docker Compose** (`docker-compose.yml`):

```yaml
version: "3.8"

services:
  localstack:
    container_name: crm-localstack
    image: localstack/localstack:latest
    ports:
      - "4566:4566"
    environment:
      - SERVICES=s3,sqs,sns,dynamodb,lambda,cloudwatch,cloudformation,iam,events
      - DEBUG=1
      - AWS_ACCESS_KEY_ID=test
      - AWS_SECRET_ACCESS_KEY=test
      - AWS_DEFAULT_REGION=us-east-1
      - DATA_DIR=/tmp/localstack/data
    volumes:
      - "./.localstack:/var/lib/localstack"
```

**Bootstrap Resources**:

```bash
# Automatically creates S3 buckets, SQS queues, DynamoDB tables
# Run on server start or manually:
node src/services/aws/initAwsResources.js
```

---

## Background Jobs

### Job Worker Pattern

```
Controller → queueService.enqueue(jobType, payload)
    ↓
SQS Queue
    ↓
Lambda Triggered (or local polling)
    ↓
jobRegistry.getHandler(jobType)
    ↓
Worker Function Executes
    ↓
Result Stored (S3, DB, Email)
    ↓
Job Status Updated in DynamoDB
```

### Example: Export Worker

**File**: `workers/exportWorker.js`

```javascript
export const jobType = "export-generation";

export const handler = async (job) => {
  const { leadIds, email, tenantId } = job.payload;

  // Generate CSV
  const csvData = await generateCSV(leadIds, tenantId);

  // Upload to S3
  const s3Key = `exports/${tenantId}/${Date.now()}.csv`;
  await s3Manager.uploadString("crm-exports", s3Key, csvData, "text/csv");

  // Email presigned download link
  if (email) {
    const downloadUrl = await s3Manager.downloadFile("crm-exports", s3Key);
    await emailService.send(email, "Export Ready", { downloadUrl });
  }

  return { s3Key, email };
};
```

---

## Email Service

**Purpose**: Send transactional emails (password reset, export notifications).

**Provider**: Nodemailer (SMTP)

**File**: `services/emailService.js`

**Methods**:

```javascript
sendPasswordResetOTP(email, otp);
sendExportReady(email, downloadUrl);
sendWelcome(email, firstName);
```

**Configuration** (`.env`):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## Seed Scripts

### Seed Tenants

**File**: `scripts/seedTenants.js`

**Usage**:

```bash
# Dry run (preview only)
node src/scripts/seedTenants.js

# Actually create in DB
node src/scripts/seedTenants.js --commit

# Clear existing test tenants first
node src/scripts/seedTenants.js --clear --commit
```

**Generates**: 50 random tenants with valid names, emails, and mobile numbers.

---

### Seed Users

**File**: `scripts/seedUsers.js`

**Usage**:

```bash
node src/scripts/seedUsers.js --commit
```

**Generates**: 5-10 users per tenant with random role assignments.

---

### Seed Roles

**File**: `scripts/seedRoles.js`

**Usage**:

```bash
node src/scripts/seedRoles.js --commit
```

**Creates**: Default roles (`user`, `admin`, `super_admin`) with standard permissions.

---

## Environment Variables

Create `.env` file in `server/`:

```env
# Database
DB_URI=mongodb://localhost:27017/campaign-flux
# Or MongoDB Atlas:
# DB_URI=mongodb+srv://username:password@cluster.mongodb.net/campaign-flux?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
# Generate with: openssl rand -base64 64

# Server
PORT=3000
NODE_ENV=development

# AWS Configuration (LocalStack for dev)
LOCALSTACK_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# S3 Buckets
S3_WORKFLOWS_BUCKET=crm-workflows
S3_EXPORTS_BUCKET=crm-exports
S3_ATTACHMENTS_BUCKET=crm-attachments

# SQS
SQS_JOB_QUEUE_URL=http://localhost:4566/000000000000/crm-jobs-queue

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

---

## Development

### Start Dev Server

```bash
npm run dev
```

**Runs with Nodemon** (auto-restart on file changes).

Server runs on `http://localhost:3000`.

### API Testing

Use **Postman**, **Insomnia**, or **cURL**:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userEmail":"admin@example.com","password":"password"}'

# Get leads (with JWT)
curl -X GET http://localhost:3000/api/leads \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Database Connection

**MongoDB URI Format**:

```
mongodb://localhost:27017/campaign-flux
```

**Atlas**:

```
mongodb+srv://<username>:<password>@cluster.mongodb.net/campaign-flux?retryWrites=true&w=majority
```

---

## Deployment

### Production Build

No build step required (Node.js runs directly). Ensure:

- All dependencies installed: `npm install --production`
- Environment variables set
- MongoDB connection secured

---

### Deploy with PM2

**Install PM2**:

```bash
npm install -g pm2
```

**Start Server** (with clustering for multi-core):

```bash
pm2 start src/index.js -i max --name crm-api
```

**Monitor**:

```bash
pm2 monit
pm2 logs crm-api
```

**Restart**:

```bash
pm2 restart crm-api
```

**Save Process List**:

```bash
pm2 save
pm2 startup
```

---

### Environment Variables (Production)

Store sensitive variables in:

- **AWS Secrets Manager**
- **Environment variables** (via hosting platform)
- **`.env` file** (ensure `.gitignore` includes `.env`)

---

### Database (Production)

**MongoDB Atlas**:

- Enable connection pooling
- Set up replica set for high availability
- Enable Atlas Search for full-text queries
- Configure backups

**Indexes**: Ensure all indexes are created (see models).

---

### AWS (Production)

Replace LocalStack with real AWS services:

```env
# Remove LOCALSTACK_ENDPOINT
# Use real AWS credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# Use production S3 bucket names
S3_WORKFLOWS_BUCKET=prod-crm-workflows
S3_EXPORTS_BUCKET=prod-crm-exports
S3_ATTACHMENTS_BUCKET=prod-crm-attachments

# Use production SQS queue URL
SQS_JOB_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/crm-jobs-queue
```

---

## Performance

### Database Optimization

- **Indexes**: All models have compound indexes for common queries
- **Connection Pooling**: Mongoose default (100 connections)
- **Query Projection**: Select only needed fields
- **Aggregation**: Use for complex analytics queries

### Caching (Coming Soon)

- **Redis**: Cache frequently accessed data
- **In-Memory**: LRU cache for hot data

### Rate Limiting

**Current**: 100 requests per 15 minutes per IP

**Adjust** in `utils/rateLimit.js`:

```javascript
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
```

---

## Security

### Security Measures

- **Helmet**: Sets secure HTTP headers
- **CORS**: Restricts origins to frontend URL
- **Rate Limiting**: Prevents brute-force attacks
- **JWT Expiry**: Tokens expire after 24 hours
- **Password Hashing**: bcrypt with salt rounds = 10
- **Input Validation**: Zod schemas validate all inputs
- **NoSQL Injection Prevention**: Mongoose sanitizes queries
- **HTTPS**: Use in production
- **Environment Variables**: Never commit sensitive data

### Future Enhancements

- **API Key Authentication**: For server-to-server
- **OAuth 2.0**: Google, Microsoft login
- **2FA**: Two-factor authentication
- **IP Whitelisting**: Restrict access by IP
- **Request Signing**: HMAC signatures

---

## License

MIT License. See [LICENSE](../LICENSE).

---

<div align="center">

**[⬆ back to top](#campaign-flux--server)**

Built with ❤️ using Node.js + Express + MongoDB

</div>
