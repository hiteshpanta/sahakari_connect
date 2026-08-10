const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    cooperative: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cooperative',
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ''
    },
    review: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ''
    },
    // Mark whether the reviewer is an approved member of this cooperative
    isMember: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['published', 'hidden'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

// One rating per user per cooperative
ratingSchema.index({ cooperative: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
