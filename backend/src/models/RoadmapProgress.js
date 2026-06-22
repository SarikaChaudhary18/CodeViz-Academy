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
    type: [Number], // Indices of completed nodes, e.g. [0, 1]
    default: [0],   // First node (index 0) is unlocked/completed by default
  },
}, {
  timestamps: true,
});

// Prevent duplicate progress entries per user per roadmap
RoadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

module.exports = mongoose.model('RoadmapProgress', RoadmapProgressSchema);
