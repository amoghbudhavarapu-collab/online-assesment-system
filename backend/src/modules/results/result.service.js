const { Attempt } = require('../attempts/attempt.model');
const { Examination } = require('../examinations/examination.model');
const { assertOwnership } = require('../../utils/ownershipCheck');

class ResultService {
  /**
   * Get student's published results
   */
  async getMyResults(studentId) {
    const attempts = await Attempt.find({
      studentId,
      status: { $in: ['submitted', 'auto_submitted'] }
    })
      .sort({ submittedAt: -1 })
      .populate('examinationId', 'title subject totalMarks passingMarks resultsPublished');

    // Only return attempts where results are published
    const publishedAttempts = attempts.filter(
      (a) => a.examinationId && a.examinationId.resultsPublished
    );

    return publishedAttempts.map((att) => ({
      attemptId: att._id,
      examinationId: att.examinationId._id,
      examinationTitle: att.examinationId.title,
      subject: att.examinationId.subject,
      totalQuestions: att.totalQuestions,
      attemptedQuestions: att.attemptedQuestions,
      correctAnswers: att.correctAnswers,
      incorrectAnswers: att.incorrectAnswers,
      unansweredQuestions: att.unansweredQuestions,
      marksObtained: att.marksObtained,
      totalMarks: att.totalMarks,
      percentage: att.percentage,
      resultStatus: att.resultStatus,
      submittedAt: att.submittedAt,
      submissionType: att.submissionType
    }));
  }

