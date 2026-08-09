const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true // Hashed version stored
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdByIp: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  revokedAt: {
    type: Date
  },
  replacedByToken: {
    type: String
  }
}, { timestamps: true });

// Virtual for checking if token is expired
refreshTokenSchema.virtual('isExpired').get(function() {
  return Date.now() >= this.expiresAt;
});

// Virtual for checking if token is active
refreshTokenSchema.virtual('isActive').get(function() {
  return !this.revokedAt && !this.isExpired;
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
