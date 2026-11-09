const bcrypt = require('bcryptjs');
const { User } = require('../users/user.model');
const { Session } = require('./auth.model');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../../utils/jwt');

// 7 days in milliseconds for refresh token cookie expiry
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

class AuthService {
  /**
   * Registers a new student account
   */
  async register({ name, email, password }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      error.code = 'CONFLICT';
      throw error;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'student',
      isActive: true
    });

    const tokens = await this._createSessionAndTokens(user);

    return {
      user: user.toJSON(),
      ...tokens
    };
  }

  /**
   * Authenticates user with email and password
   */
  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Account is deactivated. Please contact an administrator.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const tokens = await this._createSessionAndTokens(user);

    return {
      user: user.toJSON(),
      ...tokens
    };
  }

  /**
   * Refreshes access token and rotates refresh token
   */
  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_INVALID';
      throw error;
    }

    const session = await Session.findById(decoded.sessionId);

    // Breach detection: If session doesn't exist or is already revoked, revoke all sessions for this user
    if (!session || session.revokedAt) {
      if (decoded.id) {
        await Session.updateMany({ userId: decoded.id }, { revokedAt: new Date() });
      }
      const error = new Error('Invalid refresh token. Session has been revoked.');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_INVALID';
      throw error;
    }

    // Verify token matches the hash in DB
    const isTokenValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isTokenValid) {
      await Session.updateMany({ userId: decoded.id }, { revokedAt: new Date() });
      const error = new Error('Refresh token reuse detected. All sessions revoked.');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_INVALID';
      throw error;
    }

    const user = await User.findById(session.userId);
    if (!user || !user.isActive) {
      const error = new Error('User not found or deactivated');
      error.statusCode = 401;
      error.code = 'UNAUTHORIZED';
      throw error;
    }

    // Rotate refresh token
    const newAccessToken = signAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const newRefreshToken = signRefreshToken({
      id: user._id,
      sessionId: session._id
    });

    // Update session with new hashed token
    const salt = await bcrypt.genSalt(10);
    session.refreshTokenHash = await bcrypt.hash(newRefreshToken, salt);
    session.expiresAt = new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE);
    await session.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: user.toJSON()
    };
  }

  /**
   * Logs out user by revoking the current session
   */
  async logout(refreshToken) {
    if (!refreshToken) return;

    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded.sessionId) {
        await Session.findByIdAndUpdate(decoded.sessionId, {
          revokedAt: new Date()
        });
      }
    } catch {
      // If token is invalid or expired, continue silently
    }
  }

  /**
   * Changes authenticated user's password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    user.password = newPassword;
    await user.save();

    // Revoke other active sessions for this user
    await Session.updateMany({ userId: user._id }, { revokedAt: new Date() });

    // Create a fresh session
    const tokens = await this._createSessionAndTokens(user);

    return {
      user: user.toJSON(),
      ...tokens
    };
  }

  /**
   * Helper to create session in DB and sign tokens
   */
  async _createSessionAndTokens(user) {
    const session = new Session({
      userId: user._id,
      refreshTokenHash: 'pending',
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_COOKIE_MAX_AGE)
    });
    await session.save();

    const accessToken = signAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const refreshToken = signRefreshToken({
      id: user._id,
      sessionId: session._id
    });

    const salt = await bcrypt.genSalt(10);
    session.refreshTokenHash = await bcrypt.hash(refreshToken, salt);
    await session.save();

    return {
      accessToken,
      refreshToken
    };
  }
}

module.exports = new AuthService();

