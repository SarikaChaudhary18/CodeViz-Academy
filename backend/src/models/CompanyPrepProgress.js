const mongoose = require('mongoose');

const CompanyPrepProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  completedQuestions: {
    type: [Number], // Array of question numbers (Question Number column in CSV)
    default: [],
  },
  starredQuestions: {
    type: [Number], // Array of question numbers
    default: [],
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('CompanyPrepProgress', CompanyPrepProgressSchema);
