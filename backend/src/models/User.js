const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  xp: {
    type: Number,
    default: 0,
    index: true, // For leaderboard queries
  },
  level: {
    type: Number,
    default: 1,
    index: true,
  },
  streak: {
    type: Number,
    default: 0,
    index: true,
  },
  lastActiveDate: {
    type: String, // YYYY-MM-DD
    default: null,
  },
  targetRole: {
    type: String,
    default: 'Software Engineer',
  },
  targetCompany: {
    type: String,
    default: 'Google',
  },
  codingProfiles: {
    leetcode: { type: String, default: '' },
    codechef: { type: String, default: '' },
    codeforces: { type: String, default: '' },
    hackerrank: { type: String, default: '' },
  },
  apifyKey: {
    type: String,
    default: '',
  },
  savedResumeText: {
    type: String,
    default: '',
  },
  aiUsageToday: {
    type: Number,
    default: 0,
  },
  lastAiRequestDate: {
    type: String, // YYYY-MM-DD
    default: null,
  },
  bookmarkedRoadmaps: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,
});

// Compound index for profile verification and search
UserSchema.index({ username: 1, email: 1 });

module.exports = mongoose.model('User', UserSchema);
