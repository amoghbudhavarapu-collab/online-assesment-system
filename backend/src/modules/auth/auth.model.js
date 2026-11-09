const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    refreshTokenHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically removes expired sessions
    },
    revokedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Session = mongoose.model('Session', sessionSchema);

module.exports = { Session };

