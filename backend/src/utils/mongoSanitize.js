/**
 * Sanitizes an object recursively by removing keys containing '$' or '.'
 * to prevent NoSQL query injection.
 */
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      obj[key] = sanitize(obj[key]);
    }
  }

  return obj;
}

/**
 * Express middleware for NoSQL injection prevention
 */
function mongoSanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    sanitize(req.body);
  }
  if (req.params && typeof req.params === 'object') {
    sanitize(req.params);
  }
  if (req.query && typeof req.query === 'object') {
    // Note: in Express 5 req.query might be configurable or getter, so mutate properties directly
    try {
      sanitize(req.query);
    } catch {
      // Ignore if immutable
    }
  }
  next();
}

module.exports = { mongoSanitizeMiddleware, sanitize };
