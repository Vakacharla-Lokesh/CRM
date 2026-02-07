# CRM Backend API Documentation

## Overview
This is a comprehensive CRM (Customer Relationship Management) backend API built with Express.js and MongoDB. The API implements Role-Based Access Control (RBAC) with three user roles: `user`, `admin`, and `super_admin`.

## Features
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control (RBAC)** - Three-tier permission system
- **Multi-Tenant Support** - Data isolation between tenants
- **Comprehensive Validation** - Request validation using Zod
- **RESTful API Design** - Standard HTTP methods and status codes
- **Error Handling** - Centralized error handling middleware

## User Roles & Permissions

### User
- Can view and manage their own leads, organizations, deals
- Can add calls, comments, and attachments to leads
- Cannot delete resources (except their own data)

### Admin
- All user permissions
- Can manage users within their tenant
- Can delete most resources
- Cannot manage tenants or access other tenant's data

### Super Admin
- Full system access
- Can manage all tenants
- Can access data across all tenants
- Can manage all users and resources

## API Endpoints

### Authentication (`/api/auth`)
- **POST** `/register` - Register a new user
- **POST** `/login` - Login user
- **POST** `/logout` - Logout user
- **POST** `/refresh` - Refresh JWT token
- **GET** `/profile` - Get current user profile (requires auth)

### Users (`/api/users`)
All routes require authentication and admin/super_admin role unless specified.

- **GET** `/` - Get all users (filtered by tenant for admin)
- **GET** `/:id` - Get user by ID
- **POST** `/` - Create a new user
- **PUT** `/:id` - Update user
- **DELETE** `/:id` - Delete user
- **GET** `/tenant/:tenantId` - Get users by tenant
- **PATCH** `/:id/role` - Update user role (super_admin only)

### Tenants (`/api/tenants`)
All routes require super_admin role.

- **GET** `/` - Get all tenants
- **GET** `/:id` - Get tenant by ID
- **POST** `/` - Create a new tenant
- **PUT** `/:id` - Update tenant
- **DELETE** `/:id` - Delete tenant

### Organizations (`/api/organizations`)
- **GET** `/` - Get all organizations (filtered by tenant)
- **GET** `/:id` - Get organization by ID
- **POST** `/` - Create organization
- **PUT** `/:id` - Update organization
- **DELETE** `/:id` - Delete organization (admin/super_admin)
- **GET** `/tenant/:tenantId` - Get organizations by tenant
- **GET** `/user/:userId` - Get organizations by user

### Leads (`/api/leads`)
- **GET** `/` - Get all leads (filtered by tenant)
- **GET** `/:id` - Get lead by ID
- **POST** `/` - Create lead
- **PUT** `/:id` - Update lead
- **DELETE** `/:id` - Delete lead (admin/super_admin)
- **GET** `/tenant/:tenantId` - Get leads by tenant
- **GET** `/user/:userId` - Get leads by user
- **GET** `/organization/:organizationId` - Get leads by organization
- **PATCH** `/:id/status` - Update lead status
- **PATCH** `/:id/score` - Update lead score

### Deals (`/api/deals`)
- **GET** `/` - Get all deals (filtered by tenant)
- **GET** `/:id` - Get deal by ID
- **POST** `/` - Create deal
- **PUT** `/:id` - Update deal
- **DELETE** `/:id` - Delete deal (admin/super_admin)
- **GET** `/tenant/:tenantId` - Get deals by tenant
- **GET** `/user/:userId` - Get deals by user
- **GET** `/lead/:leadId` - Get deals by lead
- **GET** `/organization/:organizationId` - Get deals by organization
- **PATCH** `/:id/status` - Update deal status

### Calls (`/api/calls`)
- **GET** `/` - Get all calls
- **GET** `/:id` - Get call by ID
- **POST** `/` - Create call
- **PUT** `/:id` - Update call
- **DELETE** `/:id` - Delete call (admin/super_admin)
- **GET** `/lead/:leadId` - Get calls by lead

### Comments (`/api/comments`)
- **GET** `/` - Get all comments
- **GET** `/:id` - Get comment by ID
- **POST** `/` - Create comment
- **PUT** `/:id` - Update comment
- **DELETE** `/:id` - Delete comment (admin/super_admin)
- **GET** `/lead/:leadId` - Get comments by lead

### Attachments (`/api/attachments`)
- **GET** `/` - Get all attachments
- **GET** `/:id` - Get attachment by ID
- **POST** `/` - Create attachment (base64 encoded file)
- **DELETE** `/:id` - Delete attachment (admin/super_admin)
- **GET** `/lead/:leadId` - Get attachments by lead
- **GET** `/:id/download` - Download attachment file

## Request/Response Examples

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "userEmail": "john@example.com",
  "mobile": "9876543210",
  "role": "user",
  "password": "securepassword123",
  "tenantId": "tenant-uuid"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "userEmail": "john@example.com",
  "password": "securepassword123",
  "tenantId": "tenant-uuid"
}
```

### Create Lead
```http
POST /api/leads
Authorization: Bearer <token>
Content-Type: application/json

{
  "leadFirstName": "Jane",
  "leadLastName": "Smith",
  "leadEmail": "jane@example.com",
  "leadStatus": "New",
  "organizationId": "org-uuid",
  "tenantId": "tenant-uuid"
}
```

## Environment Variables
Create a `.env` file with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/crm
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start MongoDB server

4. Run the application:
```bash
npm start
```

## Error Responses
The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": [] // Optional array of validation errors
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Security Features

1. **JWT Authentication** - All protected routes require valid JWT token
2. **Password Hashing** - Passwords are hashed using bcrypt
3. **Role-Based Access Control** - Fine-grained permission system
4. **Tenant Isolation** - Automatic filtering of data by tenant
5. **Input Validation** - All inputs validated using Zod schemas
6. **Security Headers** - Helmet middleware for security headers
7. **CORS Configuration** - Configurable CORS settings

## Project Structure

```
backend/
├── controllers/        # Business logic for each resource
├── db/                # Database initialization
├── middlewares/       # Auth, RBAC, validation, error handling
├── models/            # Mongoose schemas
├── routes/            # API route definitions
├── validators/        # Zod validation schemas
├── src/
│   └── server.js      # Express app configuration
└── index.js           # Entry point
```

## Middleware Stack

1. **helmet()** - Security headers
2. **cors()** - Cross-origin resource sharing
3. **express.json()** - JSON body parser
4. **authenticate** - JWT verification
5. **authorize(roles)** - Role-based access control
6. **validate(schema)** - Request validation
7. **injectTenantFilter** - Automatic tenant filtering
8. **errorHandler** - Centralized error handling

## Best Practices Implemented

- **Separation of Concerns** - Controllers, routes, and models are separated
- **DRY Principle** - Reusable middleware and validation schemas
- **Error Handling** - Comprehensive error handling with appropriate status codes
- **Security** - JWT, RBAC, input validation, and secure headers
- **Scalability** - Modular structure for easy extension
- **Code Quality** - Consistent naming conventions and structure

## Contributing
When adding new features:
1. Create appropriate controller in `/controllers`
2. Define routes in `/routes`
3. Add validation schemas in `/validators`
4. Update models if needed in `/models`
5. Register routes in `src/server.js`
6. Update this documentation

## License
ISC
