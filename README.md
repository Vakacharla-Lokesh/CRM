# CRM Platform

A full-stack, multi-tenant Customer Relationship Management (CRM) platform built with React and Express. Designed for sales and marketing teams to manage leads, deals, organizations, and campaigns — with offline support, role-based access control, and real-time analytics.

---

## Features

- **Lead Management** — Track and qualify leads with rich profiles, scoring (0–100), status tracking, and direct conversion to deals
- **Deal Pipeline** — Stage-based deal tracking with status updates, value management, and trend analytics
- **Organization Tracking** — Company profiles linked to leads with industry, size, and website data
- **Multi-Tenancy & RBAC** — Fully isolated tenant workspaces with three roles: `user`, `admin`, and `super_admin`
- **Call Logs** — Log inbound/outbound calls with status, duration, and notes
- **Comments & Activity** — Attach comments to leads with a full interaction audit trail
- **Attachments** — Upload and download files linked to leads
- **Analytics Dashboard** — Real-time metrics: lead trends, deal pipeline, conversion rates, revenue, organization stats
- **Bulk Operations** — Transactional create/update for leads, deals, organizations, comments, and calls in a single request
- **Offline Support** — IndexedDB-backed offline queue with auto-sync on reconnect via bulk API endpoints
- **Export** — CSV export for leads
- **Authentication** — JWT-based auth with Passport.js (local + JWT strategies), token refresh, and password reset

---

## Tech Stack

| Layer      | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | React 19, TypeScript, Vite 7                   |
| Styling    | Tailwind CSS v4, shadcn/ui, Radix UI           |
| Routing    | React Router DOM v7                            |
| Tables     | TanStack React Table v8                        |
| Charts     | Recharts                                       |
| Icons      | Lucide React                                   |
| Backend    | Node.js, Express v5                            |
| Database   | MongoDB, Mongoose v9                           |
| Auth       | Passport.js (local + JWT), jsonwebtoken, bcryptjs |
| Validation | Zod (server), TypeScript (client)              |
| Security   | Helmet, CORS, express-rate-limit               |
| Logging    | Morgan                                         |
| Dev Tools  | Nodemon, ESLint, TypeScript ESLint             |

---

## Monorepo Structure

```
/
├── client/          # React + TypeScript frontend (Vite)
├── server/          # Express + MongoDB backend
├── README.md        # This file
```

---

## Getting Started

### Prerequisites

- Node.js >= 20
- MongoDB (local or Atlas)

### Server

```bash
cd server
npm install
# create .env with DB_URI and JWT_SECRET
npm run dev
```

### Client

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3000` (or whichever port you configure).

---

## Environment Variables (Server)

| Variable     | Description                    |
|--------------|--------------------------------|
| `DB_URI`     | MongoDB connection string      |
| `JWT_SECRET` | Secret key for JWT signing     |
| `PORT`       | Server port (optional)         |