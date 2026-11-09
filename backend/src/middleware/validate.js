/**
 * Factory function for Zod schema validation middleware.
 * Validates req.body, req.query, or req.params.
 * 
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} [target='body']
 */
function validate(schema, target = 'body') {
  return (req, res, next) => {
    try {
      const dataToValidate = req[target];
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            fields: fieldErrors
          }
        });
      }

      // Replace target with parsed/sanitized data (coerced types, defaults, etc.)
      req[target] = result.data;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { validate };

