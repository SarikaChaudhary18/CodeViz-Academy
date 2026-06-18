const mongoose = require('mongoose');

const HackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  host: {
    type: String,
    required: true,
    trim: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    index: true,
  },
  registrationDeadline: {
    type: Date,
    default: null,
  },
  tags: [String],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hackathon', HackathonSchema);
