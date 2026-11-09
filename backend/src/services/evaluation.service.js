/**
 * Automatic evaluation service for objective questions.
 */
class EvaluationService {
  /**
   * Evaluates student's answers against examination question snapshots
   * 
   * @param {Array} examQuestions - Array of question snapshots from examination
   * @param {Array} studentAnswers - Array of student answers from attempt
   * @param {object} options
   * @param {boolean} options.negativeMarkingEnabled
   * @param {number} options.passingMarks
   * @returns {object} evaluation results
   */
  evaluateAttempt(examQuestions, studentAnswers, options = {}) {
    const { negativeMarkingEnabled = false, passingMarks = 0 } = options;

    const answerMap = new Map();
    studentAnswers.forEach((ans) => {
      answerMap.set(ans.questionId.toString(), ans);
    });

    let totalMarks = 0;
    let marksObtained = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let attemptedCount = 0;
    let unansweredCount = 0;

    const evaluatedAnswers = examQuestions.map((question) => {
      totalMarks += question.marks || 0;

      const qId = question.questionId ? question.questionId.toString() : question._id?.toString();
      const studentAns = answerMap.get(qId);

      const hasAnswer = studentAns && studentAns.isAnswered && studentAns.selectedAnswer !== null && studentAns.selectedAnswer !== undefined && studentAns.selectedAnswer !== '';

      let isCorrect = false;
      let marksAwarded = 0;

      if (!hasAnswer) {
        unansweredCount++;
        marksAwarded = 0;
      } else {
        attemptedCount++;
        isCorrect = this._checkAnswer(question, studentAns.selectedAnswer);

        if (isCorrect) {
          correctCount++;
          marksAwarded = question.marks || 0;
        } else {
          incorrectCount++;
          if (negativeMarkingEnabled && question.negativeMarks > 0) {
            marksAwarded = -Math.abs(question.negativeMarks);
          } else {
            marksAwarded = 0;
          }
        }
      }

      marksObtained += marksAwarded;

      return {
        questionId: question.questionId || question._id,
        selectedAnswer: studentAns ? studentAns.selectedAnswer : null,
        isAnswered: Boolean(hasAnswer),
        isMarkedForReview: studentAns ? Boolean(studentAns.isMarkedForReview) : false,
        savedAt: studentAns?.savedAt || new Date(),
        isCorrect,
        marksAwarded
      };
    });

    // Ensure final marks obtained don't fall below zero unless intended
    const finalMarksObtained = Math.max(0, marksObtained);
    const percentage = totalMarks > 0 ? Number(((finalMarksObtained / totalMarks) * 100).toFixed(2)) : 0;
    const resultStatus = finalMarksObtained >= passingMarks ? 'pass' : 'fail';

    return {
      evaluatedAnswers,
      totalQuestions: examQuestions.length,
      attemptedQuestions: attemptedCount,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unansweredQuestions: unansweredCount,
      totalMarks,
      marksObtained: Number(finalMarksObtained.toFixed(2)),
      percentage,
      resultStatus,
      evaluatedAt: new Date()
    };
  }

  /**
   * Compares student answer with correct answer based on question type
   */
  _checkAnswer(question, studentAnswer) {
    if (studentAnswer === null || studentAnswer === undefined) return false;

    switch (question.questionType) {
      case 'MCQ': {
        const student = String(studentAnswer).trim().toLowerCase();
        const correct = String(question.correctAnswer).trim().toLowerCase();
        return student === correct;
      }

      case 'MULTIPLE_SELECT': {
        if (!Array.isArray(studentAnswer) || !Array.isArray(question.correctAnswer)) {
          return false;
        }
        const studentSet = new Set(studentAnswer.map((s) => String(s).trim().toLowerCase()));
        const correctSet = new Set(question.correctAnswer.map((s) => String(s).trim().toLowerCase()));

        if (studentSet.size !== correctSet.size) return false;
        for (const item of studentSet) {
          if (!correctSet.has(item)) return false;
        }
        return true;
      }

      case 'TRUE_FALSE': {
        const student = String(studentAnswer).trim().toLowerCase();
        const correct = String(question.correctAnswer).trim().toLowerCase();
        return student === correct;
      }

      case 'FILL_BLANKS': {
        const normalizedStudent = String(studentAnswer).trim().toLowerCase();
        const primaryCorrect = String(question.correctAnswer).trim().toLowerCase();

        if (normalizedStudent === primaryCorrect) return true;

        if (Array.isArray(question.acceptedAnswers)) {
          return question.acceptedAnswers.some(
            (alt) => String(alt).trim().toLowerCase() === normalizedStudent
          );
        }
        return false;
      }

      default:
        return false;
    }
  }
}

module.exports = new EvaluationService();

