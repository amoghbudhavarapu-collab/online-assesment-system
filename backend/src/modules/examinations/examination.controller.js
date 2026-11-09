const examinationService = require('./examination.service');

class ExaminationController {
  async createExamination(req, res, next) {
    try {
      const exam = await examinationService.createExamination(
        req.body,
        req.user._id
      );
      return res.status(201).json({
        success: true,
        data: exam
      });
    } catch (error) {
      next(error);
    }
  }

  async listExaminations(req, res, next) {
    try {
      const result = await examinationService.listExaminations(
        req.query,
        req.user
      );
      return res.status(200).json({
        success: true,
        data: result.examinations,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  async getExaminationById(req, res, next) {
    try {
      const exam = await examinationService.getExaminationById(
        req.params.id,
        req.user
      );
      return res.status(200).json({
        success: true,
        data: exam
      });
    } catch (error) {
      next(error);
    }
  }

  async updateExamination(req, res, next) {
    try {
      const exam = await examinationService.updateExamination(
        req.params.id,
        req.body,
        req.user
      );
      return res.status(200).json({
        success: true,
        data: exam
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteDraftExamination(req, res, next) {
    try {
      const result = await examinationService.deleteDraftExamination(
        req.params.id,
        req.user
      );
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async publishExamination(req, res, next) {
    try {
      const exam = await examinationService.publishExamination(
        req.params.id,
        req.user
      );
      return res.status(200).json({
        success: true,
        data: exam
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelExamination(req, res, next) {
    try {
      const exam = await examinationService.cancelExamination(
        req.params.id,
        req.user
      );
      return res.status(200).json({
        success: true,
        data: exam
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentAvailableExaminations(req, res, next) {
    try {
      const exams = await examinationService.getStudentAvailableExaminations(
        req.user._id
      );
      return res.status(200).json({
        success: true,
        data: exams
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExaminationController();

