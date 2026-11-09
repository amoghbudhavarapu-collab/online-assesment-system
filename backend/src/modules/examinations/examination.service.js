const { Examination } = require('./examination.model');
const { Question } = require('../questions/question.model');
const { Attempt } = require('../attempts/attempt.model');
const { assertOwnership } = require('../../utils/ownershipCheck');

class ExaminationService {
  /**
   * Snapshot questions and create examination
   */
  async createExamination(data, userId) {
    const { questionIds, ...examData } = data;

    let questionSnapshots = [];
    if (questionIds && questionIds.length > 0) {
      questionSnapshots = await this._buildQuestionSnapshots(questionIds, userId);
    }

    const examination = new Examination({
      ...examData,
      questions: questionSnapshots,
      createdBy: userId,
      status: 'draft'
    });

    await examination.save();

    // Lock the questions so they cannot be edited/deleted destructively
    if (questionIds && questionIds.length > 0) {
      await Question.updateMany({ _id: { $in: questionIds } }, { isLocked: true });
    }

    return examination;
  }

  /**
   * Helper to fetch questions and build immutable snapshots
   */
  async _buildQuestionSnapshots(questionIds, userId) {
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      const error = new Error('One or more selected questions do not exist');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    return questions.map((q, idx) => ({
      questionId: q._id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      acceptedAnswers: q.acceptedAnswers,
      marks: q.marks,
      negativeMarks: q.negativeMarks,
      explanation: q.explanation,
      order: idx + 1
    }));
  }

  /**
   * List examinations based on user role
   */
  async listExaminations(filters, user) {
    const { page = 1, limit = 20, status, subject, search } = filters;
    const query = {};

    if (user.role === 'teacher') {
      query.createdBy = user._id;
    } else if (user.role === 'student') {
      query.status = { $nin: ['draft', 'cancelled'] };
      query.$or = [
        { assignedStudents: { $size: 0 } },
        { assignedStudents: user._id }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (subject) {
      query.subject = subject;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const total = await Examination.countDocuments(query);
    const examinations = await Examination.find(query)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('createdBy', 'name email');

    // Update statuses dynamically
    const now = new Date();
    for (const exam of examinations) {
      if (exam.status !== 'cancelled' && exam.status !== 'draft' && !exam.resultsPublished) {
        if (now >= exam.startTime && now <= exam.endTime && exam.status !== 'live') {
          exam.status = 'live';
          await exam.save();
        } else if (now > exam.endTime && exam.status !== 'completed') {
          exam.status = 'completed';
          await exam.save();
        }
      }
    }

    // Sanitize for student: hide question answer keys
    let sanitizedExams = examinations.map((e) => e.toJSON());
    if (user.role === 'student') {
      sanitizedExams = sanitizedExams.map((exam) => this._sanitizeExamForStudent(exam));
    }

    return {
      examinations: sanitizedExams,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Get examination by ID
   */
  async getExaminationById(id, user) {
    const exam = await assertOwnership(Examination, id, user._id, {
      allowAdmin: true,
      userRole: user.role,
      populate: { path: 'createdBy', select: 'name email' }
    });

    const examJson = exam.toJSON();

    if (user.role === 'student') {
      return this._sanitizeExamForStudent(examJson);
    }

    return examJson;
  }

  /**
   * Update examination
   */
  async updateExamination(id, updateData, user) {
    const examination = await assertOwnership(Examination, id, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    if (['completed', 'cancelled'].includes(examination.status)) {
      const error = new Error(`Cannot modify an examination with status '${examination.status}'`);
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    const { questionIds, ...rest } = updateData;

    if (questionIds) {
      examination.questions = await this._buildQuestionSnapshots(questionIds, user._id);
      await Question.updateMany({ _id: { $in: questionIds } }, { isLocked: true });
    }

    Object.assign(examination, rest);
    await examination.save();

    return examination;
  }

  /**
   * Delete draft examination
   */
  async deleteDraftExamination(id, user) {
    const examination = await assertOwnership(Examination, id, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    if (examination.status !== 'draft') {
      const error = new Error('Only draft examinations can be deleted');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    await Examination.findByIdAndDelete(id);
    return { id, message: 'Draft examination deleted successfully' };
  }

  /**
   * Publish an examination
   */
  async publishExamination(id, user) {
    const examination = await assertOwnership(Examination, id, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    if (examination.status !== 'draft') {
      const error = new Error(`Cannot publish an examination that is already '${examination.status}'`);
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    if (!examination.questions || examination.questions.length === 0) {
      const error = new Error('Cannot publish an examination with no questions');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    const now = new Date();
    if (now >= examination.startTime && now <= examination.endTime) {
      examination.status = 'live';
    } else {
      examination.status = 'scheduled';
    }

    await examination.save();
    return examination;
  }

  /**
   * Cancel an examination
   */
  async cancelExamination(id, user) {
    const examination = await assertOwnership(Examination, id, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    if (examination.status === 'completed' || examination.status === 'results_published') {
      const error = new Error('Cannot cancel a completed examination');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    examination.status = 'cancelled';
    await examination.save();
    return examination;
  }

  /**
   * Get available examinations for the authenticated student
   */
  async getStudentAvailableExaminations(studentId) {
    const now = new Date();

    const exams = await Examination.find({
      status: { $in: ['scheduled', 'live', 'completed'] },
      $or: [
        { assignedStudents: { $size: 0 } },
        { assignedStudents: studentId }
      ]
    }).sort({ startTime: 1 });

    // Find student attempts
    const attempts = await Attempt.find({
      studentId,
      examinationId: { $in: exams.map((e) => e._id) }
    });

    const attemptMap = new Map();
    attempts.forEach((att) => {
      attemptMap.set(att.examinationId.toString(), att);
    });

    return exams.map((exam) => {
      const examJson = exam.toJSON();
      const studentAttempt = attemptMap.get(exam._id.toString());

      let studentStatus = 'eligible';
      if (studentAttempt) {
        studentStatus = studentAttempt.status; // 'in_progress', 'submitted', 'auto_submitted'
      } else if (now < exam.startTime) {
        studentStatus = 'upcoming';
      } else if (now > exam.endTime) {
        studentStatus = 'missed';
      }

      return {
        ...this._sanitizeExamForStudent(examJson),
        studentStatus,
        attemptId: studentAttempt ? studentAttempt._id : null
      };
    });
  }

  /**
   * Strips sensitive answer keys from student view
   */
  _sanitizeExamForStudent(exam) {
    if (!exam.questions) return exam;

    exam.questions = exam.questions.map((q) => {
      const { correctAnswer, acceptedAnswers, explanation, ...sanitized } = q;
      return sanitized;
    });

    return exam;
  }
}

module.exports = new ExaminationService();

