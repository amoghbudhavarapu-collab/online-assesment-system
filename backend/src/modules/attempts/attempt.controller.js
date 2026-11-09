const attemptService = require('./attempt.service');

class AttemptController {
  async startExamination(req, res, next) {
    try {
      const result = await attemptService.startExamination(
        req.params.id,
        req.user._id
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttempt(req, res, next) {
    try {
      const result = await attemptService.getAttempt(
        req.params.id,
        req.user._id
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async saveAnswer(req, res, next) {
    try {
      const result = await attemptService.saveAnswer(
        req.params.id,
        req.params.questionId,
        req.body,
        req.user._id
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAttempt(req, res, next) {
    try {
      const result = await attemptService.submitAttempt(
        req.params.id,
        req.user._id,
        'manual'
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyAttempts(req, res, next) {
    try {
      const results = await attemptService.getMyAttempts(req.user._id);
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttemptController();

