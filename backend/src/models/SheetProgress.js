const mongoose = require('mongoose');

const SheetProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sheetType: {
    type: String,
    enum: ['striver', 'babbar', 'neetcode'],
    required: true,
  },
  problemId: {
    type: String, // String representation of the problem identifier
    required: true,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed'],
    default: 'completed',
  },
  solvedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Avoid duplicate completions and index queries
SheetProgressSchema.index({ userId: 1, sheetType: 1, problemId: 1 }, { unique: true });

module.exports = mongoose.model('SheetProgress', SheetProgressSchema);
