const mongoose = require('mongoose');

/**
 * Asserts that a resource exists and belongs to the given user.
 * If user is an admin and allowAdmin is true, allows access.
 * Always throws a 404 error if not found or unauthorized to prevent ID enumeration.
 * 
 * @param {mongoose.Model} ModelClass - Mongoose model
 * @param {string} resourceId - Document ID
 * @param {string} userId - User ID to verify against
 * @param {object} [options]
 * @param {string} [options.ownerField='createdBy'] - Field representing the owner (e.g. createdBy, studentId, userId)
 * @param {boolean} [options.allowAdmin=false] - Whether admin role can bypass ownership
 * @param {string} [options.userRole=''] - The current user's role
 * @param {object} [options.populate] - Populate configuration
 * @returns {Promise<Document>}
 */
async function assertOwnership(
  ModelClass,
  resourceId,
  userId,
  options = {}
) {
  const {
    ownerField = 'createdBy',
    allowAdmin = false,
    userRole = '',
    populate = null
  } = options;

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  let query;
  if (allowAdmin && userRole === 'admin') {
    query = ModelClass.findById(resourceId);
  } else {
    query = ModelClass.findOne({
      _id: resourceId,
      [ownerField]: userId
    });
  }

  if (populate) {
    query = query.populate(populate);
  }

  const doc = await query.exec();

  if (!doc) {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    err.code = 'NOT_FOUND';
    throw err;
  }

  return doc;
}

module.exports = { assertOwnership };
