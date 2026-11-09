const mongoose = require('mongoose');

// Embedded question snapshot schema ensuring immutability for historical exam attempts
const questionSnapshotSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      required: true,
      enum: ['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANKS']
    },
    options: {
      type: [String],
      default: []
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    acceptedAnswers: {
      type: [String],
      default: []
    },
    marks: {
      type: Number,
      required: true,
      min: 0.5
    },
    negativeMarks: {
      type: Number,
      default: 0
    },
    explanation: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const examinationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Examination title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true
    },
    instructions: {
      type: String,
      default: 'Read all questions carefully. Time limit is strictly enforced. Answers will be submitted automatically when time expires.'
    },
    questions: {
      type: [questionSnapshotSchema],
      default: []
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute']
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0
    },
    passingMarks: {
      type: Number,
      required: [true, 'Passing marks are required'],
      min: 0
    },
    negativeMarkingEnabled: {
      type: Boolean,
      default: false
    },
    shuffleQuestions: {
      type: Boolean,
      default: false
    },
    shuffleOptions: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    resultPublicationMode: {
      type: String,
      enum: ['auto', 'manual'],
      default: 'manual'
    },
    resultsPublished: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'live', 'completed', 'results_published', 'cancelled'],
      default: 'draft',
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual property to dynamically compute effective status based on current UTC time
examinationSchema.virtual('currentStatus').get(function () {
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'draft') return 'draft';
  if (this.resultsPublished) return 'results_published';

  const now = new Date();
  if (now < this.startTime) return 'scheduled';
  if (now >= this.startTime && now <= this.endTime) return 'live';
  if (now > this.endTime) return 'completed';

  return this.status;
});

// Pre-save hook: automatically calculate totalMarks from embedded question snapshots
examinationSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMarks = this.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  }
  next();
});

const Examination = mongoose.model('Examination', examinationSchema);

module.exports = { Examination };

