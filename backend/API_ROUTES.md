# API Routes Summary

## Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register a new user |
| POST | `/login` | Public | User login |
| POST | `/logout` | Public | User logout |
| POST | `/refresh` | Public | Refresh JWT token |
| GET | `/profile` | Authenticated | Get current user profile |

## User Routes (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin, Super Admin | Get all users (tenant filtered) |
| GET | `/:id` | Admin, Super Admin | Get user by ID |
| POST | `/` | Admin, Super Admin | Create new user |
| PUT | `/:id` | Admin, Super Admin | Update user |
| DELETE | `/:id` | Admin, Super Admin | Delete user |
| GET | `/tenant/:tenantId` | Admin, Super Admin | Get users by tenant |
| PATCH | `/:id/role` | Super Admin | Update user role |

## Tenant Routes (`/api/tenants`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Super Admin | Get all tenants |
| GET | `/:id` | Super Admin | Get tenant by ID |
| POST | `/` | Super Admin | Create new tenant |
| PUT | `/:id` | Super Admin | Update tenant |
| DELETE | `/:id` | Super Admin | Delete tenant |

## Organization Routes (`/api/organizations`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | User, Admin, Super Admin | Get all organizations (tenant filtered) |
| GET | `/:id` | User, Admin, Super Admin | Get organization by ID |
| POST | `/` | User, Admin, Super Admin | Create new organization |
| PUT | `/:id` | User, Admin, Super Admin | Update organization |
| DELETE | `/:id` | Admin, Super Admin | Delete organization |
| GET | `/tenant/:tenantId` | Admin, Super Admin | Get organizations by tenant |
| GET | `/user/:userId` | User, Admin, Super Admin | Get organizations by user |

## Lead Routes (`/api/leads`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | User, Admin, Super Admin | Get all leads (tenant filtered) |
| GET | `/:id` | User, Admin, Super Admin | Get lead by ID |
| POST | `/` | User, Admin, Super Admin | Create new lead |
| PUT | `/:id` | User, Admin, Super Admin | Update lead |
| DELETE | `/:id` | Admin, Super Admin | Delete lead |
| GET | `/tenant/:tenantId` | Admin, Super Admin | Get leads by tenant |
| GET | `/user/:userId` | User, Admin, Super Admin | Get leads by user |
| GET | `/organization/:organizationId` | User, Admin, Super Admin | Get leads by organization |
| PATCH | `/:id/status` | User, Admin, Super Admin | Update lead status |
| PATCH | `/:id/score` | User, Admin, Super Admin | Update lead score |

## Deal Routes (`/api/deals`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | User, Admin, Super Admin | Get all deals (tenant filtered) |
| GET | `/:id` | User, Admin, Super Admin | Get deal by ID |
| POST | `/` | User, Admin, Super Admin | Create new deal |
| PUT | `/:id` | User, Admin, Super Admin | Update deal |
| DELETE | `/:id` | Admin, Super Admin | Delete deal |
| GET | `/tenant/:tenantId` | Admin, Super Admin | Get deals by tenant |
| GET | `/user/:userId` | User, Admin, Super Admin | Get deals by user |
| GET | `/lead/:leadId` | User, Admin, Super Admin | Get deals by lead |
| GET | `/organization/:organizationId` | User, Admin, Super Admin | Get deals by organization |
| PATCH | `/:id/status` | User, Admin, Super Admin | Update deal status |

## Call Routes (`/api/calls`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | User, Admin, Super Admin | Get all calls |
| GET | `/:id` | User, Admin, Super Admin | Get call by ID |
| POST | `/` | User, Admin, Super Admin | Create new call |
| PUT | `/:id` | User, Admin, Super Admin | Update call |
| DELETE | `/:id` | Admin, Super Admin | Delete call |
| GET | `/lead/:leadId` | User, Admin, Super Admin | Get calls by lead |

## Comment Routes (`/api/comments`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | User, Admin, Super Admin | Get all comments |
| GET | `/:id` | User, Admin, Super Admin | Get comment by ID |
| POST | `/` | User, Admin, Super Admin | Create new comment |
| PUT | `/:id` | User, Admin, Super Admin | Update comment |
| DELETE | `/:id` | Admin, Super Admin | Delete comment |
| GET | `/lead/:leadId` | User, Admin, Super Admin | Get comments by lead |

## Attachment Routes (`/api/attachments`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | User, Admin, Super Admin | Get all attachments |
| GET | `/:id` | User, Admin, Super Admin | Get attachment by ID |
| POST | `/` | User, Admin, Super Admin | Create new attachment |
| DELETE | `/:id` | Admin, Super Admin | Delete attachment |
| GET | `/lead/:leadId` | User, Admin, Super Admin | Get attachments by lead |
| GET | `/:id/download` | User, Admin, Super Admin | Download attachment file |

## Health Check
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/health` | Public | API health check |

## Common Patterns

### Authentication
All authenticated routes require the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

### Tenant Filtering
- **Users** can only access data from their own tenant
- **Admins** can access all data within their tenant
- **Super Admins** can access data across all tenants

### Response Format
Success responses:
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

Error responses:
```json
{
  "message": "Error description",
  "errors": [ ... ]
}
```

### Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Resource Hierarchies

### Lead-Related Resources
```
Lead
├── Calls
├── Comments
└── Attachments
```

### Deal-Related Resources
```
Deal
├── Lead (reference)
└── Organization (reference)
```

### Tenant Hierarchy
```
Tenant
├── Users
├── Organizations
├── Leads
└── Deals
```
