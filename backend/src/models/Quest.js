const mongoose = require('mongoose');

const QuestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true,
    index: true,
  },
  xpReward: {
    type: Number,
    required: true,
  },
  multiplier: {
    type: Number,
    default: 1.0,
  },
  targetValue: {
    type: Number,
    required: true,
  },
  key: {
    type: String, // e.g. "solve_dsa_problems", "study_pomodoro"
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quest', QuestSchema);
