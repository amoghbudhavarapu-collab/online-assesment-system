const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/requireAuth');
const {
  registerSchema,
  loginSchema,
  changePasswordSchema
} = require('./auth.schema');

router.post('/register', validate(registerSchema, 'body'), authController.register);
router.post('/login', validate(loginSchema, 'body'), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);
router.patch(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema, 'body'),
  authController.changePassword
);

module.exports = router;
