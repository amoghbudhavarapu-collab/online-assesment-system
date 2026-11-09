const { z } = require('zod');

const createExaminationSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().optional().default(''),
    subject: z.string().trim().min(2, 'Subject is required'),
    instructions: z.string().trim().optional(),
    duration: z.number().int().positive('Duration must be a positive integer in minutes'),
    passingMarks: z.number().min(0, 'Passing marks cannot be negative'),
    negativeMarkingEnabled: z.boolean().optional().default(false),
    shuffleQuestions: z.boolean().optional().default(false),
    shuffleOptions: z.boolean().optional().default(false),
    startTime: z.string().datetime({ message: 'Invalid start time format' }),
    endTime: z.string().datetime({ message: 'Invalid end time format' }),
    assignedStudents: z.array(z.string()).optional().default([]),
    resultPublicationMode: z.enum(['auto', 'manual']).optional().default('manual'),
    questionIds: z.array(z.string()).optional().default([])
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'End time must be after start time',
    path: ['endTime']
  });

const updateExaminationSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().optional(),
    subject: z.string().trim().min(2).optional(),
    instructions: z.string().trim().optional(),
    duration: z.number().int().positive().optional(),
    passingMarks: z.number().min(0).optional(),
    negativeMarkingEnabled: z.boolean().optional(),
    shuffleQuestions: z.boolean().optional(),
    shuffleOptions: z.boolean().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    assignedStudents: z.array(z.string()).optional(),
    resultPublicationMode: z.enum(['auto', 'manual']).optional(),
    questionIds: z.array(z.string()).optional()
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime']
    }
  );

const listExaminationsQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
  status: z.enum(['draft', 'scheduled', 'live', 'completed', 'results_published', 'cancelled']).optional(),
  subject: z.string().optional(),
  search: z.string().optional()
});

module.exports = {
  createExaminationSchema,
  updateExaminationSchema,
  listExaminationsQuerySchema
};

