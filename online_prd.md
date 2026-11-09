# ONLINE EXAMINATION AND ASSESSMENT SYSTEM
## Product Requirements Document (PRD)

**Version:** 1.0  
**Project Type:** Full-Stack Web Application  
**Architecture:** MERN Stack  
**Status:** Development Ready

---

# 1. Project Overview

## 1.1 Project Description

The Online Examination and Assessment System is a web-based platform designed to conduct, manage, schedule, and evaluate examinations digitally.

The platform provides a centralized environment where administrators and teachers can create examinations, manage question banks, schedule exams, monitor student participation, automatically evaluate objective questions, and generate detailed examination results.

Students can register and log in securely, view available examinations, attend scheduled examinations, submit answers, and access their results once they are published.

The system aims to reduce manual examination administration, minimize evaluation time, improve assessment accuracy, and provide a user-friendly examination experience.

## 1.2 Primary Objectives

1. Provide secure email-and-password authentication.
2. Support role-based access for administrators, teachers, and students.
3. Allow teachers to create, update, organize, and manage questions.
4. Provide a reusable question bank.
5. Allow administrators and teachers to schedule examinations.
6. Allow students to attend examinations within the configured time window.
7. Implement automatic submission when examination time expires.
8. Automatically evaluate objective questions.
9. Generate examination results and performance reports.
10. Provide dashboards with examination statistics and student performance.

## 1.3 Target Users

### Administrator
Responsible for managing the entire platform, users, examinations, and system-level configurations.

### Teacher / Examiner
Responsible for creating questions, preparing examinations, scheduling assessments, and reviewing student performance.

### Student
Responsible for attending assigned examinations, submitting answers, and viewing published results.

---

# 2. Technology Stack

The following technology stack must be used throughout the application.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | Component-based UI |
| Build Tool | Vite | Frontend development and bundling |
| Styling | Tailwind CSS | Responsive UI styling |
| Language | JavaScript / JSX | Frontend development |
| Backend | Node.js | Server runtime |
| Backend Framework | Express.js | REST API development |
| Database | MongoDB Atlas | Persistent data storage |
| ODM | Mongoose | MongoDB models and queries |
| Authentication | Email + Password | User authentication |
| Password Security | bcryptjs | Password hashing |
| Authorization | JWT + Role-Based Access Control | Protected access |
| Validation | Zod | Request and environment validation |
| HTTP Client | Axios | Frontend-backend communication |
| Frontend Routing | React Router DOM | Application navigation |
| State Management | React Context API | Authentication and global state |
| Server State | TanStack Query | API caching and synchronization |
| Notifications | React Hot Toast / equivalent | User feedback |
| Charts | Recharts | Performance analytics |
| API Testing | Postman | Endpoint testing |
| Database Management | MongoDB Atlas | Cloud database management |

**Important dependency rule:** Before installing dependencies or writing package.json files, verify current stable releases and security advisories. Do not use outdated hardcoded versions.

---

# 3. User Roles and Permissions

The application must implement three distinct user roles.

## 3.1 Administrator

The administrator has complete access to platform management.

**Permissions:**
- View overall platform statistics.
- Create, view, update, and deactivate user accounts.
- Manage teachers and students.
- Assign roles to users.
- View all examinations.
- View all question banks.
- Create, update, publish, and cancel examinations.
- Monitor examination participation.
- View all examination results.
- Generate system-wide reports.
- Configure examination settings.

## 3.2 Teacher / Examiner

Teachers manage the academic and examination-related operations.

**Permissions:**
- View their dashboard.
- Create and manage their own question bank.
- Create questions with different question types.
- Edit and delete questions that have not been locked by an active or completed examination.
- Create examinations.
- Add questions from their question bank.
- Configure examination duration and marks.
- Schedule examinations.
- Publish or cancel eligible examinations.
- View student submissions.
- View examination results.
- Generate performance reports.

Teachers must not access or modify examinations belonging to other teachers unless the administrator grants permission.

## 3.3 Student

Students can participate in assigned examinations.

**Permissions:**
- Register and log in.
- View their dashboard.
- View upcoming examinations.
- View currently available examinations.
- View examination instructions.
- Start an examination.
- Answer questions.
- Navigate between questions.
- Mark questions for review.
- Save answers automatically.
- Submit examinations.
- View examination history.
- View published results.
- View individual performance statistics.

Students must never be allowed to access correct answers or examination evaluation data before the results are released.

---

# 4. Core Functional Requirements

## 4.1 Authentication and User Management

### Features

**A. User Registration**

Users should be able to register using:
- Full name
- Email address
- Password
- Confirm password
- Role (student registration only)

