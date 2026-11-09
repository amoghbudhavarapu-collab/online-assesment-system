# Online Examination and Assessment System — Database Schema

## Architecture
- **Engine:** MongoDB (Atlas or Local)
- **ODM:** Mongoose 8.x
- **Key Security & Integrity Rules:**
  - Strict Schema validation on all collections
  - Passwords hashed with bcryptjs (salt cost 10)
  - Timestamps (`createdAt`, `updatedAt`) on all entities
  - Refresh tokens stored as bcrypt hashes in `sessions` with TTL expiration
  - Question snapshots embedded inside `examinations` to guarantee historical immutability
  - Unique compound index on `(examinationId, studentId)` on `attempts` collection to enforce single attempt per student

---

## Collections

### 1. `users`
Represents administrators, teachers, and students.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary Key |
| `name` | String | Yes | Full name (2-100 chars) |
| `email` | String | Yes | Unique lowercase email |
| `password` | String | Yes | Bcrypt hash |
| `role` | String | Yes | `admin` \| `teacher` \| `student` (default `student`) |
| `isActive` | Boolean | Yes | Account status (default `true`) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Modification timestamp |

**Indexes:**
- `email`: unique

---

### 2. `sessions`
Tracks active sessions and rotated refresh tokens.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary Key |
| `userId` | ObjectId | Yes | Reference to `users._id` |
| `refreshTokenHash` | String | Yes | Bcrypt hash of refresh token |
| `expiresAt` | Date | Yes | Expiration date (TTL index) |
| `revokedAt` | Date | No | Revocation timestamp (null if active) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Modification timestamp |

**Indexes:**
- `userId`: 1
- `expiresAt`: TTL index (`expireAfterSeconds: 0`)

---

### 3. `questions`
Reusable question bank belonging to teachers.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary Key |
| `questionText` | String | Yes | Question prompt |
| `questionType` | String | Yes | `MCQ` \| `MULTIPLE_SELECT` \| `TRUE_FALSE` \| `FILL_BLANKS` |
| `options` | [String] | No | Choices for MCQ and Multiple Select |
| `correctAnswer` | Mixed | Yes | Correct choice, array of choices, boolean, or string |
| `acceptedAnswers`| [String] | No | Alternative accepted answers for fill-in-blanks |
| `marks` | Number | Yes | Positive mark value (default 1) |
| `negativeMarks` | Number | Yes | Deducted marks for wrong answer (default 0) |
| `difficulty` | String | Yes | `easy` \| `medium` \| `hard` |
| `category` | String | Yes | Subject / topic area |
| `explanation` | String | No | Solution explanation |
| `createdBy` | ObjectId | Yes | Reference to `users._id` (Teacher) |
| `isLocked` | Boolean | Yes | True when linked to active/completed exams |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Modification timestamp |

**Indexes:**
- `createdBy`: 1, `category`: 1, `difficulty`: 1, `questionType`: 1
- `questionText`: text, `category`: text

---

### 4. `examinations`
Examinations scheduled by teachers or administrators.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary Key |
| `title` | String | Yes | Exam title |
| `description` | String | No | Description |
| `subject` | String | Yes | Subject name |
| `instructions` | String | No | Student instructions |
| `questions` | [QuestionSnapshot] | Yes | Immutable embedded snapshot of questions at publish time |
| `duration` | Number | Yes | Duration in minutes |
| `totalMarks` | Number | Yes | Automatically calculated sum of question marks |
| `passingMarks` | Number | Yes | Minimum passing marks required |
| `negativeMarkingEnabled` | Boolean | Yes | Toggle negative marking |
| `shuffleQuestions` | Boolean | Yes | Randomize question order per student |
| `shuffleOptions` | Boolean | Yes | Randomize option order |
| `startTime` | Date | Yes | Start time (UTC) |
| `endTime` | Date | Yes | End time (UTC) |
| `assignedStudents` | [ObjectId] | No | Target student IDs (empty = public to all) |
| `resultPublicationMode` | String | Yes | `auto` \| `manual` (default `manual`) |
| `resultsPublished` | Boolean | Yes | Whether results are published to students |
| `status` | String | Yes | `draft` \| `scheduled` \| `live` \| `completed` \| `results_published` \| `cancelled` |
| `createdBy` | ObjectId | Yes | Reference to `users._id` (Teacher/Admin) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Modification timestamp |

---

### 5. `attempts`
Student examination attempts, answers, and evaluation outcomes.

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Yes | Primary Key |
| `examinationId` | ObjectId | Yes | Reference to `examinations._id` |
| `studentId` | ObjectId | Yes | Reference to `users._id` |
| `answers` | [AttemptAnswer] | Yes | Array of saved answers with question IDs |
| `startedAt` | Date | Yes | Server timestamp when student started |
| `deadlineAt` | Date | Yes | Server deadline = min(startedAt + duration, exam.endTime) |
| `submittedAt` | Date | No | Timestamp of submission |
| `status` | String | Yes | `in_progress` \| `submitted` \| `auto_submitted` |
| `submissionType`| String | Yes | `manual` \| `auto` |
| `totalQuestions` | Number | Yes | Count of questions |
| `attemptedQuestions` | Number | Yes | Count of answered questions |
| `correctAnswers`| Number | Yes | Count of correct answers |
| `incorrectAnswers` | Number | Yes | Count of incorrect answers |
| `unansweredQuestions` | Number | Yes | Count of unanswered questions |
| `marksObtained` | Number | Yes | Final evaluated score (≥ 0) |
| `totalMarks` | Number | Yes | Total marks possible |
| `percentage` | Number | Yes | Calculated percentage (0 - 100) |
| `resultStatus` | String | Yes | `pass` \| `fail` \| `pending` |
| `evaluatedAt` | Date | No | Evaluation timestamp |

**Indexes:**
- `examinationId: 1, studentId: 1` — **UNIQUE** (prevents duplicate attempts)
- `studentId: 1`
- `status: 1`

