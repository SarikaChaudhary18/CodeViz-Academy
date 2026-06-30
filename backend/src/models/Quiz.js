const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  topic: {
    type: String, // e.g. 'dsa', 'frontend', 'backend', 'ai', 'ml'
    required: true,
    index: true,
  },
  questionsCount: {
    type: Number,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  questions: [{
    q: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: Number, required: true },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', QuizSchema);
