const { Attempt } = require('./attempt.model');
const { Examination } = require('../examinations/examination.model');
const evaluationService = require('../../services/evaluation.service');
const { assertOwnership } = require('../../utils/ownershipCheck');

class AttemptService {
  /**
   * Starts a new examination attempt or resumes an active one
   */
  async startExamination(examinationId, studentId) {
    const examination = await Examination.findById(examinationId);
    if (!examination) {
      const error = new Error('Examination not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    if (['draft', 'cancelled'].includes(examination.status)) {
      const error = new Error(`Examination is not available (status: ${examination.status})`);
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    // Check student assignment
    if (
      examination.assignedStudents &&
      examination.assignedStudents.length > 0 &&
      !examination.assignedStudents.some((id) => id.toString() === studentId.toString())
    ) {
      const error = new Error('You are not assigned to this examination');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const now = new Date();

    // Verify time window
    if (now < examination.startTime) {
      const error = new Error('Examination has not started yet');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    if (now > examination.endTime) {
      const error = new Error('Examination window has closed');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    // Check for existing attempt
    let existingAttempt = await Attempt.findOne({
      examinationId,
      studentId
    });

    if (existingAttempt) {
      if (existingAttempt.status !== 'in_progress') {
        const error = new Error('You have already submitted this examination');
        error.statusCode = 400;
        error.code = 'INVALID_REQUEST';
        throw error;
      }

      // Check if active attempt deadline has passed
      if (now > existingAttempt.deadlineAt) {
        return this.submitAttempt(existingAttempt._id, studentId, 'auto');
      }

      return this._formatAttemptForStudent(existingAttempt, examination);
    }

    // Calculate deadline: min(now + duration, exam.endTime)
    const durationMs = examination.duration * 60 * 1000;
    const deadlineByDuration = new Date(now.getTime() + durationMs);
    const deadlineAt = deadlineByDuration > examination.endTime ? examination.endTime : deadlineByDuration;

    // Initialize answer subdocuments
    let questions = [...examination.questions];
    if (examination.shuffleQuestions) {
      questions = this._shuffleArray(questions);
    }

    const initialAnswers = questions.map((q) => ({
      questionId: q.questionId || q._id,
      selectedAnswer: null,
      isAnswered: false,
      isMarkedForReview: false,
      savedAt: now
    }));

    const attempt = await Attempt.create({
      examinationId,
      studentId,
      answers: initialAnswers,
      startedAt: now,
      deadlineAt,
      status: 'in_progress',
      totalQuestions: questions.length,
      totalMarks: examination.totalMarks
    });

    return this._formatAttemptForStudent(attempt, examination);
  }

  /**
   * Get active attempt details and sanitized questions
   */
  async getAttempt(attemptId, studentId) {
    const attempt = await assertOwnership(Attempt, attemptId, studentId, {
      ownerField: 'studentId'
    });

    const examination = await Examination.findById(attempt.examinationId);
    if (!examination) {
      const error = new Error('Examination not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Enforce deadline check on read
    if (attempt.status === 'in_progress' && new Date() > attempt.deadlineAt) {
      return this.submitAttempt(attempt._id, studentId, 'auto');
    }

    return this._formatAttemptForStudent(attempt, examination);
  }

  /**
   * Saves or updates student's answer for a single question
   */
  async saveAnswer(attemptId, questionId, { selectedAnswer, isMarkedForReview }, studentId) {
    const attempt = await assertOwnership(Attempt, attemptId, studentId, {
      ownerField: 'studentId'
    });

    if (attempt.status !== 'in_progress') {
      const error = new Error('Attempt is already submitted and cannot be modified');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    const now = new Date();
    if (now > attempt.deadlineAt) {
      await this.submitAttempt(attempt._id, studentId, 'auto');
      const error = new Error('Examination time has expired. Your attempt has been automatically submitted.');
      error.statusCode = 400;
      error.code = 'INVALID_REQUEST';
      throw error;
    }

    // Locate question in answers array
    const answerIndex = attempt.answers.findIndex(
      (a) => a.questionId.toString() === questionId.toString()
    );

    const isAnswered = selectedAnswer !== null && selectedAnswer !== undefined && selectedAnswer !== '';

    if (answerIndex > -1) {
      attempt.answers[answerIndex].selectedAnswer = selectedAnswer;
      attempt.answers[answerIndex].isAnswered = isAnswered;
      if (typeof isMarkedForReview === 'boolean') {
        attempt.answers[answerIndex].isMarkedForReview = isMarkedForReview;
      }
      attempt.answers[answerIndex].savedAt = now;
    } else {
      attempt.answers.push({
        questionId,
        selectedAnswer,
        isAnswered,
        isMarkedForReview: Boolean(isMarkedForReview),
        savedAt: now
      });
    }

    attempt.attemptedQuestions = attempt.answers.filter((a) => a.isAnswered).length;
    attempt.unansweredQuestions = attempt.totalQuestions - attempt.attemptedQuestions;

    await attempt.save();

    return {
      attemptId: attempt._id,
      questionId,
      isAnswered,
      isMarkedForReview: Boolean(isMarkedForReview),
      savedAt: now
    };
  }

  /**
   * Finalizes and evaluates the attempt (manual or automatic on time expiry)
   */
  async submitAttempt(attemptId, studentId, submissionType = 'manual') {
    const attempt = await assertOwnership(Attempt, attemptId, studentId, {
      ownerField: 'studentId'
    });

    if (attempt.status !== 'in_progress') {
      return attempt;
    }

    const examination = await Examination.findById(attempt.examinationId);
    if (!examination) {
      const error = new Error('Examination not found');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    // Perform automatic evaluation
    const evaluation = evaluationService.evaluateAttempt(
      examination.questions,
      attempt.answers,
      {
        negativeMarkingEnabled: examination.negativeMarkingEnabled,
        passingMarks: examination.passingMarks
      }
    );

    attempt.answers = evaluation.evaluatedAnswers;
    attempt.totalQuestions = evaluation.totalQuestions;
    attempt.attemptedQuestions = evaluation.attemptedQuestions;
    attempt.correctAnswers = evaluation.correctAnswers;
    attempt.incorrectAnswers = evaluation.incorrectAnswers;
    attempt.unansweredQuestions = evaluation.unansweredQuestions;
    attempt.marksObtained = evaluation.marksObtained;
    attempt.totalMarks = evaluation.totalMarks;
    attempt.percentage = evaluation.percentage;
    attempt.resultStatus = evaluation.resultStatus;
    attempt.evaluatedAt = evaluation.evaluatedAt;
    attempt.submittedAt = new Date();
    attempt.status = submissionType === 'auto' ? 'auto_submitted' : 'submitted';
    attempt.submissionType = submissionType;

    await attempt.save();

    // If resultPublicationMode is auto, publish results
    if (examination.resultPublicationMode === 'auto' && !examination.resultsPublished) {
      examination.resultsPublished = true;
      await examination.save();
    }

    return this._formatAttemptForStudent(attempt, examination);
  }

  /**
   * Lists all attempts made by the authenticated student
   */
  async getMyAttempts(studentId) {
    const attempts = await Attempt.find({ studentId })
      .sort({ createdAt: -1 })
      .populate('examinationId', 'title subject duration totalMarks passingMarks resultsPublished status');

    return attempts.map((att) => {
      const exam = att.examinationId;
      const showResults = exam && exam.resultsPublished;

      return {
        _id: att._id,
        examination: exam
          ? {
              _id: exam._id,
              title: exam.title,
              subject: exam.subject,
              duration: exam.duration,
              totalMarks: exam.totalMarks,
              passingMarks: exam.passingMarks,
              resultsPublished: exam.resultsPublished
            }
          : null,
        startedAt: att.startedAt,
        deadlineAt: att.deadlineAt,
        submittedAt: att.submittedAt,
        status: att.status,
        submissionType: att.submissionType,
        totalQuestions: att.totalQuestions,
        attemptedQuestions: att.attemptedQuestions,
        // Only disclose marks and result status if results are published
        marksObtained: showResults ? att.marksObtained : null,
        percentage: showResults ? att.percentage : null,
        resultStatus: showResults ? att.resultStatus : 'pending'
      };
    });
  }

  /**
   * Formats attempt object for student client
   */
  _formatAttemptForStudent(attempt, examination) {
    const now = new Date();
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(attempt.deadlineAt).getTime() - now.getTime()) / 1000)
    );

    const isSubmitted = attempt.status !== 'in_progress';
    const showDetailedAnswers = isSubmitted && examination.resultsPublished;

    // Map examination questions with student's current answers
    const questions = examination.questions.map((q) => {
      const qId = q.questionId ? q.questionId.toString() : q._id.toString();
      const studentAns = attempt.answers.find(
        (a) => a.questionId.toString() === qId
      );

      const base = {
        questionId: qId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        selectedAnswer: studentAns ? studentAns.selectedAnswer : null,
        isAnswered: studentAns ? studentAns.isAnswered : false,
        isMarkedForReview: studentAns ? studentAns.isMarkedForReview : false
      };

      if (showDetailedAnswers) {
        base.correctAnswer = q.correctAnswer;
        base.explanation = q.explanation;
        base.isCorrect = studentAns ? studentAns.isCorrect : false;
        base.marksAwarded = studentAns ? studentAns.marksAwarded : 0;
      }

      return base;
    });

    return {
      attemptId: attempt._id,
      examinationId: examination._id,
      examinationTitle: examination.title,
      subject: examination.subject,
      instructions: examination.instructions,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      submittedAt: attempt.submittedAt,
      remainingSeconds,
      status: attempt.status,
      submissionType: attempt.submissionType,
      totalQuestions: attempt.totalQuestions,
      attemptedQuestions: attempt.attemptedQuestions,
      unansweredQuestions: attempt.unansweredQuestions,
      totalMarks: examination.totalMarks,
      resultsPublished: examination.resultsPublished,
      marksObtained: showDetailedAnswers ? attempt.marksObtained : null,
      percentage: showDetailedAnswers ? attempt.percentage : null,
      resultStatus: showDetailedAnswers ? attempt.resultStatus : null,
      questions
    };
  }

  /**
   * Helper to randomly shuffle array (Fisher-Yates)
   */
  _shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

module.exports = new AttemptService();

