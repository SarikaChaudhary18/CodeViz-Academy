const mongoose = require('mongoose');

const RoadmapProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  roadmapId: {
    type: String,
    required: true,
  },
  completedNodes: {
    type: [String], // Array of completed nodeIds (or node indices as strings)
    default: [],
  },
  currentNode: {
    type: String,
    default: '',
  },
  completionPercentage: {
    type: Number,
    default: 0,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  badges: {
    type: [String],
    default: [],
  },
  lastVisitedNode: {
    type: String,
    default: '',
  },
  lastVisitedAt: {
    type: Date,
    default: null,
  },
  completedProjects: {
    type: [String], // NodeIds of completed capstones/mini projects
    default: [],
  },
  quizScore: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Prevent duplicate progress entries per user per roadmap
RoadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

module.exports = mongoose.model('RoadmapProgress', RoadmapProgressSchema);
