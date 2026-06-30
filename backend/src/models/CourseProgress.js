const mongoose = require('mongoose');

const CourseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  watchedVideos: [{
    type: String, // videoId
  }],
  progressPercent: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Compound index to guarantee uniqueness of user-course mapping
CourseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', CourseProgressSchema);
