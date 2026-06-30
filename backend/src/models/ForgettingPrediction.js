const mongoose = require('mongoose');

const ForgettingPredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  topicName: {
    type: String,
    required: true,
  },
  lastReviewed: {
    type: Date,
    default: Date.now,
  },
  interval: {
    type: Number, // Spaced repetition interval in days
    default: 1,   // Default to 1 day review
  },
  easeFactor: {
    type: Number, // SM-2 ease factor (defaults to 2.5)
    default: 2.5,
  },
  repetitions: {
    type: Number, // Successive successful reviews
    default: 1,
  },
}, {
  timestamps: true,
});

// Unique topic tracking per user
ForgettingPredictionSchema.index({ userId: 1, topicName: 1 }, { unique: true });

module.exports = mongoose.model('ForgettingPrediction', ForgettingPredictionSchema);
