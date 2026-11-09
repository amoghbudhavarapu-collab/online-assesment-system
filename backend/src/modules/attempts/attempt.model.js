const mongoose = require('mongoose');

const attemptAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    selectedAnswer: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    isAnswered: {
      type: Boolean,
      default: false
    },
    isMarkedForReview: {
      type: Boolean,
      default: false
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    isCorrect: {
      type: Boolean
    },
    marksAwarded: {
      type: Number
    }
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    examinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Examination',
      required: true,
      index: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    answers: {
      type: [attemptAnswerSchema],
      default: []
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now
    },
    deadlineAt: {
      type: Date,
      required: true
    },
    submittedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['in_progress', 'submitted', 'auto_submitted'],
      default: 'in_progress',
      index: true
    },
    submissionType: {
      type: String,
      enum: ['manual', 'auto'],
      default: 'manual'
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    attemptedQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    incorrectAnswers: {
      type: Number,
      default: 0
    },
    unansweredQuestions: {
      type: Number,
      default: 0
    },
    marksObtained: {
      type: Number,
      default: 0
    },
    totalMarks: {
      type: Number,
      default: 0
    },
    percentage: {
      type: Number,
      default: 0
    },
    resultStatus: {
      type: String,
      enum: ['pass', 'fail', 'pending'],
      default: 'pending'
    },
    evaluatedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Enforce single attempt per student per examination
attemptSchema.index({ examinationId: 1, studentId: 1 }, { unique: true });

const Attempt = mongoose.model('Attempt', attemptSchema);

module.exports = { Attempt };