Rules:
- Email must be unique.
- Password must satisfy minimum security requirements.
- Passwords must be hashed using bcryptjs.
- Public registration must never allow a user to select the administrator or teacher role.
- New student accounts should be assigned the student role.
- Administrative accounts and teacher accounts must be created or authorized by an administrator.

**B. User Login**

Users log in using:
- Email
- Password

After successful authentication:
- Generate an access JWT.
- Issue a secure refresh-token cookie.
- Retrieve the authenticated user's profile.
- Redirect the user to the appropriate dashboard based on their role.

**C. Logout**
- Invalidate the refresh session.
- Clear the refresh-token cookie.
- Clear the in-memory access token.
- Redirect to the login page.

**D. Profile Management**
- View profile.
- Update name.
- Update profile information.
- Change password.
- View account creation date.

**E. Password Security**
- Never store plain-text passwords.
- Use bcryptjs for password hashing.
- Implement login rate limiting.
- Use generic login failure messages.
- Support secure password reset through email as a later enhancement.

---

# 5. Question Bank Management

The question bank is one of the primary modules of the system.

Teachers should be able to create and manage reusable questions.

## 5.1 Supported Question Types

### 1. Multiple Choice Questions (MCQ)

Students select one correct answer from multiple options.

Example:

What is the capital of India?

- A. Mumbai
- B. New Delhi
- C. Hyderabad
- D. Chennai

Correct Answer: B

Evaluation: Automatically evaluated.

### 2. Multiple Select Questions

Students can select multiple correct options.

Example:

Which of the following are programming languages?

- A. Python
- B. HTML
- C. Java
- D. CSS

Correct Answers: A and C

Evaluation: Automatically evaluated using exact-set matching in the MVP.

### 3. True / False Questions

Students select either True or False.

Example:

JavaScript is a programming language.

- True
- False

Correct Answer: True

Evaluation: Automatically evaluated.

### 4. Fill in the Blanks

Students enter a missing word or phrase.

Example:

MongoDB is a ______ database.

Correct Answer: NoSQL

Evaluation: Automatically evaluated using normalized exact matching. Teachers can configure accepted alternative answers.

## 5.2 Question Fields

Each question must contain:

- Question title / question text.
- Question type.
- Options (where applicable).
- Correct answer.
- Marks.
- Negative marks (optional).
- Difficulty level.
- Subject or category.
- Explanation (optional).
- Created by.
- Created date.
- Updated date.

## 5.3 Question Management Operations

Teachers should be able to:

- Add a new question.
- View all their questions.
- Edit existing questions.
- Delete questions.
- Search questions.
- Filter questions by category.
- Filter questions by difficulty.
- Filter questions by question type.
- Preview questions before adding them to an examination.

**Business Rules:**
1. Every question must belong to its creator.
2. Questions must be validated before saving.
3. Questions linked to published or completed examinations must not be modified in a way that changes historical exam evaluation.
4. Examination questions must use an immutable snapshot of the question text, options, marks, and correct answer at publication time.
5. Correct answers must never be exposed through student-facing question APIs.

---

# 6. Examination Management

This module allows teachers and administrators to create and manage examinations.

## 6.1 Create Examination

The examination creation form should include:

- Examination title.
- Examination description.
- Subject.
- Examination instructions.
- Start date and time.
- End date and time.
- Examination duration (minutes).
- Total marks.
- Passing marks.
- Negative marking enabled/disabled.
- Random question order enabled/disabled.
- Random option order enabled/disabled.
- Number of questions.
- Examination visibility.
- Result publication settings.

## 6.2 Add Questions to Examination

Teachers can add questions from their question bank.

Features:
- Select individual questions.
- Filter questions by subject and difficulty.
- Add multiple questions.
- Remove questions before publication.
- Configure marks per question.
- Set question order.
- Preview the complete examination.

The system must automatically calculate total examination marks.

Example:

| Question | Marks |
|---|---:|
| Question 1 | 2 |
| Question 2 | 2 |
| Question 3 | 5 |
| Question 4 | 1 |
| Question 5 | 5 |
| **Total** | **15** |

## 6.3 Examination Status

Every examination must have a lifecycle.

- Draft: Examination is being prepared.
- Scheduled: Examination has been published and assigned a future start time.
- Live: Examination is currently available.
- Completed: The examination window has ended.
- Results Published: Results are available to students.
- Cancelled: Examination has been cancelled.

The backend must determine examination status using server-side timestamps rather than trusting frontend timers.

## 6.4 Examination Scheduling

Teachers should be able to schedule examinations for specific dates and times.

Rules:
- Start time must be before end time.
- Duration must be a positive number.
- An examination cannot start before its scheduled start time.
- Students cannot start after the permitted start window closes.
- The system must store dates in UTC.
- The frontend should display dates in the user's local timezone.
- Teachers must not make unauthorized changes to active or completed examinations.

