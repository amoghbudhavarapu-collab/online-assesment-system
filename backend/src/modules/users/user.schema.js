const { z } = require('zod');

const listUsersQuerySchema = z.object({
  page: z.string().optional().default('1').transform((val) => Math.max(1, parseInt(val, 10) || 1)),
  limit: z.string().optional().default('20').transform((val) => Math.min(100, Math.max(1, parseInt(val, 10) || 20))),
  role: z.enum(['admin', 'teacher', 'student']).optional(),
  search: z.string().optional(),
  isActive: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined))
});

const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  role: z.enum(['admin', 'teacher', 'student']).optional()
});

const updateStatusSchema = z.object({
  isActive: z.boolean({ required_error: 'isActive is required' })
});

const updateOwnProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters')
});

module.exports = {
  listUsersQuerySchema,
  updateUserSchema,
  updateStatusSchema,
  updateOwnProfileSchema
};
