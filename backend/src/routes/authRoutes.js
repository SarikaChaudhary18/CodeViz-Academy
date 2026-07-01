const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.post('/google', authLimiter, authController.googleAuth);
router.post('/passwordless', authLimiter, authController.passwordlessAuth);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

router.get('/leaderboard', authController.getLeaderboard);

// Connection & Study Buddy Endpoints
router.get('/users', authenticate, authController.getPeers);
router.post('/connect/:userId', authenticate, authController.sendConnectionRequest);
router.post('/connect/accept/:senderId', authenticate, authController.acceptConnectionRequest);
router.post('/connect/reject/:senderId', authenticate, authController.rejectConnectionRequest);

// Notification Endpoints
router.get('/notifications', authenticate, authController.getNotifications);
router.post('/notifications/read', authenticate, authController.markNotificationsRead);

module.exports = router;

