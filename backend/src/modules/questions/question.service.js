const { Question } = require('./question.model');
const { assertOwnership } = require('../../utils/ownershipCheck');

class QuestionService {
  /**
   * Create a new question
   */
  async createQuestion(data, userId) {
    const question = await Question.create({
      ...data,
      createdBy: userId
    });
    return question;
  }

  /**
   * List questions with pagination and filters
   */
  async listQuestions(filters, userId, userRole) {
    const { page = 1, limit = 20, difficulty, category, questionType, search } = filters;

    const query = {};

    // Teachers only see their own questions; Admins see all
    if (userRole !== 'admin') {
      query.createdBy = userId;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    if (questionType) {
      query.questionType = questionType;
    }

    if (search) {
      query.questionText = { $regex: search, $options: 'i' };
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email');

    return {
      questions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Get single question by ID
   */
  async getQuestionById(id, userId, userRole) {
    return assertOwnership(Question, id, userId, {
      allowAdmin: true,
      userRole,
      populate: { path: 'createdBy', select: 'name email' }
    });
  }

  /**
   * Update question
   */
  async updateQuestion(id, updateData, userId, userRole) {
    const question = await assertOwnership(Question, id, userId, {
      allowAdmin: true,
      userRole
    });

    if (question.isLocked) {
      const error = new Error('This question is locked because it is linked to an active or completed examination');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    Object.assign(question, updateData);
    await question.save();
    return question;
  }

  /**
   * Delete question
   */
  async deleteQuestion(id, userId, userRole) {
    const question = await assertOwnership(Question, id, userId, {
      allowAdmin: true,
      userRole
    });

    if (question.isLocked) {
      const error = new Error('Cannot delete a question that is locked in an active or completed examination');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    await Question.findByIdAndDelete(id);
    return { id, message: 'Question deleted successfully' };
  }
}

module.exports = new QuestionService();
