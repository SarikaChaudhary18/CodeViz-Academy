const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  lessonsCount: {
    type: Number,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  instructor: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  youtubePlaylistUrl: {
    type: String,
    default: '',
  },
  videos: [{
    videoId: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, default: '' },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);