---

# 7. Student Examination Interface

This is the most important student-facing module.

## 7.1 Available Examinations

The student dashboard should display:

- Upcoming examinations.
- Currently available examinations.
- Completed examinations.
- Examination duration.
- Total marks.
- Scheduled date and time.
- Examination status.

Students should only see examinations assigned or made available to them.

## 7.2 Examination Instructions

Before starting an examination, students should see an instruction page.

Example instructions:

1. Read all questions carefully.
2. The examination has a fixed time limit.
3. Answers will be saved automatically.
4. Students cannot start an examination before its scheduled time.
5. Once time expires, the system automatically submits the examination.
6. Students should not refresh or close the browser during the examination.
7. Only one active attempt is allowed per student for each examination.

The student must confirm the instructions before starting.

## 7.3 Examination Interface

The examination screen should contain:

**Header Section**
- Examination name.
- Student name.
- Countdown timer.
- Submit examination button.

**Main Question Section**
- Question number.
- Question text.
- Available options or answer input.
- Marks for the question.
- Previous and Next buttons.

**Question Navigation Panel**
- List of all question numbers.
- Answered questions.
- Unanswered questions.
- Marked-for-review questions.
- Current question indicator.

## 7.4 Answer Saving

The system must automatically save answers.

Requirements:
- Save answers when students select an option or change an answer.
- Save answers when navigating between questions.
- Display save status.
- Retry failed save requests safely.
- Recover saved answers after a page refresh or temporary disconnection.
- Prevent duplicate answer records for the same question within an attempt.

The server must remain the source of truth for saved answers.

## 7.5 Examination Timer

The examination timer must be calculated using the backend's recorded attempt start time and deadline.

Example:

Examination duration: 60 minutes.

If a student starts at 10:00 AM, the deadline is 11:00 AM.

The frontend displays the countdown, but the backend validates the deadline on every answer-save and submission request.

When time expires:
- Disable answer editing.
- Automatically submit the latest saved answers.
- Mark the attempt as submitted or auto-submitted.
- Trigger evaluation.

A background job may be used for cleanup and deadline processing, but the backend must also enforce expiration during incoming requests. Correctness must not depend solely on a cron job.

## 7.6 Submit Examination

Before manual submission:
- Show a confirmation dialog.
- Display answered and unanswered question counts.
- Allow students to return to the examination.
- Confirm final submission.

After successful submission:
- Lock the attempt.
- Prevent further answer changes.
- Record submission timestamp.
- Trigger evaluation.

A submitted examination cannot be resubmitted by the student.

---

# 8. Automatic Evaluation System

The system must automatically evaluate supported objective questions.

## 8.1 Evaluation Rules

| Question Type | Evaluation Method |
|---|---|
| MCQ | Compare selected option with correct option |
| Multiple Select | Compare selected set with correct set |
| True / False | Compare Boolean values |
| Fill in the Blanks | Normalize and compare accepted answers |

## 8.2 Marks Calculation

For each question:

- Correct answer: Award full marks.
- Incorrect answer: Apply configured negative marks, if enabled.
- Unanswered question: Award zero marks.

Example:

Total questions: 10

Correct answers: 7

Incorrect answers: 2

Unanswered: 1

Marks per question: 2

Negative marking: 0.5 per incorrect answer.

Calculation:

Correct marks = 7 × 2 = 14

Negative marks = 2 × 0.5 = 1

Final score = 14 - 1 = 13

Total marks = 20

Percentage = (13 / 20) × 100 = 65%

## 8.3 Result Generation

After evaluation, the system should generate:

- Student name.
- Examination name.
- Total questions.
- Attempted questions.
- Correct answers.
- Incorrect answers.
- Unanswered questions.
- Total marks.
- Marks obtained.
- Percentage.
- Pass / Fail status.
- Examination submission time.
- Evaluation completion time.

## 8.4 Result Publication

The teacher or administrator should be able to configure whether results are:

- Published automatically after evaluation.
- Published manually by the teacher or administrator.

Students must only access results when the examination's result publication status allows it.

Correct answers and detailed answer explanations should remain hidden until explicitly permitted.

---

# 9. Dashboards and Analytics

## 9.1 Administrator Dashboard

Display:

- Total students.
- Total teachers.
- Total examinations.
- Upcoming examinations.
- Active examinations.
- Completed examinations.
- Total examination attempts.
- Overall platform activity.

Provide charts for:
- Student registrations over time.
- Examination participation.
- Examination completion statistics.
- Overall pass/fail distribution.

## 9.2 Teacher Dashboard

Display:

- Total questions created.
- Total examinations created.
- Upcoming examinations.
- Live examinations.
- Completed examinations.
- Total student attempts.
- Average marks across examinations.

