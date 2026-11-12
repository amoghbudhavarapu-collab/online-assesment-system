const assert = require('node:assert');
const test = require('node:test');

const BASE = 'http://localhost:5000';
const API = `${BASE}/api/v1`;

let adminToken = null;
let teacherToken = null;
let studentToken = null;
let adminId = null;
let teacherId = null;
let studentId = null;
let questionId = null;
let examinationId = null;
let attemptId = null;
let saveQuestionId = null;

function headers(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function req(method, url, body, token) {
  const init = { method, headers: headers(token) };
  if (body) init.body = JSON.stringify(body);
  const res = await fetch(url, init);
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, headers: res.headers };
}

test('GET / returns API info', async () => {
  const res = await req('GET', `${BASE}/`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'ok');
  assert.strictEqual(res.data.name, 'Online Examination and Assessment System API');
});

test('GET /health returns ok', async () => {
  const res = await req('GET', `${BASE}/health`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'ok');
});

test('GET /ready returns database connected', async () => {
  const res = await req('GET', `${BASE}/ready`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'ready');
  assert.strictEqual(res.data.database, 'connected');
});

test('POST /auth/register creates a new student', async () => {
  const res = await req('POST', `${API}/auth/register`, {
    name: 'Test Student',
    email: `teststudent${Date.now()}@example.com`,
    password: 'Password@123',
    confirmPassword: 'Password@123'
  });
  assert.strictEqual(res.status, 201);
  assert.ok(res.data.success);
  assert.ok(res.data.accessToken);
  assert.ok(res.data.user);
});

