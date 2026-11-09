const express = require('express');
const router = express.Router();
const questionController = require('./question.controller');
const { requireAuth } = require('../../middleware/requireAuth');
const { roleGuard } = require('../../middleware/roleGuard');
const { validate } = require('../../middleware/validate');
const {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsQuerySchema
} = require('./question.schema');

// All question bank routes require authentication and teacher or admin role
router.use(requireAuth, roleGuard('teacher', 'admin'));

router.post(
  '/',
  validate(createQuestionSchema, 'body'),
  questionController.createQuestion
);

router.get(
  '/',
  validate(listQuestionsQuerySchema, 'query'),
  questionController.listQuestions
);

router.get('/:id', questionController.getQuestionById);

router.patch(
  '/:id',
  validate(updateQuestionSchema, 'body'),
  questionController.updateQuestion
);

router.delete('/:id', questionController.deleteQuestion);

module.exports = router;

