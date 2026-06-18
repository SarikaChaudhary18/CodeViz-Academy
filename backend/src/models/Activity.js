const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['study', 'focus', 'dsa', 'quiz'],
    required: true,
  },
  value: {
    type: Number, // Minutes for study/focus, count for dsa
    required: true,
  },
  xpGained: {
    type: Number,
    required: true,
  },
  date: {
    type: String, // format: YYYY-MM-DD
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound index for querying user activity history (e.g. heatmap calendar)
ActivitySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
