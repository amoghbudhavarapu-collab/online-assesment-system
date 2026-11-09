const dashboardService = require('./dashboard.service');

class DashboardController {
  async getAdminStats(req, res, next) {
    try {
      const stats = await dashboardService.getAdminDashboardStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getTeacherStats(req, res, next) {
    try {
      const stats = await dashboardService.getTeacherDashboardStats(req.user._id);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentStats(req, res, next) {
    try {
      const stats = await dashboardService.getStudentDashboardStats(req.user._id);
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();

