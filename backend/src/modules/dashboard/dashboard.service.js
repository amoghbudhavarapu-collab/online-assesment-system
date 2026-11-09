const { User } = require('../users/user.model');
const { Question } = require('../questions/question.model');
const { Examination } = require('../examinations/examination.model');
const { Attempt } = require('../attempts/attempt.model');

class DashboardService {
  /**
   * Comprehensive metrics for Administrator Dashboard
   */
  async getAdminDashboardStats() {
    const now = new Date();

    const [
      totalStudents,
      totalTeachers,
      totalExaminations,
      totalQuestions,
      totalAttempts,
      upcomingExams,
      liveExams,
      completedExams,
      passCount,
      failCount,
      recentExaminations
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Examination.countDocuments(),
      Question.countDocuments(),
      Attempt.countDocuments({ status: { $in: ['submitted', 'auto_submitted'] } }),
      Examination.countDocuments({ startTime: { $gt: now }, status: { $ne: 'cancelled' } }),
      Examination.countDocuments({ startTime: { $lte: now }, endTime: { $gte: now }, status: { $ne: 'cancelled' } }),
      Examination.countDocuments({ endTime: { $lt: now }, status: { $ne: 'cancelled' } }),
      Attempt.countDocuments({ resultStatus: 'pass' }),
      Attempt.countDocuments({ resultStatus: 'fail' }),
      Examination.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('createdBy', 'name email')
    ]);

    return {
      summary: {
        totalStudents,
        totalTeachers,
        totalExaminations,
        totalQuestions,
        totalAttempts
      },
      examinations: {
        upcoming: upcomingExams,
        live: liveExams,
        completed: completedExams
      },
      evaluation: {
        passed: passCount,
        failed: failCount,
        passPercentage:
          totalAttempts > 0 ? Number(((passCount / totalAttempts) * 100).toFixed(2)) : 0
      },
      recentExaminations: recentExaminations.map((e) => ({
        _id: e._id,
        title: e.title,
        subject: e.subject,
        status: e.status,
        startTime: e.startTime,
        endTime: e.endTime,
        totalMarks: e.totalMarks,
        creator: e.createdBy?.name || 'Admin'
      }))
    };
  }

  /**
   * Teacher specific metrics and analytics
   */
  async getTeacherDashboardStats(teacherId) {
    const now = new Date();

    const [
      totalQuestions,
      totalExaminations,
      upcomingExams,
      liveExams,
      completedExams,
      examinations
    ] = await Promise.all([
      Question.countDocuments({ createdBy: teacherId }),
      Examination.countDocuments({ createdBy: teacherId }),
      Examination.countDocuments({
        createdBy: teacherId,
        startTime: { $gt: now },
        status: { $ne: 'cancelled' }
      }),
      Examination.countDocuments({
        createdBy: teacherId,
        startTime: { $lte: now },
        endTime: { $gte: now },
        status: { $ne: 'cancelled' }
      }),
      Examination.countDocuments({
        createdBy: teacherId,
        endTime: { $lt: now },
        status: { $ne: 'cancelled' }
      }),
      Examination.find({ createdBy: teacherId }).select('_id title subject totalMarks status')
    ]);

    const examIds = examinations.map((e) => e._id);
    const teacherAttempts = await Attempt.find({
      examinationId: { $in: examIds },
      status: { $in: ['submitted', 'auto_submitted'] }
    });

    const totalAttempts = teacherAttempts.length;
    const passedCount = teacherAttempts.filter((a) => a.resultStatus === 'pass').length;
    const failedCount = teacherAttempts.filter((a) => a.resultStatus === 'fail').length;

    const totalScoreSum = teacherAttempts.reduce((sum, a) => sum + (a.marksObtained || 0), 0);
    const averageScore = totalAttempts > 0 ? Number((totalScoreSum / totalAttempts).toFixed(2)) : 0;

    return {
      summary: {
        totalQuestions,
        totalExaminations,
        totalAttempts,
        averageScore
      },
      examinations: {
        upcoming: upcomingExams,
        live: liveExams,
        completed: completedExams
      },
      performance: {
        passed: passedCount,
        failed: failedCount,
        passPercentage:
          totalAttempts > 0 ? Number(((passedCount / totalAttempts) * 100).toFixed(2)) : 0
      },
      recentExaminations: examinations.slice(0, 5)
    };
  }

  /**
   * Student personal performance metrics
   */
  async getStudentDashboardStats(studentId) {
    const now = new Date();

    const [availableExams, studentAttempts] = await Promise.all([
      Examination.find({
        status: { $in: ['scheduled', 'live'] },
        $or: [
          { assignedStudents: { $size: 0 } },
          { assignedStudents: studentId }
        ]
      }),
      Attempt.find({ studentId })
        .sort({ submittedAt: -1 })
        .populate('examinationId', 'title subject totalMarks passingMarks resultsPublished')
    ]);

    const submittedAttempts = studentAttempts.filter(
      (a) => a.status === 'submitted' || a.status === 'auto_submitted'
    );

    const totalAttended = submittedAttempts.length;

    // Filter attempts with published results for statistics
    const publishedAttempts = submittedAttempts.filter(
      (a) => a.examinationId && a.examinationId.resultsPublished
    );

    const percentages = publishedAttempts.map((a) => a.percentage || 0);
    const averagePercentage =
      percentages.length > 0
        ? Number((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2))
        : 0;

    const highestScore =
      publishedAttempts.length > 0
        ? Math.max(...publishedAttempts.map((a) => a.marksObtained || 0))
        : 0;

    const upcomingCount = availableExams.filter((e) => new Date(e.startTime) > now).length;
    const liveCount = availableExams.filter(
      (e) => new Date(e.startTime) <= now && new Date(e.endTime) >= now
    ).length;

    return {
      summary: {
        totalAttended,
        averagePercentage,
        highestScore,
        upcomingExaminations: upcomingCount,
        liveExaminations: liveCount
      },
      recentResults: publishedAttempts.slice(0, 5).map((a) => ({
        attemptId: a._id,
        examinationTitle: a.examinationId?.title || 'Unknown Exam',
        subject: a.examinationId?.subject || 'N/A',
        marksObtained: a.marksObtained,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        resultStatus: a.resultStatus,
        submittedAt: a.submittedAt
      }))
    };
  }
}

module.exports = new DashboardService();

