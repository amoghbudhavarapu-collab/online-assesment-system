const express = require('express');
const router = express.Router();
const resultController = require('./result.controller');
const { requireAuth } = require('../../middleware/requireAuth');
const { roleGuard } = require('../../middleware/roleGuard');

router.use(requireAuth);

// Student results
router.get('/my-results', roleGuard('student'), resultController.getMyResults);

// Teacher/Admin examination results
router.get(
  '/examination/:id',
  roleGuard('teacher', 'admin'),
  resultController.getExaminationResults
);

// Publish results (Teacher/Admin)
router.post(
  '/examination/:id/publish',
  roleGuard('teacher', 'admin'),
  resultController.publishExaminationResults
);

// Export results as CSV (Teacher/Admin)
router.get(
  '/examination/:id/export',
  roleGuard('teacher', 'admin'),
  resultController.exportExaminationResults
);

// Single result details by attempt ID
router.get('/:id', resultController.getResultById);

module.exports = router;

