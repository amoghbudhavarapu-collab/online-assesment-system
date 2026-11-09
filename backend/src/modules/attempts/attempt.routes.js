const express = require('express');
const router = express.Router();
const attemptController = require('./attempt.controller');
const { requireAuth } = require('../../middleware/requireAuth');
const { roleGuard } = require('../../middleware/roleGuard');
const { validate } = require('../../middleware/validate');
const { saveAnswerSchema } = require('./attempt.schema');

router.use(requireAuth);

// Student view own attempts
router.get('/my-attempts', roleGuard('student'), attemptController.getMyAttempts);

// Start examination attempt (alternative direct endpoint)
router.post('/start/:id', roleGuard('student'), attemptController.startExamination);

// Get attempt questions & answers
router.get('/:id', attemptController.getAttempt);

// Save or update an answer for a question
router.put(
  '/:id/answers/:questionId',
  validate(saveAnswerSchema, 'body'),
  attemptController.saveAnswer
);

// Submit examination attempt
router.post('/:id/submit', attemptController.submitAttempt);

module.exports = router;