  /**
   * Get all results for a specific examination (Teacher/Admin)
   */
  async getExaminationResults(examinationId, user, queryParams = {}) {
    const { search, status, sortBy = 'marksObtained', order = 'desc', page = 1, limit = 20 } = queryParams;

    const examination = await assertOwnership(Examination, examinationId, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    const query = {
      examinationId,
      status: { $in: ['submitted', 'auto_submitted'] }
    };

    if (status) {
      query.resultStatus = status;
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['marksObtained', 'percentage', 'submittedAt'].includes(sortBy)
      ? sortBy
      : 'marksObtained';

    let attemptsQuery = Attempt.find(query)
      .sort({ [sortField]: sortOrder })
      .populate('studentId', 'name email');

    let allAttempts = await attemptsQuery.exec();

    // Client-side search on student name or email if search string provided
    if (search) {
      const s = search.toLowerCase();
      allAttempts = allAttempts.filter(
        (a) =>
          (a.studentId?.name && a.studentId.name.toLowerCase().includes(s)) ||
          (a.studentId?.email && a.studentId.email.toLowerCase().includes(s))
      );
    }

    const total = allAttempts.length;
    const startIndex = (page - 1) * limit;
    const paginatedAttempts = allAttempts.slice(startIndex, startIndex + Number(limit));

    // Calculate aggregated statistics
    const passedCount = allAttempts.filter((a) => a.resultStatus === 'pass').length;
    const failedCount = allAttempts.filter((a) => a.resultStatus === 'fail').length;
    const totalMarksSum = allAttempts.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
    const averageScore = total > 0 ? Number((totalMarksSum / total).toFixed(2)) : 0;
    const highestScore = total > 0 ? Math.max(...allAttempts.map((a) => a.marksObtained || 0)) : 0;

    return {
      examination: {
        _id: examination._id,
        title: examination.title,
        subject: examination.subject,
        totalMarks: examination.totalMarks,
        passingMarks: examination.passingMarks,
        resultsPublished: examination.resultsPublished
      },
      stats: {
        totalAttendees: total,
        passed: passedCount,
        failed: failedCount,
        averageScore,
        highestScore
      },
      attempts: paginatedAttempts.map((a) => ({
        attemptId: a._id,
        student: a.studentId
          ? {
              _id: a.studentId._id,
              name: a.studentId.name,
              email: a.studentId.email
            }
          : { name: 'Unknown', email: 'N/A' },
        totalQuestions: a.totalQuestions,
        attemptedQuestions: a.attemptedQuestions,
        correctAnswers: a.correctAnswers,
        incorrectAnswers: a.incorrectAnswers,
        unansweredQuestions: a.unansweredQuestions,
        marksObtained: a.marksObtained,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        resultStatus: a.resultStatus,
        submittedAt: a.submittedAt,
        submissionType: a.submissionType
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  /**
   * Get single detailed result by attempt ID
   */
  async getResultById(attemptId, user) {
    const attempt = await Attempt.findById(attemptId)
      .populate('studentId', 'name email')
      .populate('examinationId');

    if (!attempt) {
      const error = new Error('Result not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const exam = attempt.examinationId;
    const isOwner = attempt.studentId._id.toString() === user._id.toString();
    const isTeacher = exam.createdBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isTeacher && !isAdmin) {
      const error = new Error('Result not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Student can only see results if resultsPublished is true
    if (isOwner && !isTeacher && !isAdmin && !exam.resultsPublished) {
      const error = new Error('Results for this examination have not been published yet');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // Map questions with evaluation details
    const questionDetails = exam.questions.map((q) => {
      const qId = q.questionId ? q.questionId.toString() : q._id.toString();
      const ans = attempt.answers.find((a) => a.questionId.toString() === qId);

      return {
        questionId: qId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        selectedAnswer: ans ? ans.selectedAnswer : null,
        isAnswered: ans ? ans.isAnswered : false,
        isCorrect: ans ? ans.isCorrect : false,
        marksAwarded: ans ? ans.marksAwarded : 0
      };
    });

    return {
      attemptId: attempt._id,
      student: {
        _id: attempt.studentId._id,
        name: attempt.studentId.name,
        email: attempt.studentId.email
      },
      examination: {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        duration: exam.duration
      },
      totalQuestions: attempt.totalQuestions,
      attemptedQuestions: attempt.attemptedQuestions,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      unansweredQuestions: attempt.unansweredQuestions,
      marksObtained: attempt.marksObtained,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      resultStatus: attempt.resultStatus,
      submittedAt: attempt.submittedAt,
      submissionType: attempt.submissionType,
      questions: questionDetails
    };
  }

  /**
   * Publish results for an examination (Teacher/Admin)
   */
  async publishExaminationResults(examinationId, user) {
    const exam = await assertOwnership(Examination, examinationId, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    exam.resultsPublished = true;
    exam.status = 'results_published';
    await exam.save();

    return {
      examinationId: exam._id,
      title: exam.title,
      resultsPublished: true,
      message: 'Examination results have been published successfully'
    };
  }

  /**
   * Generates CSV string of results for an examination
   */
  async generateResultsCSV(examinationId, user) {
    const exam = await assertOwnership(Examination, examinationId, user._id, {
      allowAdmin: true,
      userRole: user.role
    });

    const attempts = await Attempt.find({
      examinationId,
      status: { $in: ['submitted', 'auto_submitted'] }
    })
      .sort({ marksObtained: -1 })
      .populate('studentId', 'name email');

    const headers = [
      'Student Name',
      'Email',
      'Total Questions',
      'Attempted Questions',
      'Correct Answers',
      'Incorrect Answers',
      'Unanswered Questions',
      'Marks Obtained',
      'Total Marks',
      'Percentage (%)',
      'Status',
      'Submission Type',
      'Submitted At'
    ];

    const rows = attempts.map((a) => [
      `"${a.studentId?.name || 'N/A'}"`,
      `"${a.studentId?.email || 'N/A'}"`,
      a.totalQuestions,
      a.attemptedQuestions,
      a.correctAnswers,
      a.incorrectAnswers,
      a.unansweredQuestions,
      a.marksObtained,
      a.totalMarks,
      `${a.percentage}%`,
      a.resultStatus?.toUpperCase(),
      a.submissionType,
      a.submittedAt ? new Date(a.submittedAt).toISOString() : 'N/A'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return {
      filename: `results-${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`,
      csvContent
    };
  }
}

module.exports = new ResultService();