test('POST /auth/login as admin', async () => {
  const res = await req('POST', `${API}/auth/login`, {
    email: 'admin@assessment.com',
    password: 'Password@123'
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
  assert.ok(res.data.accessToken);
  adminToken = res.data.accessToken;
  adminId = res.data.user._id;
});

test('POST /auth/login as teacher', async () => {
  const res = await req('POST', `${API}/auth/login`, {
    email: 'teacher@assessment.com',
    password: 'Password@123'
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
  assert.ok(res.data.accessToken);
  teacherToken = res.data.accessToken;
  teacherId = res.data.user._id;
});

test('POST /auth/login as student', async () => {
  const res = await req('POST', `${API}/auth/login`, {
    email: 'student@assessment.com',
    password: 'Password@123'
  });
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
  assert.ok(res.data.accessToken);
  studentToken = res.data.accessToken;
  studentId = res.data.user._id;
});

test('GET /auth/me returns current user (admin)', async () => {
  const res = await req('GET', `${API}/auth/me`, null, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
  assert.strictEqual(res.data.user.role, 'admin');
});

test('GET /auth/me without token returns 401', async () => {
  const res = await req('GET', `${API}/auth/me`);
  assert.strictEqual(res.status, 401);
});

test('PATCH /auth/change-password (admin)', async () => {
  const res = await req('PATCH', `${API}/auth/change-password`, {
    currentPassword: 'Password@123',
    newPassword: 'Password@123',
    confirmNewPassword: 'Password@123'
  }, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /dashboard/admin accessible by admin', async () => {
  const res = await req('GET', `${API}/dashboard/admin`, null, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /dashboard/teacher accessible by teacher', async () => {
  const res = await req('GET', `${API}/dashboard/teacher`, null, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /dashboard/student accessible by student', async () => {
  const res = await req('GET', `${API}/dashboard/student`, null, studentToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /dashboard/admin forbidden for teacher', async () => {
  const res = await req('GET', `${API}/dashboard/admin`, null, teacherToken);
  assert.strictEqual(res.status, 403);
});

test('GET /dashboard/student forbidden for admin', async () => {
  const res = await req('GET', `${API}/dashboard/student`, null, adminToken);
  assert.strictEqual(res.status, 403);
});

test('GET /users list (admin)', async () => {
  const res = await req('GET', `${API}/users`, null, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
  assert.ok(Array.isArray(res.data.data));
});

test('GET /users/:id (admin)', async () => {
  const res = await req('GET', `${API}/users/${adminId}`, null, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /users/:id forbidden for student', async () => {
  const res = await req('GET', `${API}/users/${adminId}`, null, studentToken);
  assert.strictEqual(res.status, 403);
});

test('POST /questions creates a question (teacher)', async () => {
  const res = await req('POST', `${API}/questions`, {
    questionText: 'What is 2+2?',
    questionType: 'MCQ',
    options: ['3', '4', '5'],
    correctAnswer: '4',
    marks: 1,
    negativeMarks: 0,
    category: 'General'
  }, teacherToken);
  assert.strictEqual(res.status, 201);
  assert.ok(res.data.success);
  questionId = res.data.data?._id || res.data.question?._id || (res.data.data && res.data.data._id);
});

test('GET /questions list (teacher)', async () => {
  const res = await req('GET', `${API}/questions`, null, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /questions/:id (teacher)', async () => {
  const id = questionId || (await (await req('GET', `${API}/questions`, null, teacherToken)).data.data[0])._id;
  questionId = questionId || id;
  const res = await req('GET', `${API}/questions/${questionId}`, null, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('PATCH /questions/:id updates question (teacher)', async () => {
  const res = await req('PATCH', `${API}/questions/${questionId}`, {
    questionText: 'What is 2+2? (updated)'
  }, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('POST /questions forbidden for student', async () => {
  const res = await req('POST', `${API}/questions`, {
    questionText: 'x', questionType: 'MCQ', options: ['a', 'b'], correctAnswer: 'a', marks: 1
  }, studentToken);
  assert.strictEqual(res.status, 403);
});

test('PATCH /users/me updates own profile', async () => {
  const res = await req('PATCH', `${API}/users/me`, { name: 'Updated Admin' }, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('POST /examinations creates exam (teacher)', async () => {
  const past = new Date(Date.now() - 1000 * 60 * 5).toISOString();   // 5 min ago
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 24h from now
  const res = await req('POST', `${API}/examinations`, {
    title: 'Test Exam',
    description: 'Test description',
    subject: 'Testing',
    instructions: 'Test instructions',
    duration: 30,
    passingMarks: 5,
    negativeMarkingEnabled: false,
    shuffleQuestions: false,
    shuffleOptions: false,
    startTime: past,
    endTime: future,
    assignedStudents: [],
    resultPublicationMode: 'manual',
    questionIds: [questionId]
  }, teacherToken);
  assert.strictEqual(res.status, 201);
  assert.ok(res.data.success);
  examinationId = res.data.data?._id || res.data.examination?._id || (res.data.data && res.data.data._id);
});

test('GET /examinations list (all roles)', async () => {
  const res = await req('GET', `${API}/examinations`, null, adminToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /examinations/:id (teacher)', async () => {
  const res = await req('GET', `${API}/examinations/${examinationId}`, null, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('PATCH /examinations/:id updates exam (teacher)', async () => {
  const res = await req('PATCH', `${API}/examinations/${examinationId}`, {
    title: 'Test Exam Updated'
  }, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /examinations/available (student)', async () => {
  const res = await req('GET', `${API}/examinations/available`, null, studentToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('POST /examinations/:id/publish (teacher)', async () => {
  const res = await req('POST', `${API}/examinations/${examinationId}/publish`, null, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('POST /examinations forbidden for student', async () => {
  const res = await req('POST', `${API}/examinations`, {
    title: 'x', subject: 'x', durationMinutes: 30,
    startDateTime: new Date(Date.now() + 100000).toISOString(),
    endDateTime: new Date(Date.now() + 200000).toISOString(),
    passingMarks: 1, totalMarks: 1
  }, studentToken);
  assert.strictEqual(res.status, 403);
});

test('POST /examinations/:id/start starts exam (student)', async () => {
  const res = await req('POST', `${API}/examinations/${examinationId}/start`, null, studentToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
  attemptId = res.data.data?.attemptId || res.data.data?._id || res.data.attempt?._id;
  saveQuestionId = res.data.data?.questions?.[0]?.questionId;
});

test('GET /attempts/my-attempts (student)', async () => {
  const res = await req('GET', `${API}/attempts/my-attempts`, null, studentToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /attempts/:id (student own attempt)', async () => {
  const res = await req('GET', `${API}/attempts/${attemptId}`, null, studentToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('PUT /attempts/:id/answers/:questionId saves answer (student)', async () => {
  const qid = saveQuestionId || 'q1';
  const res = await req('PUT', `${API}/attempts/${attemptId}/answers/${qid}`, {
    selectedAnswer: '4',
    isAnswered: true
  }, studentToken);
  assert.ok(res.status === 200 || res.status === 201);
  assert.ok(res.data.success);
});

test('POST /attempts/:id/submit submits attempt (student)', async () => {
  const res = await req('POST', `${API}/attempts/${attemptId}/submit`, null, studentToken);
  assert.ok(res.status === 200 || res.status === 201);
  assert.ok(res.data.success);
});

test('GET /results/my-results (student)', async () => {
  const res = await req('GET', `${API}/results/my-results`, null, studentToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /results/examination/:id (teacher)', async () => {
  const res = await req('GET', `${API}/results/examination/${examinationId}`, null, teacherToken);
  assert.strictEqual(res.status, 200);
  assert.ok(res.data.success);
});

test('GET /results/:id (result by id)', async () => {
  const res = await req('GET', `${API}/results/${attemptId}`, null, studentToken);
  // 200 if published, 403 if results not yet published, 404 if not found
  assert.ok(res.status === 200 || res.status === 403 || res.status === 404);
  assert.ok(res.data.success || res.data.error);
});

test('POST /auth/refresh missing token returns 401', async () => {
  const res = await req('POST', `${API}/auth/refresh`);
  assert.strictEqual(res.status, 401);
});

test('POST /auth/logout', async () => {
  const res = await req('POST', `${API}/auth/logout`);
  assert.ok(res.status === 200 || res.status === 401);
});

test('GET unknown route returns 404', async () => {
  const res = await req('GET', `${API}/no-such-endpoint`);
  assert.strictEqual(res.status, 404);
});

console.log('\n✅ All endpoint tests completed.');
console.log('   Admin token:', adminId ? 'captured' : 'MISSING');
console.log('   Teacher token:', teacherId ? 'captured' : 'MISSING');
console.log('   Student token:', studentId ? 'captured' : 'MISSING');