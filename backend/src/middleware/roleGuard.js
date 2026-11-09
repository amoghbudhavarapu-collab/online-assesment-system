/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * Checks if req.user has one of the allowed roles.
 * 
 * @param  {...string} allowedRoles - e.g. 'admin', 'teacher', 'student'
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions to perform this action'
        }
      });
    }

    next();
  };
}

module.exports = { roleGuard };
