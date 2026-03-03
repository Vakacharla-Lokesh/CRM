# Campaign Flux CRM

<div align="center">

**A modern, full-stack CRM platform built with the MERN stack**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Enterprise-grade customer relationship management with multi-tenancy, offline support, and advanced analytics.

[Features](#features) • [Architecture](#architecture) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Campaign Flux is a production-ready CRM platform designed for sales and marketing teams to manage leads, deals, organizations, and customer interactions. Built with scalability and offline-first principles, it supports multi-tenant architecture with role-based access control, real-time analytics, and bulk operations.

### Key Highlights

- 🏢 **Multi-Tenant** — Complete workspace isolation with tenant-scoped data
- 🔐 **Advanced RBAC** — Fine-grained permission system with custom roles
- 📱 **Offline-First** — IndexedDB-backed queue with automatic sync
- 📊 **Real-Time Analytics** — Dashboard with trends, conversion metrics, and KPIs
- ⚡ **Bulk Operations** — Transactional batch create/update/delete
- 🔄 **Event-Driven** — AWS SQS, SNS, Lambda for async workflows
- 🗄️ **Enterprise Storage** — AWS S3 (LocalStack for development)
- 🚀 **Production-Ready** — Docker, clustering, rate limiting, security hardening

---

## Features

### Core Functionality

#### Lead Management

- Rich lead profiles with scoring (0-100), status tracking, and source attribution
- Direct conversion from lead to deal
- Linked to organizations with relationship tracking
- Call logs, comments, and file attachments
- Activity timeline and interaction history
- Advanced search with full-text indexing

#### Deal Pipeline

- Stage-based deal tracking (Prospecting → Negotiation → Closed)
- Deal value and expected close date management
- Win/loss tracking with reason codes
- Pipeline analytics and conversion rates
- Deal trend visualization

#### Organization Tracking

- Company profiles with industry, size, and website
- Multiple contacts and leads per organization
- Organization-level analytics
- Industry benchmarking and statistics

#### Analytics Dashboard

- Real-time metrics: leads by status, deals by stage, conversion rates
- Time-series trends with configurable periods (7/30/90 days)
- Revenue tracking and forecasting
- Top organizations by deal value
- Lead score distribution and quality metrics
- User performance leaderboards

### Enterprise Features

#### Multi-Tenancy & RBAC

- Complete data isolation per tenant
- Three system roles: `user`, `admin`, `super_admin`
- Custom role creation with 50+ granular permissions
- Permission categories: leads, deals, organizations, users, roles, analytics, calls, comments, attachments, bulk operations
- Tenant-level settings and customization

#### Offline Support

- IndexedDB-backed offline queue
- Automatic sync on reconnection
- Batch operations via bulk API endpoints
- Idempotency key enforcement
- Retry logic with exponential backoff
- Sync status monitoring

#### Bulk Operations

- Transactional create/update/delete for:
  - Leads (up to 1000 per request)
  - Deals (up to 500 per request)
  - Organizations (up to 500 per request)
  - Comments and calls
- CSV import/export
- Background processing via SQS
- Validation and error reporting

#### AWS Integration

- **S3** — File storage with presigned URLs
- **SQS** — Async job processing and workflow triggers
- **SNS** — Event notifications and pub/sub messaging
- **Lambda** — Serverless workers for background jobs
- **DynamoDB** — Job state tracking and distributed locks
- **EventBridge** — Scheduled tasks and cron jobs
- **LocalStack** — Local development environment

### Security & Performance

- JWT-based authentication with refresh tokens
- Passport.js strategies (local + JWT)
- Password reset with OTP validation
- Rate limiting (100 requests per 15 minutes per IP)
- Request validation with Zod schemas
- MongoDB transactions for data consistency
- Indexed queries for performance
- Atlas Search for fuzzy matching
- PM2 clustering for horizontal scaling
- Helmet.js security headers

---

## Tech Stack

### Frontend

| Technology         | Version | Purpose                      |
| ------------------ | ------- | ---------------------------- |
| **React**          | 19      | UI framework                 |
| **TypeScript**     | 5.7     | Type safety                  |
| **Vite**           | 7       | Build tool & dev server      |
| **React Router**   | 7       | Client-side routing          |
| **Tailwind CSS**   | 4       | Utility-first styling        |
| **shadcn/ui**      | Latest  | Component library (Radix UI) |
| **TanStack Table** | 8       | Advanced data tables         |
| **TanStack Query** | 5       | Server state management      |
| **Recharts**       | 2       | Data visualization           |
| **Lucide React**   | Latest  | Icon library                 |
| **Sonner**         | Latest  | Toast notifications          |
| **IndexedDB**      | Native  | Offline storage              |

### Backend

| Technology             | Version | Purpose               |
| ---------------------- | ------- | --------------------- |
| **Node.js**            | 20+     | Runtime environment   |
| **Express**            | 5       | Web framework         |
| **MongoDB**            | 7       | Database              |
| **Mongoose**           | 9       | ODM                   |
| **Passport.js**        | Latest  | Authentication        |
| **JWT**                | Latest  | Token-based auth      |
| **Zod**                | 3       | Schema validation     |
| **Bcrypt.js**          | 2       | Password hashing      |
| **Helmet**             | Latest  | Security headers      |
| **Morgan**             | Latest  | HTTP logging          |
| **CORS**               | Latest  | Cross-origin requests |
| **express-rate-limit** | Latest  | Rate limiting         |
| **Nodemailer**         | Latest  | Email service         |
| **Fast-CSV**           | Latest  | CSV processing        |

### AWS Services (LocalStack Compatible)

| Service         | Purpose                    |
| --------------- | -------------------------- |
| **S3**          | File storage and retrieval |
| **SQS**         | Async job queue            |
| **SNS**         | Event notifications        |
| **Lambda**      | Serverless workers         |
| **DynamoDB**    | Job tracking               |
| **EventBridge** | Scheduled tasks            |

### DevOps & Tools

| Tool               | Purpose                      |
| ------------------ | ---------------------------- |
| **Docker**         | Containerization             |
| **Docker Compose** | LocalStack orchestration     |
| **PM2**            | Process manager & clustering |
| **ESLint**         | Code linting                 |
| **Prettier**       | Code formatting              |
| **Git**            | Version control              |

---

## Project Structure

```
campaign-flux/
├── client/                      # React + TypeScript frontend
│   ├── public/
│   │   └── crm.png             # App logo
│   ├── src/
│   │   ├── main.tsx            # App entry point
│   │   ├── App.tsx             # Root component with routing
│   │   ├── components/         # React components
│   │   │   ├── common/         # Shared UI components
│   │   │   ├── dashboard/      # Dashboard-specific components
│   │   │   ├── layout/         # Layout components (Sidebar, Header)
│   │   │   ├── leads/          # Lead management components
│   │   │   ├── organizations/  # Organization components
│   │   │   ├── users/          # User management components
│   │   │   ├── tenants/        # Tenant management (super admin)
│   │   │   ├── modals/         # Modal dialogs
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── context/            # React Context providers
│   │   │   ├── AppContext.tsx  # Auth, user, online status
│   │   │   ├── OfflineContext.tsx # Offline queue provider
│   │   │   ├── NotificationContext.tsx # WebSocket notifications
│   │   │   └── SocketContext.tsx # Socket.io client
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.ts      # Authentication hook
│   │   │   ├── useLeadData.ts  # Lead data management
│   │   │   ├── useDealData.ts  # Deal data management
│   │   │   ├── useOfflineManager.ts # Offline queue logic
│   │   │   └── ...             # 30+ custom hooks
│   │   ├── pages/              # Route pages
│   │   │   ├── dashboardPage.tsx
│   │   │   ├── leadsPage.tsx
│   │   │   ├── dealsPage.tsx
│   │   │   ├── organizationsPage.tsx
│   │   │   ├── usersPage.tsx
│   │   │   ├── tenantsPage.tsx
│   │   │   ├── loginPage.tsx
│   │   │   └── signupPage.tsx
│   │   ├── services/           # API client layer
│   │   │   ├── api/            # API modules
│   │   │   │   ├── core.ts     # Axios instance & interceptors
│   │   │   │   ├── auth.api.ts # Auth endpoints
│   │   │   │   ├── leads.api.ts # Lead endpoints
│   │   │   │   ├── deals.api.ts # Deal endpoints
│   │   │   │   └── ...         # More API modules
│   │   │   └── ...
│   │   ├── types/              # TypeScript types & interfaces
│   │   ├── utils/              # Utility functions
│   │   ├── offline/            # Offline sync utilities
│   │   └── router/             # Routing configuration
│   ├── index.html              # HTML entry point
│   ├── package.json            # Frontend dependencies
│   ├── tsconfig.json           # TypeScript config
│   ├── vite.config.ts          # Vite configuration
│   ├── tailwind.config.js      # Tailwind CSS config
│   └── README.md               # Frontend documentation
│
├── server/                      # Node.js + Express backend
│   ├── src/
│   │   ├── index.js            # Server entry point
│   │   ├── server.js           # Express app setup
│   │   ├── config/             # Configuration
│   │   │   └── passport.js     # Passport strategies
│   │   ├── db/                 # Database connection
│   │   │   └── initDb.js       # Mongoose initialization
│   │   ├── routes/             # API routes
│   │   │   ├── authRoutes.js   # /api/auth
│   │   │   ├── leadRoutes.js   # /api/leads
│   │   │   ├── dealRoutes.js   # /api/deals
│   │   │   ├── organizationRoutes.js # /api/organizations
│   │   │   ├── userRoutes.js   # /api/users
│   │   │   ├── tenantRoutes.js # /api/tenants
│   │   │   ├── callRoutes.js   # /api/calls
│   │   │   ├── commentRoutes.js # /api/comments
│   │   │   ├── attachmentRoutes.js # /api/attachments
│   │   │   ├── analyticsRoutes.js # /api/analytics
│   │   │   ├── bulkRoutes.js   # /api/bulk
│   │   │   ├── roleRoutes.js   # /api/roles
│   │   │   └── ...
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── leadController.js
│   │   │   ├── dealController.js
│   │   │   └── ...             # One controller per route file
│   │   ├── models/             # Mongoose models
│   │   │   ├── userModel.js    # Users collection
│   │   │   ├── leadModel.js    # Leads collection
│   │   │   ├── dealModel.js    # Deals collection
│   │   │   ├── organizationModel.js # Organizations collection
│   │   │   ├── tenantModel.js  # Tenants collection
│   │   │   ├── roleModel.js    # Roles collection
│   │   │   └── ...             # 10+ models
│   │   ├── middlewares/        # Express middleware
│   │   │   ├── auth.js         # JWT authentication
│   │   │   ├── rbac.js         # Permission checks
│   │   │   ├── validate.js     # Zod validation
│   │   │   └── errorHandler.js # Global error handler
│   │   ├── validators/         # Zod schemas
│   │   │   ├── authValidator.js
│   │   │   ├── leadsValidator.js
│   │   │   └── ...
│   │   ├── services/           # Business logic
│   │   │   ├── aws/            # AWS service integrations
│   │   │   │   ├── awsClient.js # SDK clients
│   │   │   │   ├── s3Manager.js # S3 operations
│   │   │   │   ├── queue/      # SQS queue service
│   │   │   │   └── lambdas/    # Lambda handlers
│   │   │   ├── emailService.js # Nodemailer
│   │   │   └── ...
│   │   ├── workers/            # Background job workers
│   │   │   ├── workflowWorker.js
│   │   │   ├── exportWorker.js
│   │   │   └── leadReminderWorker.js
│   │   ├── modules/            # Feature modules
│   │   │   ├── jobs/           # Job registry
│   │   │   └── ...
│   │   ├── utils/              # Utility functions
│   │   │   ├── rateLimit.js    # Rate limiter config
│   │   │   ├── logger.js       # Winston logger
│   │   │   └── ...
│   │   └── scripts/            # Seed scripts
│   │       ├── seedTenants.js
│   │       ├── seedUsers.js
│   │       └── seedRoles.js
│   ├── package.json            # Backend dependencies
│   ├── .env.example            # Environment template
│   └── README.md               # Backend documentation
│
├── docker-compose.yml          # LocalStack configuration
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
└── README.md                   # This file
```

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   React 19   │  │ TypeScript   │  │  Vite Build  │          │
│  │   + Hooks    │  │  + Zod Val   │  │   + HMR      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
│                   ┌────────▼────────┐                           │
│                   │  IndexedDB      │                           │
│                   │  Offline Queue  │                           │
│                   └────────┬────────┘                           │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS / JWT
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                      APPLICATION TIER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Express 5 + Middleware Stack                 │   │
│  │  Helmet → Morgan → CORS → Rate Limit → Auth → RBAC       │   │
│  └──────────────────────────────────────────────────────────┘   │
│         │                                                        │
│  ┌──────▼─────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Controllers  │  │   Services   │  │  Validators  │        │
│  │   (REST API)   │──│  (Business)  │──│    (Zod)     │        │
│  └────────────────┘  └──────────────┘  └──────────────┘        │
│         │                    │                                   │
└─────────┼────────────────────┼───────────────────────────────────┘
          │                    │
          │                    └──────────────┐
          │                                   │
┌─────────▼────────────────────┐  ┌───────────▼──────────────────┐
│      DATABASE TIER           │  │       AWS SERVICES           │
│  ┌────────────────────────┐  │  │  ┌────────────────────────┐ │
│  │   MongoDB Atlas        │  │  │  │   S3 (File Storage)    │ │
│  │   - Replica Set        │  │  │  │   SQS (Job Queue)      │ │
│  │   - Transactions       │  │  │  │   SNS (Notifications)  │ │
│  │   - Atlas Search       │  │  │  │   Lambda (Workers)     │ │
│  │   - Indexes            │  │  │  │   DynamoDB (Job Store) │ │
│  └────────────────────────┘  │  │  │   EventBridge (Cron)   │ │
│                               │  │  └────────────────────────┘ │
│                               │  │  LocalStack for dev         │
└───────────────────────────────┘  └─────────────────────────────┘
```

### Data Flow

#### 1. **User Request Flow**

```
User Action → React Component → Custom Hook → API Service →
Backend Route → Middleware Chain → Controller → Service Layer →
MongoDB → Response → Hook State Update → UI Re-render
```

#### 2. **Authentication Flow**

```
Login Form → POST /api/auth/login → Passport Local Strategy →
Password Verify → JWT Sign → Store Token (localStorage) →
Set Auth Header (Axios Interceptor) → Protected Routes
```

#### 3. **Offline Sync Flow**

```
Offline Action → addToQueue() → IndexedDB Storage →
Network Restored → syncQueue() → Batch API Calls →
Bulk Endpoints → MongoDB Transactions → Update UI →
Clear Queue
```

#### 4. **Bulk Operation Flow**

```
CSV Import → Parse Data → Validate with Zod →
POST /api/bulk/:entity/create → Start Transaction →
Insert Documents → Commit → Return Results →
Update Frontend State
```

#### 5. **Async Job Flow**

```
Trigger Event → SQS Queue Message → Lambda Invocation →
Worker Process → DynamoDB Job Tracking → S3 Storage →
SNS Notification → Frontend Update (WebSocket)
```

### Multi-Tenant Architecture

Every request is scoped to a tenant:

1. **JWT Payload** includes `tenantId`
2. **RBAC Middleware** injects `req.tenantFilter = { tenantId }`
3. **Controllers** apply filter to all queries
4. **Super Admin** bypasses filter (sees all tenants)

### Permission System

```
Role (e.g., "Sales Manager")
  └─→ Permissions Array [
        "leads:read",
        "leads:write",
        "deals:read",
        "analytics:read"
      ]

Middleware: requirePermission('leads:write')
  └─→ Checks if user's role has permission
  └─→ Returns 403 if not authorized
```

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.x ([Download](https://nodejs.org/))
- **MongoDB** >= 7.x ([Atlas](https://www.mongodb.com/cloud/atlas) or [Local](https://www.mongodb.com/try/download/community))
- **Docker** (optional, for LocalStack) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/campaign-flux.git
cd campaign-flux
```

### 2. Install Dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd ../client
npm install
```

### 3. Start LocalStack (Optional)

For AWS service emulation in development:

```bash
# From project root
docker-compose up -d

# Verify LocalStack is running
docker ps | grep localstack
```

This starts LocalStack on `http://localhost:4566` with S3, SQS, SNS, Lambda, DynamoDB, and EventBridge.

---

## Configuration

### Server Environment Variables

Create `server/.env`:

```env
# Database
DB_URI=mongodb://localhost:27017/campaign-flux
# Or MongoDB Atlas:
# DB_URI=mongodb+srv://username:password@cluster.mongodb.net/campaign-flux?retryWrites=true&w=majority

# JWT Secret (generate with: openssl rand -base64 64)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server
PORT=3000
NODE_ENV=development

# AWS Configuration (LocalStack)
LOCALSTACK_ENDPOINT=http://localhost:4566
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# S3 Buckets
S3_WORKFLOWS_BUCKET=crm-workflows
S3_EXPORTS_BUCKET=crm-exports
S3_ATTACHMENTS_BUCKET=crm-attachments

# SQS Queues
SQS_JOB_QUEUE_URL=http://localhost:4566/000000000000/crm-jobs-queue

# Email (Optional - Nodemailer)
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

### Client Environment Variables

Create `client/.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## Development

### Start Development Servers

#### Terminal 1: Backend

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3000`

#### Terminal 2: Frontend

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173`

#### Terminal 3: LocalStack (if using AWS services)

```bash
docker-compose up
```

### Seed Database (Optional)

```bash
cd server

# Seed tenants
node src/scripts/seedTenants.js --commit

# Seed roles
node src/scripts/seedRoles.js --commit

# Seed users
node src/scripts/seedUsers.js --commit
```

### Create Super Admin

```bash
# Register via API or use MongoDB shell
POST http://localhost:3000/api/auth/register
{
  "firstName": "Admin",
  "lastName": "User",
  "userEmail": "admin@example.com",
  "password": "SecurePass123!",
  "tenantName": "ACME Corp",
  "role": "super_admin"
}
```

### Access the Application

1. Open browser to `http://localhost:5173`
2. Login with your credentials
3. Navigate to Dashboard

---

## Deployment

### Production Build

#### Backend

```bash
cd server
npm run build  # If using TypeScript
```

#### Frontend

```bash
cd client
npm run build
# Outputs to client/dist
```

### Deploy with PM2 (Backend)

```bash
# Install PM2 globally
npm install -g pm2

# Start server with clustering
pm2 start server/src/index.js -i max --name crm-api

# Monitor
pm2 monit

# Save process list
pm2 save

# Setup startup script
pm2 startup
```

### Deploy Frontend (Static Hosting)

#### Vercel

```bash
cd client
vercel --prod
```

#### Nginx

```bash
# Build static files
npm run build

# Copy to Nginx web root
sudo cp -r dist/* /var/www/html/

# Nginx config
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment (Coming Soon)

```bash
# Build images
docker build -t crm-client ./client
docker build -t crm-server ./server

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables (Production)

Ensure all production environment variables are set:

- **Backend**: Use AWS Secrets Manager or environment variables
- **Frontend**: Set `VITE_API_URL` to production API endpoint
- **Database**: Use MongoDB Atlas with connection pooling
- **AWS**: Use real AWS services (not LocalStack)

---

## API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication

All protected routes require a JWT token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication

- `POST /auth/register` - Create new user and tenant
- `POST /auth/login` - Authenticate and get JWT
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - Logout (client-side)
- `GET /auth/profile` - Get current user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP

#### Leads

- `GET /leads` - List all leads (paginated, filtered)
- `GET /leads/:id` - Get lead by ID
- `POST /leads` - Create new lead
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead
- `GET /leads/search?q=term` - Search leads
- `POST /leads/:id/convert` - Convert lead to deal

#### Deals

- `GET /deals` - List all deals
- `GET /deals/:id` - Get deal by ID
- `POST /deals` - Create new deal
- `PUT /deals/:id` - Update deal
- `DELETE /deals/:id` - Delete deal

#### Organizations

- `GET /organizations` - List all organizations
- `GET /organizations/:id` - Get organization by ID
- `POST /organizations` - Create organization
- `PUT /organizations/:id` - Update organization
- `DELETE /organizations/:id` - Delete organization

#### Bulk Operations

- `POST /bulk/leads/create` - Bulk create leads
- `POST /bulk/leads/update` - Bulk update leads
- `POST /bulk/deals/create` - Bulk create deals
- `POST /bulk/organizations/create` - Bulk create organizations

#### Analytics

- `GET /analytics/dashboard?period=7d` - Dashboard stats
- `GET /analytics/leads/trends` - Lead trend data
- `GET /analytics/deals/pipeline` - Deal pipeline metrics
- `GET /analytics/organizations/industry` - Organization stats by industry

For complete API documentation, see [server/README.md](server/README.md).

---

## Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

### E2E Tests (Coming Soon)

```bash
npm run test:e2e
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code Style

- **Backend**: Use Prettier with default settings
- **Frontend**: ESLint + Prettier with TypeScript rules
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Development Guidelines

- Write tests for new features
- Update documentation
- Ensure all tests pass
- Follow existing code patterns
- Add JSDoc comments for functions

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

---

## Support

For questions, issues, or feature requests:

- 📧 Email: support@campaignflux.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/campaign-flux/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/campaign-flux/discussions)

---

## Acknowledgments

Built with ❤️ using:

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/)
- [LocalStack](https://localstack.cloud/)

---

<div align="center">

**[⬆ back to top](#campaign-flux-crm)**

Made with 🚀 by the Campaign Flux Team

</div>
