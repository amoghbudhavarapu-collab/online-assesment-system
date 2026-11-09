const express = require('express');
const router = express.Router();
const examinationController = require('./examination.controller');
const attemptController = require('../attempts/attempt.controller');
const { requireAuth } = require('../../middleware/requireAuth');
const { roleGuard } = require('../../middleware/roleGuard');
const { validate } = require('../../middleware/validate');
const {
  createExaminationSchema,
  updateExaminationSchema,
  listExaminationsQuerySchema
} = require('./examination.schema');

router.use(requireAuth);

// Student start examination route (POST /examinations/:id/start)
router.post(
  '/:id/start',
  roleGuard('student'),
  attemptController.startExamination
);

// Student available examinations route (must be before /:id)
router.get(
  '/available',
  roleGuard('student'),
  examinationController.getStudentAvailableExaminations
);

// General list examinations (role-based response)
router.get(
  '/',
  validate(listExaminationsQuerySchema, 'query'),
  examinationController.listExaminations
);

// Create examination (teacher/admin)
router.post(
  '/',
  roleGuard('teacher', 'admin'),
  validate(createExaminationSchema, 'body'),
  examinationController.createExamination
);

// Single examination details
router.get('/:id', examinationController.getExaminationById);

// Update examination (owner/admin)
router.patch(
  '/:id',
  roleGuard('teacher', 'admin'),
  validate(updateExaminationSchema, 'body'),
  examinationController.updateExamination
);

// Delete draft examination (owner/admin)
router.delete(
  '/:id',
  roleGuard('teacher', 'admin'),
  examinationController.deleteDraftExamination
);

// Publish examination (owner/admin)
router.post(
  '/:id/publish',
  roleGuard('teacher', 'admin'),
  examinationController.publishExamination
);

// Cancel examination (owner/admin)
router.post(
  '/:id/cancel',
  roleGuard('teacher', 'admin'),
  examinationController.cancelExamination
);

module.exports = router;
