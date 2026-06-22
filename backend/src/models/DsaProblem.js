const mongoose = require('mongoose');

const DsaProblemSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  link: {
    type: String,
  },
  youtube: {
    type: String,
  },
  article: {
    type: String,
  },
  sheetType: {
    type: String,
    enum: ['striver', 'babbar', 'neetcode'],
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    }
  ],
  constraints: {
    type: String,
    default: '',
  },
  templates: {
    cpp: String,
    java: String,
    python: String,
    javascript: String,
  },
  testCases: [
    {
      input: String,
      expectedOutput: String,
    }
  ],
  editorial: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DsaProblem', DsaProblemSchema);
