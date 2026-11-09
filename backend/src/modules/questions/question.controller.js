const questionService = require('./question.service');

class QuestionController {
  async createQuestion(req, res, next) {
    try {
      const question = await questionService.createQuestion(
        req.body,
        req.user._id
      );
      return res.status(201).json({
        success: true,
        data: question
      });
    } catch (error) {
      next(error);
    }
  }

  async listQuestions(req, res, next) {
    try {
      const result = await questionService.listQuestions(
        req.query,
        req.user._id,
        req.user.role
      );
      return res.status(200).json({
        success: true,
        data: result.questions,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuestionById(req, res, next) {
    try {
      const question = await questionService.getQuestionById(
        req.params.id,
        req.user._id,
        req.user.role
      );
      return res.status(200).json({
        success: true,
        data: question
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQuestion(req, res, next) {
    try {
      const question = await questionService.updateQuestion(
        req.params.id,
        req.body,
        req.user._id,
        req.user.role
      );
      return res.status(200).json({
        success: true,
        data: question
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuestion(req, res, next) {
    try {
      const result = await questionService.deleteQuestion(
        req.params.id,
        req.user._id,
        req.user.role
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionController();