Provide:
- Examination performance charts.
- Student score distribution.
- Pass/fail statistics.
- Examination-wise performance reports.

## 9.3 Student Dashboard

Display:

- Upcoming examinations.
- Available examinations.
- Completed examinations.
- Total examinations attended.
- Average percentage.
- Highest score.
- Recent examination results.

Charts:
- Performance over time.
- Subject-wise marks.
- Examination-wise score comparison.

---

# 10. Result Management

Teachers and administrators should have access to examination result management.

Features:

1. View all results for an examination.
2. Search students by name or email.
3. Filter results by pass/fail.
4. Sort students by marks.
5. View individual examination attempts.
6. View question-wise evaluation.
7. Publish or withhold results.
8. Export examination results as CSV.

The system must maintain historical result records even if a teacher later edits their question bank.

---

# 11. Non-Functional Requirements

## 11.1 Performance

- Dashboard APIs should support pagination.
- Use MongoDB indexes for frequently queried fields.
- Avoid unnecessary database requests.
- Cache suitable frontend API responses.
- Handle concurrent student attempts without creating duplicate submissions.
- Use efficient MongoDB queries and projections.

## 11.2 Security

- Passwords must be hashed.
- JWT authentication must be implemented.
- Use role-based access control.
- Protect all private routes.
- Validate all incoming API requests.
- Use Helmet security headers.
- Configure explicit CORS origins.
- Apply rate limiting to authentication and sensitive endpoints.
- Prevent NoSQL injection.
- Never expose correct answers through student APIs.
- Never trust marks or scores submitted by the frontend.
- Enforce examination deadlines on the server.
- Prevent unauthorized access to other students' attempts and results.
- Keep secrets in environment variables.

## 11.3 Reliability

- Save student answers automatically.
- Handle temporary network interruptions.
- Prevent duplicate submissions.
- Make evaluation idempotent.
- Maintain examination and submission timestamps.
- Use proper error handling.
- Implement health and readiness endpoints.

## 11.4 Usability

- Responsive design for desktop, tablet, and mobile.
- Clear examination instructions.
- Easy question navigation.
- Visible countdown timer.
- Clear answered/unanswered indicators.
- Loading, success, and error states.
- Accessible forms and controls.

---

# 12. Database Design (MongoDB)

Use Mongoose models and references where appropriate.

The following collections should be implemented.

## 12.1 Users Collection

**Collection:** users

Fields:

- _id
- name
- email
- password
- role (admin / teacher / student)
- isActive
- createdAt
- updatedAt

Rules:
- Email must be unique.
- Password must contain a bcrypt hash.
- Role must be validated.
- Never return password fields in API responses.

## 12.2 Questions Collection

**Collection:** questions

Fields:

- _id
- questionText
- questionType
- options
- correctAnswer
- acceptedAnswers
- marks
- negativeMarks
- difficulty
- category
- explanation
- createdBy (User reference)
- createdAt
- updatedAt

## 12.3 Examinations Collection

**Collection:** examinations

Fields:

- _id
- title
- description
- subject
- instructions
- questions (embedded immutable question snapshots)
- duration
- totalMarks
- passingMarks
- negativeMarkingEnabled
- shuffleQuestions
- shuffleOptions
- startTime
- endTime
- assignedStudents (User references)
- resultPublicationMode
- resultsPublished
- status
- createdBy
- createdAt
- updatedAt

## 12.4 Examination Attempts Collection

**Collection:** attempts

Fields:

- _id
- examinationId
- studentId
- answers
- startedAt
- deadlineAt
- submittedAt
- status
- submissionType (manual / auto)
- totalQuestions
- attemptedQuestions
- correctAnswers
- incorrectAnswers
- unansweredQuestions
- marksObtained
- totalMarks
- percentage
- resultStatus
- evaluatedAt
- createdAt
- updatedAt

Answer subdocument:

- questionId
- selectedAnswer
- isAnswered
- isMarkedForReview
- savedAt

## 12.5 Sessions Collection

**Collection:** sessions

Fields:

- _id
- userId
- refreshTokenHash
- expiresAt
- createdAt
- revokedAt

Purpose:
- Manage active sessions.
- Support refresh-token rotation.
- Revoke sessions on logout.

## 12.6 Database Relationships

- One user can create multiple questions.
- One teacher can create multiple examinations.
- One examination can contain multiple question snapshots.
- One student can have multiple examination attempts across different examinations.
- One examination can have multiple student attempts.
- Each attempt belongs to one student and one examination.

**Important:** Enforce a unique compound index on examinationId + studentId for the MVP's single-attempt-per-student policy.

---

# 13. Backend Architecture

## 13.1 Repository Structure

Use the following folder structure:

ProjectRoot/

