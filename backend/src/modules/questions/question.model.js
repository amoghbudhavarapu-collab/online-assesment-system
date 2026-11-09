const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true
    },
    questionType: {
      type: String,
      required: [true, 'Question type is required'],
      enum: {
        values: ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANKS'],
        message: 'Unsupported question type'
      }
    },
    options: {
      type: [String],
      default: []
    },
    // correctAnswer can be string, boolean, or array of strings depending on questionType
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Correct answer is required']
    },
    acceptedAnswers: {
      type: [String],
      default: []
    },
    marks: {
      type: Number,
      required: [true, 'Marks are required'],
      min: [0.5, 'Marks must be at least 0.5'],
      default: 1
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, 'Negative marks cannot be negative']
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    category: {
      type: String,
      required: [true, 'Category / subject is required'],
      trim: true,
      index: true
    },
    explanation: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    isLocked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Compound index for teacher question bank search and filtering
questionSchema.index({ createdBy: 1, category: 1, difficulty: 1, questionType: 1 });
questionSchema.index({ questionText: 'text', category: 'text' });

const Question = mongoose.model('Question', questionSchema);

module.exports = { Question };
