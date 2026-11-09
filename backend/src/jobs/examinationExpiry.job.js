const cron = require('node-cron');
const { Attempt } = require('../modules/attempts/attempt.model');
const { Examination } = require('../modules/examinations/examination.model');
const attemptService = require('../modules/attempts/attempt.service');

let cronTask = null;

function startExaminationExpiryJob() {
  // Runs every minute: * * * * *
  cronTask = cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // 1. Auto-submit any overdue in_progress attempts
      const expiredAttempts = await Attempt.find({
        status: 'in_progress',
        deadlineAt: { $lt: now }
      }).limit(50);

      for (const attempt of expiredAttempts) {
        try {
          await attemptService.submitAttempt(attempt._id, attempt.studentId, 'auto');
          console.log(`[JOB] Auto-submitted expired attempt: ${attempt._id}`);
        } catch (err) {
          console.error(`[JOB] Error auto-submitting attempt ${attempt._id}:`, err.message);
        }
      }

      // 2. Transition examination statuses
      // Transitions scheduled -> live
      await Examination.updateMany(
        {
          status: 'scheduled',
          startTime: { $lte: now },
          endTime: { $gte: now }
        },
        { $set: { status: 'live' } }
      );

      // Transitions live -> completed
      await Examination.updateMany(
        {
          status: 'live',
          endTime: { $lt: now }
        },
        { $set: { status: 'completed' } }
      );
    } catch (error) {
      console.error('[JOB] Examination expiry job error:', error.message);
    }
  });

  console.log('🕒 Background examination expiry cron job initialized (runs every 60s)');
}

function stopExaminationExpiryJob() {
  if (cronTask) {
    cronTask.stop();
  }
}

module.exports = {
  startExaminationExpiryJob,
  stopExaminationExpiryJob
};

