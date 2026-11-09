const authService = require('./auth.service');
const { env } = require('../../config/env');

const COOKIE_NAME = 'refreshToken';

function getCookieOptions() {
  const isProd = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());
      return res.status(201).json({
        success: true,
        token: result.accessToken,
        accessToken: result.accessToken,
        user: result.user,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());
      return res.status(200).json({
        success: true,
        token: result.accessToken,
        accessToken: result.accessToken,
        user: result.user,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      const result = await authService.refresh(token);
      res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());
      return res.status(200).json({
        success: true,
        token: result.accessToken,
        accessToken: result.accessToken,
        user: result.user,
        data: {
          user: result.user,
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = req.cookies?.[COOKIE_NAME] || req.body?.refreshToken;
      await authService.logout(token);
      res.clearCookie(COOKIE_NAME, getCookieOptions());
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: {
          message: 'Logged out successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        user: req.user,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(
        req.user._id,
        currentPassword,
        newPassword
      );
      res.cookie(COOKIE_NAME, result.refreshToken, getCookieOptions());
      return res.status(200).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          message: 'Password changed successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();

