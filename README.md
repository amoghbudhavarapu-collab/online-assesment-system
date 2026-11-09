# Online Examination and Assessment System

A production-grade, secure, web-based examination platform built with Node.js, Express, MongoDB, and Mongoose, designed to conduct, manage, schedule, and evaluate examinations digitally with role-based access control (Admin, Teacher, Student).

---

## Key Features

- **Role-Based Access Control (RBAC):** Distinct permissions for Administrator, Teacher, and Student.
- **Robust Authentication & Session Management:**
  - Short-lived Access JWTs (15 min) + Long-lived Refresh Tokens (7 days).
  - HttpOnly, Secure, SameSite=Strict cookies.
  - Refresh token hashing with bcrypt and automatic rotation.
  - Breach detection (revokes all sessions on reuse attempt).
- **Reusable Question Bank:**
  - Supports 4 objective types: Multiple Choice (MCQ), Multiple Select, True/False, and Fill in the Blanks with alternative spellings.
  - Historical integrity protection (questions are locked from modification once used in published exams).
- **Examination Management & Immutability:**
  - Teachers schedule examinations with duration, start & end windows, and passing marks.
  - Questions are snapshotted at publication to protect historical evaluations.
- **Student Examination Engine:**
  - Auto-saving answers on every selection.
  - Server-enforced countdown timer and deadline (frontend timers are never trusted).
  - Single attempt per student enforced by MongoDB compound unique index.
  - Automatic submission and evaluation upon time expiry.
- **Automatic Objective Evaluation:**
  - Instant scoring with configurable negative marking.
  - Pass/fail classification and percentage calculation.
  - Configurable result publication (immediate automatic or manual release).
- **Dashboards & Analytics:**
  - Tailored dashboard metrics for Admin, Teacher, and Student.
  - CSV export for examination result reporting.
- **Security & Quality:**
  - Helmet security headers, CORS origin allowlist, NoSQL injection protection.
  - Rate limiting (strict on auth endpoints, general on API).
  - Centralized error handling with standardized JSON response schema.
  - Ownership assertions (returns 404 instead of 403 to prevent resource enumeration).

---

## Tech Stack

- **Runtime:** Node.js (Active LTS v24/v22/v20)
- **Framework:** Express.js 5
- **Database:** MongoDB (Atlas or Local)
- **ODM:** Mongoose 8
- **Validation:** Zod
- **Security:** bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit

---

## Directory Structure

```text
online-assessment-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js           # Zod validated configuration
│   │   │   └── db.js            # Mongoose database connector
│   │   ├── middleware/
│   │   │   ├── requireAuth.js   # JWT verification middleware
│   │   │   ├── roleGuard.js     # Role-based authorization
│   │   │   ├── validate.js      # Zod validation middleware factory
│   │   │   └── errorHandler.js  # Standard JSON error response
│   │   ├── modules/
│   │   │   ├── auth/            # Auth controller, service, routes, schemas
│   │   │   ├── users/           # User management
│   │   │   ├── questions/       # Question bank CRUD
│   │   │   ├── examinations/    # Examination scheduling & lifecycle
│   │   │   ├── attempts/        # Student examination attempts & answers
│   │   │   ├── results/         # Results viewing, publishing, CSV export
│   │   │   └── dashboard/       # Role-specific analytics
│   │   ├── services/
│   │   │   ├── evaluation.service.js # Objective grading engine
│   │   │   └── email.service.js      # Notification service
│   │   ├── utils/
│   │   │   ├── jwt.js           # Token creation & verification
│   │   │   ├── tokenCompare.js  # Timing-safe comparisons
│   │   │   ├── ownershipCheck.js# Resource ownership validator
│   │   │   └── mongoSanitize.js # NoSQL injection defense
│   │   ├── jobs/
│   │   │   └── examinationExpiry.job.js # Auto-submit cron job
│   │   ├── scripts/
│   │   │   └── seed.js          # Database seed script
│   │   ├── app.js               # Express application configuration
│   │   └── server.js            # Entry point & graceful shutdown
│   ├── postman/
│   │   ├── collection.json      # Complete Postman API collection
│   │   └── environment.json     # Postman environment template
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── docs/
│   ├── API_DOCUMENTATION.md     # Comprehensive API reference
│   └── DATABASE_SCHEMA.md       # Database models and indexes
├── .gitignore
├── .cursorignore
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- MongoDB instance running locally (e.g. `mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string.

### 2. Backend Setup
```bash
cd backend

# Install dependencies (already completed)
npm install

# Copy environment file
cp .env.example .env
```

Ensure your `.env` contains valid secrets (see `.env.example`).

### 3. Seed Database
Populate initial demo users, questions, and a sample examination:
```bash
npm run seed
```

Default credentials created by the seed script:
- **Administrator:** `admin@assessment.com` / `Password@123`
- **Teacher:** `teacher@assessment.com` / `Password@123`
- **Student:** `student@assessment.com` / `Password@123`

### 4. Run the Server
```bash
# Production mode
npm start

# Development mode (with live reload)
npm run dev
```

The server starts on port `5000` (or `PORT` specified in `.env`):
- **Health Check:** `GET http://localhost:5000/health`
- **Database Readiness:** `GET http://localhost:5000/ready`
- **API Root:** `http://localhost:5000/api/v1`

---

## Testing with Postman

1. Open Postman.
2. Import `backend/postman/collection.json`.
3. Import `backend/postman/environment.json`.
4. Select the environment **Online Examination System Environment**.
5. Run the **1. Authentication -> Login as Teacher / Student / Admin** requests. The test scripts will automatically capture and persist the `accessToken` and identifiers into your environment.

