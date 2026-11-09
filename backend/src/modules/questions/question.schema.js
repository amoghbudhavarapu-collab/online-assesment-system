const { z } = require('zod');

const questionBaseSchema = z.object({
  questionText: z.string().trim().min(3, 'Question text must be at least 3 characters'),
  questionType: z.enum(['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANKS']),
  options: z.array(z.string().trim()).optional().default([]),
  correctAnswer: z.any(),
  acceptedAnswers: z.array(z.string().trim()).optional().default([]),
  marks: z.number().positive('Marks must be greater than 0').default(1),
  negativeMarks: z.number().min(0, 'Negative marks cannot be negative').default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  category: z.string().trim().min(1, 'Category is required'),
  explanation: z.string().trim().optional().default('')
});

const createQuestionSchema = questionBaseSchema.superRefine((data, ctx) => {
  if (data.questionType === 'MCQ') {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'MCQ must have at least 2 options'
      });
    }
    if (typeof data.correctAnswer !== 'string' || !data.correctAnswer.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'Correct answer is required for MCQ'
      });
    }
  } else if (data.questionType === 'MULTIPLE_SELECT') {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Multiple select must have at least 2 options'
      });
    }
    if (!Array.isArray(data.correctAnswer) || data.correctAnswer.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'Multiple select requires an array of at least 1 correct answer'
      });
    }
  } else if (data.questionType === 'TRUE_FALSE') {
    const isBool = typeof data.correctAnswer === 'boolean';
    const isBoolString = data.correctAnswer === 'true' || data.correctAnswer === 'false';
    if (!isBool && !isBoolString) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'True/False question requires true or false as correct answer'
      });
    }
  } else if (data.questionType === 'FILL_BLANKS') {
    if (typeof data.correctAnswer !== 'string' || !data.correctAnswer.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['correctAnswer'],
        message: 'Fill in the blanks requires a correct answer string'
      });
    }
  }
});

const updateQuestionSchema = questionBaseSchema.partial();

const listQuestionsQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category: z.string().optional(),
  questionType: z.enum(['MCQ', 'MULTIPLE_SELECT', 'TRUE_FALSE', 'FILL_BLANKS']).optional(),
  search: z.string().optional()
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsQuerySchema
};
