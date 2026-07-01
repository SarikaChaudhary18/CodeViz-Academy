const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['friend_request', 'friend_accepted'],
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  message: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Compound index for fast unread notifications query per user
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
