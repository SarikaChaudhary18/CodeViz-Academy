const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const { authenticate } = require('../middleware/auth');

router.get('/stats', authenticate, trackerController.getPlatformStats);

module.exports = router;