backend/
- src/
  - server.js
  - app.js
  - config/
    - db.js
    - env.js
  - middleware/
    - requireAuth.js
    - roleGuard.js
    - validate.js
    - errorHandler.js
  - modules/
    - auth/
      - auth.routes.js
      - auth.controller.js
      - auth.service.js
      - auth.model.js
      - auth.schema.js
    - users/
      - user.routes.js
      - user.controller.js
      - user.service.js
      - user.model.js
    - questions/
      - question.routes.js
      - question.controller.js
      - question.service.js
      - question.model.js
      - question.schema.js
    - examinations/
      - examination.routes.js
      - examination.controller.js
      - examination.service.js
      - examination.model.js
      - examination.schema.js
    - attempts/
      - attempt.routes.js
      - attempt.controller.js
      - attempt.service.js
      - attempt.model.js
    - results/
      - result.routes.js
      - result.controller.js
      - result.service.js
    - dashboard/
      - dashboard.routes.js
      - dashboard.controller.js
      - dashboard.service.js
  - services/
    - evaluation.service.js
    - email.service.js
  - utils/
    - jwt.js
    - tokenCompare.js
    - ownershipCheck.js
  - types/
  - jobs/
    - examinationExpiry.job.js
- postman/
  - collection.json
  - environment.json
- .env.example
- .gitignore
- package.json

frontend/
- src/
  - main.jsx
  - App.jsx
  - assets/
  - components/
    - common/
    - layout/
    - forms/
    - examination/
  - auth/
    - AuthProvider.jsx
    - tokenStore.js
  - context/
  - hooks/
  - lib/
    - api/
      - client.js
      - refreshClient.js
  - features/
    - auth/
    - questions/
    - examinations/
    - attempts/
    - results/
    - dashboard/
  - pages/
    - auth/
    - admin/
    - teacher/
    - student/
  - routes/
    - RequireAuth.jsx
    - RoleGuard.jsx
  - utils/
  - styles/
- .env.example
- .gitignore
- package.json

docs/
- PRD.md
- API_DOCUMENTATION.md
- DATABASE_SCHEMA.md
- BACKEND_PLANNING.md

README.md
.gitignore
.cursorignore

## 13.2 Backend Development Rules

1. Follow modular architecture.
2. Keep controllers thin.
3. Implement business logic inside services.
4. Use Mongoose models for database operations.
5. Validate every request body, query, and path parameter.
6. Apply authentication and role authorization middleware.
7. Use centralized error handling.
8. Use pagination for list APIs.
9. Prevent cross-user resource access.
10. Never expose sensitive database fields.

---

# 14. API Documentation and Endpoint Requirements

Base URL:

`http://localhost:5000/api/v1`

