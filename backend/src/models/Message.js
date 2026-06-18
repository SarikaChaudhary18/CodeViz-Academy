const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  codeSnippet: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index for retrieving community message history sorted by time
MessageSchema.index({ communityId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
