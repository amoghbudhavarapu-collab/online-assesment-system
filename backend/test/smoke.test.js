const test = require('node:test');
const assert = require('node:assert');

test('Environment and modules import without error', () => {
  const { env } = require('../src/config/env');
  assert.ok(env.PORT, 'PORT should be configured');
  assert.ok(env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET should be defined');

  const { app } = require('../src/app');
  assert.ok(app, 'Express app should initialize');
});

test('Evaluation Service grades all question types correctly', () => {
  const evaluationService = require('../src/services/evaluation.service');

  const sampleQuestions = [
    {
      _id: '64a1b2c3d4e5f6a7b8c9d001',
      questionText: 'Capital of France?',
      questionType: 'MCQ',
      options: ['Berlin', 'Paris', 'Rome'],
      correctAnswer: 'Paris',
      marks: 2,
      negativeMarks: 0.5
    },
    {
      _id: '64a1b2c3d4e5f6a7b8c9d002',
      questionText: 'Select cloud providers',
      questionType: 'MULTIPLE_SELECT',
      options: ['AWS', 'GCP', 'Photoshop'],
      correctAnswer: ['AWS', 'GCP'],
      marks: 3,
      negativeMarks: 1
    },
    {
      _id: '64a1b2c3d4e5f6a7b8c9d003',
      questionText: 'JavaScript is compiled directly to machine code.',
      questionType: 'TRUE_FALSE',
      options: ['true', 'false'],
      correctAnswer: 'false',
      marks: 1,
      negativeMarks: 0.25
    },
    {
      _id: '64a1b2c3d4e5f6a7b8c9d004',
      questionText: 'Database type of MongoDB is ______',
      questionType: 'FILL_BLANKS',
      correctAnswer: 'NoSQL',
      acceptedAnswers: ['nosql', 'document'],
      marks: 2,
      negativeMarks: 0
    }
  ];

  const studentAnswers = [
    {
      questionId: '64a1b2c3d4e5f6a7b8c9d001',
      selectedAnswer: 'Paris',
      isAnswered: true
    },
    {
      questionId: '64a1b2c3d4e5f6a7b8c9d002',
      selectedAnswer: ['gcp', 'aws'], // Order & case-insensitive matching
      isAnswered: true
    },
    {
      questionId: '64a1b2c3d4e5f6a7b8c9d003',
      selectedAnswer: 'true', // Wrong answer
      isAnswered: true
    },
    {
      questionId: '64a1b2c3d4e5f6a7b8c9d004',
      selectedAnswer: 'document', // Accepted alternative
      isAnswered: true
    }
  ];

  const result = evaluationService.evaluateAttempt(sampleQuestions, studentAnswers, {
    negativeMarkingEnabled: true,
    passingMarks: 5
  });

  assert.strictEqual(result.totalQuestions, 4);
  assert.strictEqual(result.correctAnswers, 3);
  assert.strictEqual(result.incorrectAnswers, 1);
  assert.strictEqual(result.unansweredQuestions, 0);

  // Q1: +2, Q2: +3, Q3: -0.25, Q4: +2 => Total: 6.75
  assert.strictEqual(result.marksObtained, 6.75);
  assert.strictEqual(result.totalMarks, 8);
  assert.strictEqual(result.resultStatus, 'pass');
});

test('JWT signing and verification works as expected', () => {
  const { signAccessToken, verifyAccessToken } = require('../src/utils/jwt');
  const payload = { id: 'user123', email: 'test@example.com', role: 'student' };
  const token = signAccessToken(payload);
  assert.ok(typeof token === 'string' && token.length > 20);

  const decoded = verifyAccessToken(token);
  assert.strictEqual(decoded.id, 'user123');
  assert.strictEqual(decoded.role, 'student');
});

test('Timing-safe token comparison protects against timing attacks', () => {
  const { safeCompare } = require('../src/utils/tokenCompare');
  assert.strictEqual(safeCompare('secret123', 'secret123'), true);
  assert.strictEqual(safeCompare('secret123', 'secret124'), false);
  assert.strictEqual(safeCompare('short', 'longer_string'), false);
});

