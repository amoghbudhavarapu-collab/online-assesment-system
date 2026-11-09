const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { requireAuth } = require('../../middleware/requireAuth');
const { roleGuard } = require('../../middleware/roleGuard');
const { validate } = require('../../middleware/validate');
const {
  listUsersQuerySchema,
  updateUserSchema,
  updateStatusSchema,
  updateOwnProfileSchema
} = require('./user.schema');

// Authenticated user profile routes
router.get('/me', requireAuth, userController.getOwnProfile);
router.patch(
  '/me',
  requireAuth,
  validate(updateOwnProfileSchema, 'body'),
  userController.updateOwnProfile
);

// Admin-only user management routes
router.get(
  '/',
  requireAuth,
  roleGuard('admin'),
  validate(listUsersQuerySchema, 'query'),
  userController.listUsers
);

router.get('/:id', requireAuth, roleGuard('admin'), userController.getUserById);

router.patch(
  '/:id',
  requireAuth,
  roleGuard('admin'),
  validate(updateUserSchema, 'body'),
  userController.updateUser
);

router.patch(
  '/:id/status',
  requireAuth,
  roleGuard('admin'),
  validate(updateStatusSchema, 'body'),
  userController.updateUserStatus
);

module.exports = router;

