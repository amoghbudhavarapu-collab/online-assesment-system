const userService = require('./user.service');

class UserController {
  async listUsers(req, res, next) {
    try {
      const result = await userService.listUsers(req.query);
      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const updatedUser = await userService.updateUser(
        req.params.id,
        req.body,
        req.user._id
      );
      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const updatedUser = await userService.updateUserStatus(
        req.params.id,
        req.body.isActive,
        req.user._id
      );
      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnProfile(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOwnProfile(req, res, next) {
    try {
      const updatedUser = await userService.updateOwnProfile(
        req.user._id,
        req.body
      );
      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();

