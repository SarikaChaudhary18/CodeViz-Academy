const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  roadmapId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  sourceUrl: {
    type: String,
    default: '',
  },
  nodes: [
    {
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        default: '',
      },
      quiz: {
        question: {
          type: String,
          required: true,
        },
        options: {
          type: [String],
          required: true,
        },
        answer: {
          type: Number, // Index of correct option (0-3)
          required: true,
        },
      },
      quizzes: [
        {
          question: {
            type: String,
            required: true,
          },
          options: {
            type: [String],
            required: true,
          },
          answer: {
            type: Number,
            required: true,
          },
          explanation: {
            type: String,
            default: '',
          },
        }
      ],
      capstone: {
        type: String,
        required: true,
      },
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
