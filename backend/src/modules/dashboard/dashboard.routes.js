const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const { requireAuth } = require('../../middleware/requireAuth');
const { roleGuard } = require('../../middleware/roleGuard');

router.use(requireAuth);

router.get('/admin', roleGuard('admin'), dashboardController.getAdminStats);
router.get('/teacher', roleGuard('teacher', 'admin'), dashboardController.getTeacherStats);
router.get('/student', roleGuard('student'), dashboardController.getStudentStats);

module.exports = router;

