const { User } = require('./user.model');
const mongoose = require('mongoose');

class UserService {
  /**
   * Lists users with search, role filter, and pagination
   */
  async listUsers({ page = 1, limit = 20, role, search, isActive }) {
    const query = {};

    if (role) {
      query.role = role;
    }

    if (typeof isActive === 'boolean') {
      query.isActive = isActive;
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Retrieves single user details by ID
   */
  async getUserById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return user;
  }

  /**
   * Admin update of a user account
   */
  async updateUser(id, updateData, currentAdminId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Prevent admin from removing their own admin role
    if (id.toString() === currentAdminId.toString() && updateData.role && updateData.role !== 'admin') {
      const error = new Error('You cannot demote your own administrator account');
      error.statusCode = 403;
      error.code = 'CANNOT_SELF_DEMOTE';
      throw error;
    }

    if (updateData.email) {
      const existing = await User.findOne({
        email: updateData.email,
        _id: { $ne: id }
      });
      if (existing) {
        const error = new Error('A user with this email already exists');
        error.statusCode = 409;
        error.code = 'CONFLICT';
        throw error;
      }
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return user;
  }

  /**
   * Admin toggle user activation status
   */
  async updateUserStatus(id, isActive, currentAdminId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (id.toString() === currentAdminId.toString() && isActive === false) {
      const error = new Error('You cannot deactivate your own administrator account');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { isActive } },
      { new: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return user;
  }

  /**
   * User update of their own profile
   */
  async updateOwnProfile(userId, { name }) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { name } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    return user;
  }
}

module.exports = new UserService();
