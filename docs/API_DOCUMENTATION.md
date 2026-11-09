# Online Examination and Assessment System — API Documentation

**Base URL:** `http://localhost:5000/api/v1`

---

## Response Standards

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Paginated Success Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "fields": {
      "fieldName": ["Field error description"]
    }
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
- **Description:** Registers a new student account. Public registration never allows teacher or admin roles.
- **Auth Required:** No
- **Body:**
  ```json
  {
    "name": "Student Name",
    "email": "student@example.com",
    "password": "Password@123",
    "confirmPassword": "Password@123"
  }
  ```
- **Responses:**
  - `201 Created`: Returns `{ user, accessToken }` and sets `refreshToken` in HttpOnly Secure cookie.
  - `400 Validation Error`: If fields invalid or passwords mismatch.
  - `409 Conflict`: If email is already registered.

### `POST /api/v1/auth/login`
- **Description:** Authenticates user via email and password.
- **Auth Required:** No
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "Password@123"
  }
  ```
- **Responses:**
  - `200 OK`: Returns `{ user, accessToken }` and sets `refreshToken` cookie.
  - `401 Unauthorized`: Generic error message for invalid credentials.
  - `403 Forbidden`: If account is deactivated.

### `POST /api/v1/auth/refresh`
- **Description:** Exchanges valid refresh token (from HttpOnly cookie) for a fresh access token and rotates refresh token.
- **Auth Required:** No (reads cookie or body)
- **Responses:**
  - `200 OK`: Returns `{ user, accessToken }` and updates cookie.
  - `401 Unauthorized`: If token is missing, expired, or revoked.

### `POST /api/v1/auth/logout`
- **Description:** Revokes current session and clears refresh token cookie.
- **Auth Required:** No (clears cookie & revokes session)
- **Responses:**
  - `200 OK`: `{ success: true, data: { message: "Logged out successfully" } }`

### `GET /api/v1/auth/me`
- **Description:** Retrieves the authenticated user profile.
- **Auth Required:** Yes (Bearer token)
- **Responses:**
  - `200 OK`: `{ success: true, data: { user } }`
  - `401 Unauthorized`: Token missing or expired.

### `PATCH /api/v1/auth/change-password`
- **Description:** Changes user password and revokes all other active sessions.
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "currentPassword": "Password@123",
    "newPassword": "NewPassword@123",
    "confirmNewPassword": "NewPassword@123"
  }
  ```

---

## 2. User Management Endpoints

### `GET /api/v1/users`
- **Description:** Lists users with search and role filters.
- **Auth Required:** Yes
- **Minimum Role:** `admin`
- **Query Params:** `?page=1&limit=20&role=student&search=john`
- **Responses:** `200 OK` with paginated list of users.

### `GET /api/v1/users/:id`
- **Description:** Retrieves single user account details.
- **Auth Required:** Yes
- **Minimum Role:** `admin`

### `PATCH /api/v1/users/:id`
- **Description:** Updates user profile or role (prevents admin self-demotion).
- **Auth Required:** Yes
- **Minimum Role:** `admin`
- **Body:** `{ "name": "Prof Smith", "role": "teacher" }`

### `PATCH /api/v1/users/:id/status`
- **Description:** Activates or deactivates a user account.
- **Auth Required:** Yes
- **Minimum Role:** `admin`
- **Body:** `{ "isActive": false }`

### `GET /api/v1/users/me`
- **Description:** Returns profile of the current logged-in user.
- **Auth Required:** Yes

### `PATCH /api/v1/users/me`
- **Description:** Updates current user's own display name.
- **Auth Required:** Yes
- **Body:** `{ "name": "New Name" }`

---

## 3. Question Bank Endpoints

### `POST /api/v1/questions`
- **Description:** Creates a new question in the teacher's question bank.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`
- **Body Example (MCQ):**
  ```json
  {
    "questionText": "What is MongoDB?",
    "questionType": "MCQ",
    "options": ["Document Database", "Relational Database", "File Storage"],
    "correctAnswer": "Document Database",
    "marks": 2,
    "negativeMarks": 0.5,
    "difficulty": "easy",
    "category": "Databases"
  }
  ```
- **Responses:** `201 Created`

### `GET /api/v1/questions`
- **Description:** Lists questions created by teacher (admins view all).
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`
- **Query Params:** `?page=1&limit=20&category=Databases&difficulty=easy&questionType=MCQ`

### `GET /api/v1/questions/:id`
- **Description:** Retrieves question details.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin` (Ownership check enforced)

### `PATCH /api/v1/questions/:id`
- **Description:** Updates question if not locked in an active/completed examination.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

