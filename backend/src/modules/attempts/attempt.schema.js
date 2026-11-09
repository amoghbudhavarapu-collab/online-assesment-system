const { z } = require('zod');

const saveAnswerSchema = z.object({
  selectedAnswer: z.any().optional(),
  isMarkedForReview: z.boolean().optional().default(false)
});

module.exports = {
  saveAnswerSchema
};

