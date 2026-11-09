const resultService = require('./result.service');

class ResultController {
  async getMyResults(req, res, next) {
    try {
      const results = await resultService.getMyResults(req.user._id);
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getExaminationResults(req, res, next) {
    try {
      const results = await resultService.getExaminationResults(
        req.params.id,
        req.user,
        req.query
      );
      return res.status(200).json({
        success: true,
        data: results
      });
    } catch (error) {
      next(error);
    }
  }

  async getResultById(req, res, next) {
    try {
      const result = await resultService.getResultById(
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

  async publishExaminationResults(req, res, next) {
    try {
      const result = await resultService.publishExaminationResults(
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

  async exportExaminationResults(req, res, next) {
    try {
      const { filename, csvContent } = await resultService.generateResultsCSV(
        req.params.id,
        req.user
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResultController();

