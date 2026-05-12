# College ERP System

A production-grade MERN Stack College ERP system with Visitor Management, Enquiry Tracking, Admission Workflow, Department Routing, Fee Management, Registrar Module, and Monitoring Dashboard.

## Features

- **Common Login System** – All roles share a single login page with role-based redirect
- **18 Predefined Roles** – Super Admin, Admin, Receptionist, Counsellor, HOD, Accounts, Registrar, etc.
- **RBAC** – Flexible role-based access control with 20+ permission types
- **Reception Module** – 25 purpose categories for every type of college visitor
- **Anti-Tampering** – Original records locked after submission; modifications via Correction Request only
- **Case Workflow** – Complete digital journey from reception → counsellor → department → accounts → registrar
- **Immutable Timeline** – Append-only event log for every action
- **Version History** – All note/remark edits tracked with previous value, new value, editor, timestamp
- **PDF Receipts** – Visitor entry, fee receipt, admission confirmation, case summary
- **Audit Logs** – Every significant action logged with user, timestamp, and data changes
- **Reports** – Receptionist, counsellor, fee collection, staff performance reports with date range filters
- **Notifications** – Real-time notifications for case assignments, follow-ups, corrections
- **Soft Delete Only** – No hard deletes; all deletions audit logged

## Tech Stack

- **Frontend**: React 19 + Vite 8, Tailwind CSS 4, React Router, React Query, React Hook Form
- **Backend**: Node.js + Express.js, MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens), bcrypt password hashing
- **PDF**: PDFKit
- **File Uploads**: Multer
- **Security**: Helmet, CORS, express-rate-limit, express-mongo-sanitize

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)

### Setup

```bash
# Clone
git clone https://github.com/ritika8945/erp.git
cd erp

# Backend setup
cd server
cp .env.example ../.env.example  # Reference
npm install

# Create .env from .env.example and set your MONGODB_URI
# Default values work for local development

# Seed database
npm run seed

# Start backend
npm run dev

# Frontend setup (new terminal)
cd ../client
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `server/.env`:

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/college_erp | Database URL |
| JWT_ACCESS_SECRET | your-access-secret-key | JWT signing key |
| JWT_REFRESH_SECRET | your-refresh-secret-key | Refresh token key |
| ACCESS_TOKEN_EXPIRES_IN | 1h | Access token TTL |
| REFRESH_TOKEN_EXPIRES_IN | 7d | Refresh token TTL |
| BCRYPT_ROUNDS | 12 | Password hash rounds |
| CLIENT_URL | http://localhost:5173 | Frontend URL for CORS |

### Seed Credentials

After running `npm run seed`:

| Role | Username | Password |
|------|----------|----------|
| Super Admin | admin | Admin@123 |
| Receptionist | receptionist1 | Recep@123 |
| Sr. Receptionist | sr_receptionist | SrRecep@123 |
| Counsellor | counsellor1 | Couns@123 |
| Counselling Head | counselling_head | CounsH@123 |
| Dept Staff (CSE) | dept_staff_cse | Dept@123 |
| HOD (CSE) | hod_cse | HOD@123 |
| Accounts | accounts1 | Acct@123 |
| Accounts Head | accounts_head | AcctH@123 |
| Registrar Staff | registrar_staff1 | Reg@123 |
| Registrar | registrar | Registrar@123 |
| Admission Head | admission_head | AdmH@123 |
| Principal | principal | Principal@123 |
| Auditor | auditor | Auditor@123 |
| Event Coordinator | event_coord | Event@123 |
| Placement | placement1 | Place@123 |

## API Routes

| Prefix | Module |
|--------|--------|
| /api/auth | Login, logout, refresh token, change password |
| /api/users | User CRUD, password reset |
| /api/roles | Role management |
| /api/departments | Department CRUD |
| /api/courses | Course CRUD |
| /api/cases | Case CRUD, forwarding, notes, timeline, PDF |
| /api/correction-requests | Correction request workflow |
| /api/accounts | Fee structures, payments, installments |
| /api/registrar | Document checklist, upload, finalize admission |
| /api/reports | Dashboard stats, reports, audit logs |
| /api/notifications | User notifications |
| /api/settings | System settings, custom purpose categories |
| /api/permissions | Available permissions list |

## Workflow

1. **Reception** creates visitor entry → record is locked
2. **Receptionist** forwards to appropriate department/counsellor
3. **Counsellor** adds notes, sets lead temperature, follow-ups
4. **Department** reviews academic eligibility, adds remarks
5. **Accounts** creates fee structure, records payments
6. **Registrar** verifies documents, finalizes admission
7. Every step is logged in timeline and audit log

## Testing

```bash
# Backend tests
cd server && npm test

# Frontend build check
cd client && npm run build
```

## Scripts

```bash
# Backend
npm run dev          # Start with nodemon
npm start            # Production start
npm run seed         # Seed database
npm test             # Run tests

# Frontend
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```

## Project Structure

```
erp/
├── server/
│   ├── config/          # DB connection, permissions config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, validation, audit, upload
│   ├── models/          # Mongoose schemas (15+ models)
│   ├── routes/          # Express routes
│   ├── services/        # PDF generation service
│   ├── utils/           # Token, notification, timeline helpers
│   ├── tests/           # API tests
│   ├── index.js         # Server entry point
│   └── seed.js          # Database seeder
├── client/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Auth context
│   │   ├── pages/       # All page components
│   │   ├── services/    # API client with interceptors
│   │   └── App.jsx      # Routes and providers
│   └── index.html
└── README.md
```