All API responses must follow a consistent structure.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed"
  }
}
```

## 14.1 Authentication APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | /auth/register | Register student | Public |
| POST | /auth/login | User login | Public |
| POST | /auth/refresh | Refresh access token | Cookie |
| POST | /auth/logout | Logout | Authenticated |
| GET | /auth/me | Get current user | Authenticated |
| PATCH | /auth/change-password | Change password | Authenticated |

## 14.2 User Management APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | /users | List users | Admin |
| GET | /users/:id | Get user details | Admin |
| PATCH | /users/:id | Update user | Admin |
| PATCH | /users/:id/status | Activate/deactivate user | Admin |
| GET | /users/me | Get own profile | Authenticated |
| PATCH | /users/me | Update own profile | Authenticated |

## 14.3 Question Management APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | /questions | Create question | Teacher |
| GET | /questions | List questions | Teacher |
| GET | /questions/:id | Get question details | Teacher |
| PATCH | /questions/:id | Update question | Teacher |
| DELETE | /questions/:id | Delete question | Teacher |

Support query parameters:

`?page=1&limit=20`

Optional filters:

`?difficulty=easy&category=programming&questionType=MCQ`

## 14.4 Examination Management APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | /examinations | Create examination | Teacher/Admin |
| GET | /examinations | List examinations | Role-based |
| GET | /examinations/:id | Get examination details | Role-based |
| PATCH | /examinations/:id | Update examination | Owner/Admin |
| DELETE | /examinations/:id | Delete draft examination | Owner/Admin |
| POST | /examinations/:id/publish | Publish examination | Owner/Admin |
| POST | /examinations/:id/cancel | Cancel examination | Owner/Admin |
| GET | /examinations/available | Student's available exams | Student |

## 14.5 Student Attempt APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | /examinations/:id/start | Start examination | Student |
| GET | /attempts/:id | Get active attempt questions | Attempt owner |
| PUT | /attempts/:id/answers/:questionId | Save/update answer | Attempt owner |
| POST | /attempts/:id/submit | Submit examination | Attempt owner |
| GET | /attempts/my-attempts | View own attempts | Student |

**Security requirement:** The student attempt API must return question text and options without correct answers, answer keys, or evaluation-only fields.

## 14.6 Results APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | /results/my-results | Student's results | Student |
| GET | /results/examination/:id | Examination results | Teacher/Admin |
| GET | /results/:id | Individual result | Authorized user |
| POST | /results/examination/:id/publish | Publish results | Teacher/Admin |
| GET | /results/examination/:id/export | Export CSV | Teacher/Admin |

## 14.7 Dashboard APIs

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | /dashboard/admin | Admin statistics | Admin |
| GET | /dashboard/teacher | Teacher statistics | Teacher |
| GET | /dashboard/student | Student statistics | Student |

## 14.8 Health APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /health | Server liveness |
| GET | /ready | Database readiness |

All endpoints must have complete documentation covering request parameters, body, authorization, response examples, error cases, and business rules.

---

# 15. Frontend Pages and UI Requirements

## 15.1 Public Pages

1. Landing Page
2. Login Page
3. Student Registration Page
4. Forgot Password Page (future enhancement)

## 15.2 Administrator Pages

1. Admin Dashboard
2. Manage Students
3. Manage Teachers
4. Manage Users
5. All Examinations
6. Examination Details
7. Results Overview
8. Platform Analytics
9. Admin Profile

## 15.3 Teacher Pages

1. Teacher Dashboard
2. Question Bank
3. Create Question
4. Edit Question
5. Question Preview
6. Examination List
7. Create Examination
8. Examination Preview
9. Schedule Examination
10. Examination Details
11. Student Attempts
12. Examination Results
13. Performance Analytics
14. Teacher Profile

## 15.4 Student Pages

1. Student Dashboard
2. Available Examinations
3. Upcoming Examinations
4. Examination Instructions
5. Examination Interface
6. Submission Confirmation
7. Examination History
8. Result Details
9. Student Profile

## 15.5 UI Design Guidelines

Create a modern, professional, clean examination dashboard.

Design preferences:
- Professional academic SaaS design.
- Light background.
- White cards.
- Dark navy or slate text.
- Blue or indigo primary accent.
- Rounded cards and buttons.
- Consistent spacing.
- Clear typography.
- Responsive layouts.
- Sidebar navigation for dashboards.
- Mobile-friendly examination interface.

Use Tailwind CSS for all styling.

Create reusable components:
- Sidebar
- Navbar
- DashboardCard
- DataTable
- SearchBar
- FilterDropdown
- Modal
- ConfirmationDialog
- QuestionCard
- QuestionNavigation
- CountdownTimer
- StatusBadge
- Pagination
- LoadingSpinner
- EmptyState
- ErrorState

The interface should feel like a professional SaaS product rather than a basic college project.

---

# 16. Important Business Rules

These rules must be enforced on the backend.

1. Students cannot create teacher or administrator accounts through public registration.
2. A teacher can manage only their own questions and examinations.
3. An administrator can access all platform resources.
4. Students can only access examinations assigned to them or made available to them.
5. Students cannot start examinations before their scheduled start time.
6. Students cannot start an examination after the permitted start window.
7. A student can have only one attempt per examination in the MVP.
8. Examination duration must be enforced using server-side timestamps.
9. Answer changes must not be accepted after submission or expiration.
10. Examination submissions must be immutable.
11. Correct answers must not be sent to the student frontend before permitted result publication.
12. Marks must always be calculated by the backend.
13. Evaluation must not run multiple times and create inconsistent results.
14. Results must not be visible before publication.
15. Historical examination questions must remain unchanged after publication.
16. Deleting a user must not accidentally delete historical examination results.
17. All examination and result access must be authorized.
18. Duplicate requests must not produce duplicate attempts or submissions.

---

# 17. Security Checklist

Implement the following security measures.

## Backend Security

- Password hashing using bcryptjs.
- Short-lived access JWT.
- Refresh JWT stored in HttpOnly, Secure, SameSite cookie.
- Refresh token hashing and rotation.
- JWT authentication middleware.
- Role-based authorization middleware.
- Helmet.
- Explicit CORS allowlist.
- express-rate-limit.
- NoSQL injection protection.
- Request validation using Zod.
- Centralized error handler.
- Ownership validation.
- Secure MongoDB queries.
- Environment variable validation.
- Request body size limits.
- Secure logging.
- HTTPS in production.

## Frontend Security

- Never store access tokens in localStorage or sessionStorage.
- Keep access tokens in memory.
- Use protected routes.
- Use role-based route guards.
- Never expose API secrets.
- Never trust frontend-calculated examination scores.
- Never expose answer keys in browser responses.
- Validate forms.
- Handle authentication expiration.
- Avoid unsafe HTML rendering.

## Examination-Specific Security

- Server-controlled examination timer.
- Server-controlled attempt deadline.
- Immutable submitted attempts.
- Duplicate submission prevention.
- One active attempt per student per examination.
- Prevent access to other students' attempts.
- Prevent access to hidden answer keys.
- Enforce all examination rules on the backend.

**Note:** This project is not a full remote-proctoring system. Camera monitoring, screen recording, AI cheating detection, and browser lockdown are outside the initial MVP scope.

---

# 18. Environment Variables

## Backend .env.example

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exam_system

# JWT
JWT_ACCESS_SECRET=replace_with_secure_random_secret
JWT_REFRESH_SECRET=replace_with_another_secure_random_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
CLIENT_URL=http://localhost:5173

# CORS
CORS_ORIGINS=http://localhost:5173

# Email (optional for password reset)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

## Frontend .env.example

```env
VITE_API_BASE_URL=http://localhost:5000
```

Never commit real `.env` files or production credentials.

---

# 19. Testing and Postman Integration

Create a Postman collection named:

**Online Examination System API**

Organize endpoints into folders:

1. Authentication
2. User Management
3. Question Management
4. Examination Management
5. Student Attempts
6. Results
7. Dashboard
8. Health Checks

## Testing Workflow

### Step 1: Authentication
- Register a student.
- Log in as student.
- Verify access token.
- Fetch current user.
- Test logout.

### Step 2: User Management
- Create teacher account as admin.
- Create another student.
- Test role permissions.
- Test user activation and deactivation.

### Step 3: Question Management
- Create an MCQ.
- Create a multiple-select question.
- Create a true/false question.
- Create a fill-in-the-blank question.
- Update questions.
- Delete a question.
- Test invalid question data.

### Step 4: Examination Management
- Create an examination.
- Add questions.
- Configure duration.
- Configure start and end time.
- Publish examination.
- Verify examination status.

### Step 5: Student Examination
- Log in as student.
- View available examinations.
- Start examination.
- Save answers.
- Navigate between questions.
- Refresh the page and verify saved answers.
- Submit examination.
- Test automatic submission after expiration.

### Step 6: Evaluation
- Verify correct-answer evaluation.
- Verify incorrect-answer evaluation.
- Verify negative marking.
- Verify unanswered questions.
- Verify percentage calculation.
- Verify pass/fail calculation.

### Step 7: Results
- View teacher results.
- Publish results.
- Log in as student.
- View published results.
- Export examination results.

### Step 8: Security
- Test unauthenticated requests.
- Test unauthorized role access.
- Test cross-user access.
- Test duplicate submissions.
- Test expired tokens.
- Test expired examination attempts.
- Test access to correct answers.

Every API endpoint must include positive and negative test cases.

---

# 20. Development Phases

Develop the application in the following order.

## Phase 1: Project Setup

- Initialize frontend using React + Vite.
- Configure Tailwind CSS.
- Initialize Node.js and Express backend.
- Configure MongoDB Atlas.
- Configure environment variables.
- Establish frontend-backend communication.
- Implement the folder structure.

**Deliverable:** Running frontend and backend connected to MongoDB.

## Phase 2: Authentication

- Implement user registration.
- Implement login.
- Implement JWT authentication.
- Implement refresh-token handling.
- Implement logout.
- Implement role-based access.
- Implement protected frontend routes.

**Deliverable:** Fully working authentication system.

## Phase 3: Question Bank

- Create question model.
- Implement question CRUD APIs.
- Implement question creation forms.
- Implement question editing and deletion.
- Add search and filters.

**Deliverable:** Fully functional question bank.

## Phase 4: Examination Management

- Create examination model.
- Implement examination CRUD APIs.
- Implement question selection.
- Implement examination configuration.
- Implement scheduling.
- Implement publication and cancellation.

**Deliverable:** Teachers can create and schedule examinations.

## Phase 5: Student Examination Interface

- Display available examinations.
- Implement examination instructions.
- Implement question navigation.
- Implement answer saving.
- Implement countdown timer.
- Implement manual submission.
- Implement automatic submission.

**Deliverable:** Students can attend examinations.

## Phase 6: Automatic Evaluation

- Create evaluation service.
- Implement question-type evaluation.
- Implement negative marking.
- Calculate total marks.
- Calculate percentages.
- Determine pass/fail status.
- Prevent duplicate evaluation.

**Deliverable:** Fully functional automatic evaluation.

## Phase 7: Results and Analytics

- Create result APIs.
- Implement student result pages.
- Implement teacher result management.
- Implement result publication.
- Implement CSV export.
- Implement dashboards and charts.

**Deliverable:** Complete result management system.

## Phase 8: Testing and Deployment

- Test all API endpoints.
- Test frontend functionality.
- Perform security checks.
- Test examination timing and concurrent submissions.
- Fix bugs.
- Deploy frontend.
- Deploy backend.
- Configure production MongoDB.
- Configure environment variables and HTTPS.

**Deliverable:** Deployed and functional examination platform.

---

# 21. MVP Scope vs Future Enhancements

## MVP — Must Implement

The first working version must include:

- Email/password authentication.
- Three user roles.
- Admin and teacher management.
- Question bank.
- Four objective question types.
- Examination creation.
- Examination scheduling.
- Student examination interface.
- Automatic answer saving.
- Countdown timer.
- Automatic submission.
- Automatic evaluation.
- Result generation.
- Result publication.
- Student and teacher dashboards.
- Basic analytics.
- CSV export.

## Future Enhancements

These features should not delay the first working version.

1. AI-generated examination questions.
2. AI-powered question difficulty analysis.
3. Randomized question papers.
4. Advanced question pools.
5. Multiple examination attempts.
6. PDF result certificates.
7. Email notifications.
8. Advanced proctoring.
9. Webcam-based monitoring.
10. Screen activity monitoring.
11. AI-based suspicious activity detection.
12. Detailed examination audit logs.
13. Institution and department management.
14. Bulk student imports through CSV.
15. Multi-language examination support.

---

# 22. Acceptance Criteria

The project is considered successfully implemented when:

- Students can register and log in.
- Administrators can manage users.
- Teachers can create and manage questions.
- Teachers can create and schedule examinations.
- Students can view examinations assigned to them.
- Students can start examinations only within the allowed time window.
- Students can answer and save questions.
- The examination timer works correctly.
- The system automatically submits expired attempts.
- The backend evaluates all supported question types.
- Negative marking works correctly.
- Results are generated accurately.
- Students cannot access unpublished results.
- Students cannot access correct answers before publication.
- Teachers can view examination-wise results.
- Administrators can view system-wide statistics.
- Unauthorized users cannot access protected resources.
- All essential APIs pass Postman tests.
- The application works on desktop and mobile screens.

---

# 23. Master AI Development Prompt

Use the following prompt after providing this PRD to Cursor AI, Claude Code, or Antigravity.

## Full-Stack Application Development Prompt

Build a complete, functional Online Examination and Assessment System based strictly on this PRD.

### Technology Requirements

Frontend:
- React.js
- Vite
- Tailwind CSS
- JavaScript / JSX
- React Router DOM
- Axios
- React Context API
- TanStack Query
- Recharts

Backend:
- Node.js
- Express.js
- JavaScript
- MongoDB Atlas
- Mongoose
- JWT authentication
- bcryptjs
- Zod validation

Authentication:
- Email and password.
- JWT access and refresh tokens.
- Secure refresh-token cookies.
- Role-based access control.

### Development Instructions

1. First inspect the complete PRD.
2. Understand the complete system architecture.
3. Create a detailed backend implementation plan.
4. Create database models and relationships.
5. Implement authentication before other protected modules.
6. Implement APIs using modular architecture.
7. Implement all business rules on the backend.
8. Build the frontend using reusable React components.
9. Use Tailwind CSS consistently.
10. Connect every frontend feature to its corresponding backend API.
11. Implement loading, success, and error states.
12. Validate all API requests.
13. Implement all required security measures.
14. Create complete API documentation.
15. Generate a Postman collection containing every API endpoint.
16. Add a Postman environment template.
17. Add README.md with setup and execution instructions.
18. Add `.env.example` files for frontend and backend.
19. Add `.gitignore` and `.cursorignore`.
20. Test the complete application before declaring it finished.

### Critical Instructions

- Do not generate only static frontend pages.
- All forms and buttons must have functional behavior.
- Do not use hardcoded mock data as the final implementation.
- Connect the application to the actual MongoDB database.
- Do not calculate examination marks on the frontend.
- Never expose correct answers to student-facing APIs.
- Never trust the frontend examination timer.
- Ensure that automatic submission and evaluation are handled by the backend.
- Implement proper authentication and authorization.
- Do not skip any core functionality specified in the PRD.
- Do not place all backend logic inside a single file.
- Do not overwrite existing working code without inspecting it first.
- Verify dependencies and security advisories before installation.
- Do not commit environment secrets.

### Implementation Strategy

Build the project incrementally.

After completing each phase:
1. Explain what was implemented.
2. List the files created or modified.
3. Explain how to test the implementation.
4. Identify any incomplete functionality.
5. Verify that existing functionality still works.
6. Proceed to the next phase only after testing.

**Final objective:** Deliver a fully functional, secure, responsive, database-connected Online Examination and Assessment System with three user roles, examination scheduling, automatic submission, automatic evaluation, and result generation.