### `DELETE /api/v1/questions/:id`
- **Description:** Deletes question if not locked in an active examination.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

---

## 4. Examination Management Endpoints

### `POST /api/v1/examinations`
- **Description:** Creates a new examination and snapshots selected questions.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`
- **Body:**
  ```json
  {
    "title": "Computer Networks Final",
    "subject": "Networking",
    "instructions": "All questions mandatory.",
    "duration": 60,
    "passingMarks": 20,
    "negativeMarkingEnabled": true,
    "shuffleQuestions": false,
    "startTime": "2026-11-10T10:00:00.000Z",
    "endTime": "2026-11-10T12:00:00.000Z",
    "resultPublicationMode": "manual",
    "questionIds": ["64a1b2c3d4e5f6a7b8c9d0e1"]
  }
  ```

### `GET /api/v1/examinations`
- **Description:** Lists examinations. Students see assigned/public exams; teachers see their own; admin sees all.
- **Auth Required:** Yes

### `GET /api/v1/examinations/available`
- **Description:** Lists examinations available for the authenticated student with student attempt status (`eligible`, `in_progress`, `submitted`, `missed`).
- **Auth Required:** Yes
- **Role:** `student`

### `GET /api/v1/examinations/:id`
- **Description:** Retrieves examination details. Sanitizes correct answers for students.
- **Auth Required:** Yes

### `POST /api/v1/examinations/:id/publish`
- **Description:** Publishes a draft examination into scheduled or live status.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

### `POST /api/v1/examinations/:id/cancel`
- **Description:** Cancels an examination.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

---

## 5. Student Attempt Endpoints

### `POST /api/v1/examinations/:id/start`
- **Description:** Initiates or resumes student examination attempt. Calculates server-enforced deadline.
- **Auth Required:** Yes
- **Role:** `student`
- **Responses:**
  - `200 OK`: Returns attempt metadata, deadline, remaining seconds, and sanitized questions.
  - `400 Invalid Request`: If exam hasn't started, window has closed, or student already submitted.

### `GET /api/v1/attempts/:id`
- **Description:** Gets active attempt questions and current saved answers. Enforces server deadline.
- **Auth Required:** Yes (Attempt owner)

### `PUT /api/v1/attempts/:id/answers/:questionId`
- **Description:** Automatically saves student's answer as they interact with questions.
- **Auth Required:** Yes (Attempt owner)
- **Body:**
  ```json
  {
    "selectedAnswer": "Document Database",
    "isMarkedForReview": false
  }
  ```

### `POST /api/v1/attempts/:id/submit`
- **Description:** Finalizes examination attempt, triggers automatic evaluation, locks answers.
- **Auth Required:** Yes (Attempt owner)
- **Responses:** `200 OK` with evaluation summary.

### `GET /api/v1/attempts/my-attempts`
- **Description:** Lists all attempts made by the authenticated student.
- **Auth Required:** Yes
- **Role:** `student`

---

## 6. Results Endpoints

### `GET /api/v1/results/my-results`
- **Description:** Returns published examination results for the authenticated student.
- **Auth Required:** Yes
- **Role:** `student`

### `GET /api/v1/results/examination/:id`
- **Description:** Returns all student scores, statistics, and pass/fail counts for an examination.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

### `POST /api/v1/results/examination/:id/publish`
- **Description:** Publishes results so students can view scores and question reviews.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

### `GET /api/v1/results/examination/:id/export`
- **Description:** Exports examination results in CSV format.
- **Auth Required:** Yes
- **Minimum Role:** `teacher`, `admin`

### `GET /api/v1/results/:id`
- **Description:** Full breakdown of an individual attempt with question evaluation.
- **Auth Required:** Yes (Owner if published, or Teacher/Admin)

---

## 7. Dashboard Endpoints

### `GET /api/v1/dashboard/admin`
- **Description:** System-wide metrics: total students, teachers, exams, attempts, pass/fail ratio.
- **Auth Required:** Yes (`admin`)

### `GET /api/v1/dashboard/teacher`
- **Description:** Teacher metrics: questions, exams, student attempts, average scores.
- **Auth Required:** Yes (`teacher`, `admin`)

### `GET /api/v1/dashboard/student`
- **Description:** Student metrics: total exams taken, average percentage, highest score, recent results.
- **Auth Required:** Yes (`student`)

---

## 8. Health Checks

### `GET /health`
- **Description:** Process liveness probe.
- **Auth Required:** No
- **Response:** `200 OK` `{ "status": "ok", "timestamp": "..." }`

### `GET /ready`
- **Description:** Database readiness probe.
- **Auth Required:** No
- **Response:** `200 OK` `{ "status": "ready", "database": "connected" }` or `503 Unavailable`

